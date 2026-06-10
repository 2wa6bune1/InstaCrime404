// ======================================================
// instagramDM.js
// ======================================================
// 변경 요약:
//  - 메시지마다 day: N 필드로 일차 게이팅 (1일차엔 day<=1 메시지만 표시, 3일차엔 day<=3 모두 표시)
//  - 기본 채팅 데이터 내장: [여행 멤버들 단톡방] + [최지안 DM]
//  - 채팅방 시간(time) 도 마지막 가시 메시지의 일차로 자동 계산
//  - 중복 메서드 정리 (room / openDMList / openChatRoom)
//  - 일차 자동 탐색: dateManager.currentDay / day / dayCount 등.
//    안 잡히면 instagramUI.dm.setDay(n) 으로 강제 가능.
// ======================================================
class InstagramDM {
  constructor(parentUI) {
    this.ui = parentUI; // InstagramUI 객체 참조
    this.dmScrollY = 0;
    this.dmTargetScrollY = 0;
    this.chatScrollY = 0;
    this.chatTargetScrollY = 0;
    this.currentChatRoom = 0;
    this.chatInputText = "";
    this.chatCursorBlink = 0;
    this._chatPressed = false;
    this._chatDragDist = 0;
    this._chatDragMode = null;
    this.chatRooms = [];
    this._forcedDay = undefined; // setDay(n) 으로 강제 지정 가능

    // 기본 데이터 자동 로드 (외부에서 loadChatData(...) 호출하면 덮어씀)
    this.loadChatData();
  }

  // ============================================================
  //  채팅 데이터
  // ============================================================
  loadChatData(chatData) {
    if (chatData && Array.isArray(chatData) && chatData.length > 0) {
      this.chatRooms = chatData;
    } else {
      this.chatRooms = this._getDefaultChatData();
    }
    for (let i = 0; i < this.chatRooms.length; i++) {
      this.normalizeChatRoom(this.chatRooms[i]);
    }
  }

  _getDefaultChatData() {
    return [
      // ============================================================
      // [1] 여행 멤버들 단톡방 ─ 1일차(서아 실종) + 3일차(최지안 비난)
      // ============================================================
      {
        name: "여행 멤버들",
        isGroup: true,
        users: ["박서아", "강하은", "이서준", "정수아", "최지안"],
        unread: true,
        seen: false,
        messages: [
          // ── 1일차 ────────────────────────────────────
          { day: 1, separator: "1일차" },
          { day: 1, sender: "정수아", text: "다들 뉴스 봤어?" },
          { day: 1, sender: "강하은", text: "…." },
          { day: 1, sender: "강하은", text: "봤어" },
          { day: 1, sender: "정수아", text: "사실 아직도 안믿겨" },
          { day: 1, sender: "이서준", text: "서아" },
          { day: 1, sender: "이서준", text: "연락되는 사람 없지?" },
          { day: 1, sender: "정수아", text: "그때 여행하다가" },
          { day: 1, sender: "정수아", text: "먼저 집에 갔었잖아 서아가" },
          { day: 1, sender: "강하은", text: "나도 그때부터 연락이 안돼.." },
          { day: 1, sender: "최지안", text: "서준아 힘내…" },

          // ── 3일차 ────────────────────────────────────
          { day: 3, separator: "3일차" },
          { day: 3, sender: "이서준", text: "지안아 너 진짜 뭐야" },
          { day: 3, sender: "최지안", text: "?" },
          { day: 3, sender: "최지안", text: "왱" },
          { day: 3, sender: "강하은", text: "이틀 전에는 오곡동이더니 어제는 문래동, 오늘은 삼성동까지 갔다왔네ㅋㅋ" },
          { day: 3, text: "너가 사람이냐", sent: true },                     // 주인공
          { day: 3, text: "어떻게 친구가 죽었는데 그래", sent: true },        // 주인공
          { day: 3, sender: "이서준", text: "나만 힘든거야 지금?" },
          { day: 3, text: "최소한 스토리에는 티내지 마라", sent: true },       // 주인공
          { day: 3, text: "보기 거북하다", sent: true },                      // 주인공
          { day: 3, sender: "이서준", text: "부산 갔다온 것부터 화났는데 이건 아니지" },
          { day: 3, sender: "최지안", text: "미안해 내가 생각이 짧았어 맛집에 정신이 팔려서 .." },
          { day: 3, sender: "강하은", text: "스토리는 내리는 게 좋을듯" },
          // ※ 원문엔 "정수아(?) 응..! 내릴게" 였는데 맥락상 자기 스토리를 내리는 사람은 최지안
          { day: 3, sender: "최지안", text: "응..! 내릴게" },
        ],
      },

      // ============================================================
      // [2] 최지안 DM ─ 1일차 (단톡방의 무거운 분위기 뒤, 가벼운 맛집 얘기)
      // ============================================================
      {
        name: "최지안",
        isGroup: false,
        users: ["최지안"],
        avatarColor: [90, 180, 180],
        unread: true,
        seen: false,
        messages: [
          { day: 1, separator: "1일차" },
          { day: 1, text: "오 지안이 오곡동 맛집 갔네!", sent: true },      // 주인공
          { day: 1, text: "스토리 봄 ㅋㄱㅋㅋ", sent: true },                // 주인공
          { day: 1, sender: "최지안", text: "맞아 진짜 맛집이었어!" },
          { day: 1, sender: "최지안", text: "추천 땡큐 ㅎㅎ" },
          { day: 1, text: "ㅋㄱㅋㅋ굿", sent: true },                        // 주인공
          { day: 1, sender: "최지안", text: "하도 맛있다고 하길래 갔다왔어 ㅎㅎ" },
        ],
      },
    ];
  }

  // ============================================================
  //  일차 게이팅
  // ============================================================
  _getCurrentDay() {
    if (this._forcedDay !== undefined) return this._forcedDay;
    if (typeof dateManager !== "undefined" && dateManager) {
      for (let key of ["currentDay", "day", "dayCount", "currentDayIndex"]) {
        if (typeof dateManager[key] === "number") return dateManager[key];
      }
    }
    if (typeof currentDay !== "undefined" && typeof currentDay === "number") return currentDay;
    if (typeof day !== "undefined" && typeof day === "number") return day;
    return 1; // 기본값: 1일차 (chat 시작점)
  }

  // 강제 설정 (테스트 / 스크립트 제어용)
  setDay(d) { this._forcedDay = d; }

  // 현재 일차에 보일 메시지만 (separator 포함)
  _getVisibleMessages(room) {
    if (!room || !room.messages) return [];
    let curDay = this._getCurrentDay();
    let out = [];
    for (let m of room.messages) {
      let md = (typeof m.day === "number") ? m.day : 1;
      if (md <= curDay) out.push(m);
    }
    return out;
  }

  // 채팅방에 표시할 실제 메시지(separator 제외)가 하나라도 있으면 visible
  _isRoomVisible(room) {
    if (!room) return false;
    let vis = this._getVisibleMessages(room);
    for (let m of vis) if (!m.separator) return true;
    return false;
  }

  _getVisibleRooms() {
    return this.chatRooms.filter(r => this._isRoomVisible(r));
  }

  // 채팅방 시간 표기 (마지막 가시 메시지의 일차 기준)
  _getRoomDisplayTime(room) {
    let visible = this._getVisibleMessages(room);
    let last = null;
    for (let i = visible.length - 1; i >= 0; i--) {
      if (!visible[i].separator) { last = visible[i]; break; }
    }
    if (!last) return "";
    let lastDay = (typeof last.day === "number") ? last.day : 1;
    let diff = this._getCurrentDay() - lastDay;
    if (diff <= 0) return "방금";
    if (diff === 1) return "어제";
    return diff + "일";
  }

  // ============================================================
  //  생명주기 (update / display / handleClick / handleWheel)
  // ============================================================
  update(appMouse) {
    // 채팅방 진입 시 독백 재생
    if (this.ui.currentScreen === "chatRoom") {
      let currentChat = this.chatRooms[this.currentChatRoom];
      if (currentChat && currentChat.monoText && !currentChat.monoPlayed) {
        if (typeof monologue !== "undefined") {
          monologue.start(currentChat.monoText);
          currentChat.monoPlayed = true;
        }
      }
    }
    this.chatCursorBlink += deltaTime;
    this.updateChatScroll(appMouse);
  }

  display(appMouse) {
    if (this.ui.currentScreen === "dmList") {
      this.displayDMList(appMouse);
    } else if (this.ui.currentScreen === "chatRoom") {
      this.displayChatRoom(appMouse);
    }
  }

  handleClick(mx, my) {
    if (this.ui.currentScreen === "dmList") {
      this.handleDMListClick(mx, my);
    } else if (this.ui.currentScreen === "chatRoom") {
      this.handleChatRoomClick(mx, my);
    }
  }

  handleWheel(event) {
    if (this.ui.currentScreen === "dmList") {
      this.dmTargetScrollY = constrain(this.dmTargetScrollY + event.deltaY * 0.7, 0, this.getDMMaxScroll());
    } else if (this.ui.currentScreen === "chatRoom") {
      this.chatTargetScrollY = constrain(this.chatTargetScrollY + event.deltaY * 0.7, 0, this.getChatMaxScroll());
    }
  }

  // ============================================================
  //  채팅방 기본 동작
  // ============================================================
  getUnreadCount() {
    let n = 0;
    for (let r of this._getVisibleRooms()) if (r.unread) n++;
    return n;
  }

  room() {
    return this.chatRooms[this.currentChatRoom];
  }

  openDMList() {
    this.ui.currentScreen = "dmList";
    this.dmTargetScrollY = 0;
    this.dmScrollY = 0;
  }

  openChatRoom(index) {
    this.currentChatRoom = index;
    let room = this.chatRooms[index];
    if (!room) return;
    room.unread = false;
    this.ui.currentScreen = "chatRoom";
    this.chatInputText = "";
    this.chatTargetScrollY = this.getChatMaxScroll();
    this.chatScrollY = this.chatTargetScrollY;
  }

  sendMessage(txt) {
    if (!txt) return;
    let room = this.room();
    if (!room) return;
    if (!room.messages) room.messages = [];
    // 새 메시지는 현재 일차로 기록
    room.messages.push({ day: this._getCurrentDay(), text: txt, sent: true });
    room.seen = false;
    this.chatInputText = "";
    this.chatTargetScrollY = 1e9;
  }

  getDMMaxScroll() {
    let itemH = 72;
    let visibleCount = this._getVisibleRooms().length;
    let contentH = 112 + visibleCount * itemH + 12;
    return max(0, contentH - this.ui.h);
  }

  getChatMaxScroll() {
    let headerH = 70, inputH = 60;
    let viewH = this.ui.h - headerH - inputH;
    let total = this.layoutChatMessages().totalH;
    return max(0, total - viewH);
  }

  updateChatScroll(appMouse) {
    const scaleFactor = (typeof phone !== "undefined") ? phone.scale : 1;
    const isChat = this.ui.currentScreen === "chatRoom";
    let maxScroll = isChat ? this.getChatMaxScroll() : this.getDMMaxScroll();

    if (mouseIsPressed && !this._chatPressed) {
      this._chatPressed = true;
      this._chatDragDist = 0;
      this._chatDragMode = (appMouse && appMouse.y > 112) ? (isChat ? "chat" : "dm") : null;
    }
    if (!mouseIsPressed) {
      this._chatPressed = false;
      this._chatDragMode = null;
    }

    if (mouseIsPressed && this._chatDragMode) {
      let dy = movedY / scaleFactor;
      this._chatDragDist += abs(movedY);
      if (isChat) this.chatTargetScrollY -= dy;
      else this.dmTargetScrollY -= dy;
    }

    if (isChat) {
      this.chatTargetScrollY = constrain(this.chatTargetScrollY, 0, maxScroll);
      this.chatScrollY = lerp(this.chatScrollY, this.chatTargetScrollY, 0.25);
    } else {
      this.dmTargetScrollY = constrain(this.dmTargetScrollY, 0, maxScroll);
      this.dmScrollY = lerp(this.dmScrollY, this.dmTargetScrollY, 0.25);
    }
  }

  handleDMListClick(mx, my) {
    if (mx < 52 && my < 60) { this.ui.currentScreen = "feed"; return; }
    if (this._chatDragDist > 6) return;

    let visibleRooms = this._getVisibleRooms();
    let listTop = 112, itemH = 72;
    let y0 = listTop - this.dmScrollY;
    for (let i = 0; i < visibleRooms.length; i++) {
      let top = y0 + i * itemH;
      if (my > Math.max(top, 112) && my < top + itemH) {
        // 보이는 인덱스 → 원래 chatRooms 인덱스로 변환
        let originalIndex = this.chatRooms.indexOf(visibleRooms[i]);
        this.openChatRoom(originalIndex);
        return;
      }
    }
  }

  handleChatRoomClick(mx, my) {
    if (mx < 52 && my < 60) { this.ui.currentScreen = "dmList"; return; }
    let inputH = 60, y = this.ui.h - inputH;
    if (my > y) {
      if (mx > this.ui.w - 72) {
        let t = this.chatInputText.trim();
        if (t.length) this.sendMessage(t);
        else this.sendMessage("❤️");
      }
    }
  }

  // ============================================================
  //  유저 / 발화자 처리
  // ============================================================
  resolveUser(userOrKey) {
    if (!userOrKey) return null;
    if (typeof userOrKey === "object" && typeof userOrKey.displayProfile === "function") {
      return userOrKey;
    }
    if (typeof userOrKey === "string") {
      if (typeof dateManager !== "undefined" && dateManager.users && dateManager.users[userOrKey]) {
        return dateManager.users[userOrKey];
      }
    }
    return null;
  }

  getRoomMembers(room) {
    let raw = room.users || room.members || [];
    let members = [];
    for (let i = 0; i < raw.length; i++) {
      let u = this.resolveUser(raw[i]);
      if (u) members.push(u);
    }
    return members;
  }

  normalizeChatRoom(room) {
    if (!room.messages) room.messages = [];

    // 단체 채팅 멤버 이름 자동 생성
    if (room.isGroup && !room.memberNames) {
      room.memberNames = [];
      let raw = room.users || room.members || [];
      for (let i = 0; i < raw.length; i++) {
        if (typeof raw[i] === "string") {
          room.memberNames.push(raw[i]);
        } else if (raw[i] && raw[i].name) {
          room.memberNames.push(raw[i].name);
        }
      }
    }

    // 단톡방이 아닌데 user 가 없으면 첫 users 항목으로 자동 매핑
    if (!room.isGroup && !room.user) {
      let raw = room.users || room.members || [];
      if (raw.length > 0) {
        room.user = this.resolveUser(raw[0]);
      }
    }

    // 메시지 방향 정리
    for (let i = 0; i < room.messages.length; i++) {
      let m = room.messages[i];
      if (m.separator) continue;
      let hasSender = m.user || m.sender || m.senderName || m.userKey;
      if (m.sent === undefined) m.sent = !hasSender;
      if (hasSender) m.sent = false;
    }
  }

  getMessageInfo(m, room) {
    if (!m) {
      return {
        sent: true,
        user: this.resolveUser("주인공"),
        name: "나",
        color: [70, 120, 245]
      };
    }
    let hasSender = m.user || m.sender || m.senderName || m.userKey;
    let isMine = m.sent === true || (!hasSender && m.sent !== false);
    if (isMine) {
      return {
        sent: true,
        user: this.resolveUser("주인공"),
        name: "나",
        color: [70, 120, 245]
      };
    }
    let senderKey = m.sender || m.senderName || m.userKey || "";
    let user = this.resolveUser(m.user) || this.resolveUser(senderKey) || room.user || null;
    let info = null;
    if (this.ui && typeof this.ui.getSenderInfo === "function") {
      info = this.ui.getSenderInfo(senderKey);
    }
    if (!user && info && info.user) user = info.user;
    let displayName = m.senderName || m.sender || (user && user.name) || room.name || "?";
    let color = m.color || (info && info.color) || room.avatarColor || [130, 130, 140];
    return { sent: false, user, name: displayName, color };
  }

  // ============================================================
  //  아바타 그리기
  // ============================================================
  drawUserProfile(user, x, y, sz, fallbackName = "?") {
    if (user && typeof user.displayProfile === "function") {
      user.displayProfile(x, y, sz);
      return;
    }
    noStroke();
    fill(80);
    circle(x, y, sz);
    fill(255);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(sz * 0.42);
    text(String(fallbackName).charAt(0), x, y + 1);
    textStyle(NORMAL);
  }

  drawGroupAvatar(room, x, y, sz) {
    let members = this.getRoomMembers(room);
    noStroke();
    fill(35);
    circle(x, y, sz);

    if (members.length === 0) {
      fill(90);
      circle(x, y, sz * 0.82);
      fill(255);
      textAlign(CENTER, CENTER);
      textStyle(BOLD);
      textSize(sz * 0.35);
      text(room.name ? room.name.charAt(0) : "G", x, y + 1);
      textStyle(NORMAL);
      return;
    }

    let count = min(members.length, 4);
    let d = count === 1 ? sz * 0.82 : sz * 0.55;
    let positions = [];

    if (count === 1) {
      positions = [{ x: x, y: y }];
    } else if (count === 2) {
      positions = [
        { x: x - sz * 0.16, y: y },
        { x: x + sz * 0.16, y: y }
      ];
    } else if (count === 3) {
      positions = [
        { x: x, y: y - sz * 0.17 },
        { x: x - sz * 0.18, y: y + sz * 0.16 },
        { x: x + sz * 0.18, y: y + sz * 0.16 }
      ];
    } else {
      positions = [
        { x: x - sz * 0.16, y: y - sz * 0.16 },
        { x: x + sz * 0.16, y: y - sz * 0.16 },
        { x: x - sz * 0.16, y: y + sz * 0.16 },
        { x: x + sz * 0.16, y: y + sz * 0.16 }
      ];
    }

    for (let i = 0; i < count; i++) {
      let p = positions[i];
      noStroke();
      fill(20);
      circle(p.x, p.y, d + 4);
      this.drawUserProfile(members[i], p.x, p.y, d, "?");
    }

    if (members.length > 4) {
      fill(0, 170);
      circle(x + sz * 0.22, y + sz * 0.22, d);
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(10);
      textStyle(BOLD);
      text("+" + (members.length - 4), x + sz * 0.22, y + sz * 0.22);
      textStyle(NORMAL);
    }
  }

  drawChatAvatar(room, x, y, sz) {
    if (room.isGroup) {
      this.drawGroupAvatar(room, x, y, sz);
      return;
    }
    if (room.user && room.user.displayProfile) {
      room.user.displayProfile(x, y, sz);
      return;
    }
    let c = room.avatarColor || [110, 110, 110];
    noStroke();
    fill(c[0], c[1], c[2]);
    circle(x, y, sz);
    fill(255);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(sz * 0.42);
    text(room.name ? room.name.charAt(0) : "?", x, y + 1);
    textStyle(NORMAL);
  }

  // ============================================================
  //  DM 목록 화면
  // ============================================================
  displayDMList(appMouse) {
    const w = this.ui.w, h = this.ui.h;
    let visibleRooms = this._getVisibleRooms();

    push();
    drawingContext.save();
    this.ui.createRectClip(0, 112, w, h - 112);

    if (visibleRooms.length === 0) {
      noStroke();
      fill(160);
      textAlign(CENTER, CENTER);
      textStyle(BOLD);
      textSize(16);
      text("아직 대화가 없어요", w / 2, h / 2 - 14);
      fill(110);
      textStyle(NORMAL);
      textSize(12.5);
      text("새 메시지가 오면 여기에 표시됩니다", w / 2, h / 2 + 10);
    } else {
      let topY = 112 - this.dmScrollY;
      for (let i = 0; i < visibleRooms.length; i++) {
        let y = topY + i * 72;
        if (y > h || y + 72 < 100) continue;
        this.drawDMRoom(visibleRooms[i], y, 72, appMouse);
      }
    }
    drawingContext.restore();
    pop();

    // 상단 헤더
    fill(20);
    noStroke();
    rect(0, 0, w, 112, 25, 25, 0, 0);

    let backHover = appMouse && dist(appMouse.x, appMouse.y, 24, 30) < 22;
    stroke(255);
    strokeWeight(2.4);
    noFill();
    strokeJoin(ROUND);
    strokeCap(ROUND);
    push();
    translate(22, 30);
    if (backHover) scale(1.15);
    line(6, -8, -4, 0);
    line(-4, 0, 6, 8);
    pop();

    let myName = this.ui.currentAccount === "main" ? "주인공" : "의문의_X";
    noStroke();
    fill(255);
    textAlign(LEFT, CENTER);
    textStyle(BOLD);
    textSize(19);
    text(myName, 50, 30);
    let nameW = textWidth(myName);
    stroke(255);
    strokeWeight(2);
    noFill();
    line(50 + nameW + 9, 27, 50 + nameW + 14, 32);
    line(50 + nameW + 14, 32, 50 + nameW + 19, 27);

    stroke(255);
    strokeWeight(2);
    noFill();
    strokeJoin(ROUND);
    push();
    translate(w - 28, 30);
    rect(-9, -9, 18, 18, 4);
    line(-1, 1, 6, -6);
    pop();

    noStroke();
    fill(38);
    rect(15, 64, w - 30, 34, 12);
    push();
    translate(34, 81);
    stroke(150);
    strokeWeight(2);
    noFill();
    circle(0, 0, 11);
    line(4, 4, 8, 8);
    pop();
    noStroke();
    fill(140);
    textAlign(LEFT, CENTER);
    textStyle(NORMAL);
    textSize(13);
    text("검색", 50, 82);

    stroke(45);
    strokeWeight(1);
    line(0, 112, w, 112);
  }

  drawDMRoom(room, y, itemH, appMouse) {
    const w = this.ui.w;
    let cy = y + itemH / 2;
    let hover = appMouse && appMouse.y > Math.max(y, 112) && appMouse.y < y + itemH;
    if (hover) {
      noStroke();
      fill(255, 12);
      rect(0, y, w, itemH);
    }

    let ax = 42;
    this.drawChatAvatar(room, ax, cy, 52);

    // 활동 중 표시 (1:1 채팅만)
    if (room.active && !room.isGroup) {
      noStroke();
      fill(20);
      circle(ax + 18, cy + 17, 16);
      fill(80, 220, 120);
      circle(ax + 18, cy + 17, 11);
    }

    let tx = ax + 40;
    noStroke();
    fill(255);
    textAlign(LEFT, BASELINE);
    textSize(15);
    textStyle(room.unread ? BOLD : NORMAL);
    text(room.name, tx, cy - 2);

    // 마지막 가시 메시지 (separator 제외)
    let last = null;
    let visibleMsgs = this._getVisibleMessages(room);
    for (let i = visibleMsgs.length - 1; i >= 0; i--) {
      if (visibleMsgs[i].separator) continue;
      last = visibleMsgs[i];
      break;
    }

    // 미리보기
    let preview = "";
    if (last) {
      let msgInfo = this.getMessageInfo(last, room);
      if (msgInfo.sent) {
        preview = "나: " + last.text;
      } else if (room.isGroup) {
        preview = msgInfo.name + ": " + last.text;
      } else {
        preview = last.text;
      }
    }
    if (preview.length > 22) preview = preview.slice(0, 22) + "…";

    textSize(13);
    textStyle(room.unread ? BOLD : NORMAL);
    fill(room.unread ? 240 : 150);
    text(preview, tx, cy + 16);
    let pw = textWidth(preview);

    // 시간 (마지막 메시지의 일차 기준 자동 계산, room.time 있으면 우선)
    let timeText = room.time || this._getRoomDisplayTime(room);
    textStyle(NORMAL);
    fill(120);
    text("  ·  " + timeText, tx + pw, cy + 16);

    // 안읽음 = 파란 점 / 읽음 = 카메라 아이콘
    if (room.unread) {
      noStroke();
      fill(40, 130, 255);
      circle(w - 28, cy, 11);
    } else {
      push();
      translate(w - 28, cy);
      stroke(120);
      strokeWeight(1.6);
      noFill();
      strokeJoin(ROUND);
      rect(-9, -5, 18, 13, 4);
      circle(0, 1.5, 7);
      line(-4, -5, -2, -8);
      line(-2, -8, 2, -8);
      line(2, -8, 4, -5);
      pop();
    }
    textStyle(NORMAL);
  }

  // ============================================================
  //  채팅방 (메시지 레이아웃 + 렌더링)
  // ============================================================
  wrapText(str, maxW) {
    str = String(str);
    push();
    textSize(14);
    textStyle(NORMAL);
    textFont("Arial");
    let lines = [], cur = "", lastSpace = -1;
    for (let i = 0; i < str.length; i++) {
      let ch = str[i];
      if (ch === "\n") {
        lines.push(cur);
        cur = "";
        lastSpace = -1;
        continue;
      }
      cur += ch;
      if (ch === " ") lastSpace = cur.length - 1;
      if (textWidth(cur) > maxW) {
        if (lastSpace > 0) {
          lines.push(cur.slice(0, lastSpace));
          cur = cur.slice(lastSpace + 1);
        } else {
          lines.push(cur.slice(0, -1));
          cur = ch;
        }
        lastSpace = -1;
      }
    }
    if (cur.length) lines.push(cur);
    if (!lines.length) lines.push("");
    pop();
    return lines;
  }

  layoutChatMessages() {
    const w = this.ui.w;
    let room = this.room();
    let isGroup = room && room.isGroup;

    // 항상 왼쪽 아바타 공간 확보
    let avatarSlot = 36;
    let maxBubbleW = (w - avatarSlot) * 0.7;

    let padX = 14, padY = 10, lineH = 19, gap = 6, topPad = 14;
    let nameH = 16, sepH = 30;

    textSize(14);
    textStyle(NORMAL);
    textFont("Arial");

    let items = [];
    let y = topPad;
    let prevKey = null;

    // ★ 현재 일차에 보일 메시지만 사용
    let msgs = this._getVisibleMessages(room);

    for (let i = 0; i < msgs.length; i++) {
      let m = msgs[i];

      if (m.separator) {
        items.push({ type: "separator", text: m.separator, top: y, height: sepH });
        y += sepH;
        prevKey = null;
        continue;
      }

      let info = this.getMessageInfo(m, room);
      let key = info.sent ? "__me" : info.name;
      let sameAsPrev = key === prevKey;
      let showName = isGroup && !info.sent && !sameAsPrev;

      if (sameAsPrev) y -= 2;
      else if (prevKey !== null) y += 2;
      if (showName) y += nameH;

      let lines = this.wrapText(m.text, maxBubbleW - padX * 2);
      let maxLineW = 0;
      for (let ln of lines) maxLineW = max(maxLineW, textWidth(ln));
      let bw = min(maxBubbleW, maxLineW + padX * 2);
      let bh = lines.length * lineH + padY * 2;

      items.push({
        type: "bubble",
        sender: info.name,
        user: info.user,
        color: info.color,
        sent: info.sent,
        lines, bw, bh,
        top: y,
        showName,
        showAvatar: !info.sent,
      });

      y += bh + gap;
      prevKey = key;
    }

    if (room && room.seen) y += 16;

    return { items, totalH: y + 8, avatarSlot, isGroup, padX, padY, lineH };
  }

  displayChatRoom(appMouse) {
    const w = this.ui.w, h = this.ui.h;
    let headerH = 70, inputH = 60;

    push();
    drawingContext.save();
    this.ui.createRectClip(0, headerH, w, h - headerH - inputH);

    let layout = this.layoutChatMessages();
    let padX = layout.padX, padY = layout.padY, lineH = layout.lineH;
    let baseY = headerH + 6 - this.chatScrollY;
    let lastSent = null;
    let avatarSlot = layout.avatarSlot;

    for (let it of layout.items) {
      let y = baseY + it.top;

      if (it.type === "separator") {
        if (y > h || y + it.height < headerH) continue;
        stroke(60); strokeWeight(1);
        line(20, y + it.height / 2, w / 2 - 36, y + it.height / 2);
        line(w / 2 + 36, y + it.height / 2, w - 20, y + it.height / 2);
        noStroke(); fill(150);
        textAlign(CENTER, CENTER); textStyle(NORMAL); textSize(11);
        text(it.text, w / 2, y + it.height / 2);
        continue;
      }

      if (it.sent) lastSent = { it, y };
      if (y > h || y + it.bh < headerH) continue;

      // 단톡방 ─ 발화자 이름
      if (it.showName) {
        noStroke(); fill(it.color[0], it.color[1], it.color[2]);
        textAlign(LEFT, BASELINE); textStyle(NORMAL); textSize(11);
        text(it.sender || "", 15 + avatarSlot + 6, y - 4);
      }

      let bx;
      noStroke();
      if (it.sent) {
        bx = w - 15 - it.bw;
        fill(70, 120, 245);   // 파란 말풍선 (주인공)
      } else {
        bx = 15 + avatarSlot;
        fill(48);             // 회색 말풍선 (상대)
      }
      rect(bx, y, it.bw, it.bh, 18);

      fill(255);
      textAlign(LEFT, CENTER); textStyle(NORMAL); textSize(14);
      for (let li = 0; li < it.lines.length; li++) {
        let centerY = y + padY + lineH / 2 + li * lineH;
        text(it.lines[li], bx + padX, centerY - 1.5);
      }

      // 상대 메시지 옆 프로필
      if (it.showAvatar) {
        let cax = 15 + 13;
        let cay = y + it.bh - 13;
        this.drawUserProfile(it.user, cax, cay, 26, it.sender);
      }
    }

    // "읽음" — 가시 메시지의 마지막이 내가 보낸 거고 seen=true 일 때만
    let visMsgs = this._getVisibleMessages(this.room());
    let lastRealMsg = null;
    for (let i = visMsgs.length - 1; i >= 0; i--) {
      if (!visMsgs[i].separator) { lastRealMsg = visMsgs[i]; break; }
    }
    if (this.room().seen && lastSent && lastRealMsg && this.getMessageInfo(lastRealMsg, this.room()).sent) {
      noStroke(); fill(150);
      textAlign(RIGHT, TOP); textStyle(NORMAL); textSize(11);
      text("읽음", w - 16, lastSent.y + lastSent.it.bh + 3);
    }

    drawingContext.restore();
    pop();

    this.drawChatHeader(appMouse, headerH);
    this.drawChatInput(appMouse, inputH);
  }

  drawChatHeader(appMouse, headerH) {
    const w = this.ui.w;
    let room = this.room();
    fill(20); noStroke();
    rect(0, 0, w, headerH, 25, 25, 0, 0);

    let backHover = appMouse && dist(appMouse.x, appMouse.y, 20, 35) < 22;
    stroke(255); strokeWeight(2.4); noFill(); strokeJoin(ROUND); strokeCap(ROUND);
    push(); translate(20, 35); if (backHover) scale(1.15);
    line(6, -8, -4, 0); line(-4, 0, 6, 8);
    pop();

    this.drawChatAvatar(room, 56, 35, 38);
    if (room.active && !room.isGroup) {
      noStroke(); fill(20); circle(56 + 13, 35 + 13, 12);
      fill(80, 220, 120); circle(56 + 13, 35 + 13, 8);
    }

    noStroke(); fill(255);
    textAlign(LEFT, BASELINE); textStyle(BOLD); textSize(15);

    let memberCount = 0;
    if (room.isGroup) {
      memberCount = this.getRoomMembers(room).length;
      if (memberCount === 0 && room.memberNames) memberCount = room.memberNames.length;
    }
    let hasSub = (room.active && !room.isGroup) || (room.isGroup && memberCount > 0);
    text(room.name, 84, hasSub ? 32 : 40);

    if (room.active && !room.isGroup) {
      fill(150); textStyle(NORMAL); textSize(11);
      text(room.activeText || "활동 중", 84, 48);
    } else if (room.isGroup && memberCount > 0) {
      fill(150); textStyle(NORMAL); textSize(11);
      text(memberCount + "명", 84, 48);
    }

    stroke(255); strokeWeight(2); noFill(); strokeJoin(ROUND);
    push(); translate(w - 92, 35); rectMode(CENTER);
    rect(0, 0, 13, 19, 3); line(-3, 7, 3, 7);
    pop();
    rectMode(CORNER);
    push(); translate(w - 56, 35);
    rect(-9, -6, 13, 12, 3);
    noStroke(); fill(255); triangle(5, -4, 5, 4, 10, 0);
    pop();
    stroke(255); strokeWeight(2); noFill();
    push(); translate(w - 22, 35);
    circle(0, 0, 18);
    noStroke(); fill(255);
    circle(0, -4, 2.4); rect(-1, -1, 2, 8, 1);
    pop();

    stroke(45); strokeWeight(1); line(0, headerH, w, headerH);
    textStyle(NORMAL);
  }

  drawChatInput(appMouse, inputH) {
    const w = this.ui.w, h = this.ui.h;
    let y = h - inputH;
    fill(20); noStroke();
    rect(0, y, w, inputH, 0, 0, 25, 25);
    stroke(45); strokeWeight(1); line(0, y, w, y);

    noStroke(); fill(60, 120, 255);
    circle(28, y + inputH / 2, 34);
    stroke(255); strokeWeight(1.6); noFill(); strokeJoin(ROUND);
    push(); translate(28, y + inputH / 2);
    rect(-7, -4, 14, 9, 3); circle(0, 1.5, 6);
    line(-4, -4, -2, -7); line(-2, -7, 2, -7); line(2, -7, 4, -4);
    pop();

    let px = 50, pw = w - 50 - 14, ph = 38, py = y + (inputH - ph) / 2;
    noStroke(); fill(36);
    rect(px, py, pw, ph, 19);

    textAlign(LEFT, CENTER); textSize(14); textStyle(NORMAL);
    let showCursor = (this.chatCursorBlink % 1000) < 500;
    if (this.chatInputText.length) {
      let t = this.chatInputText;
      while (textWidth(t) > pw - 70 && t.length) t = t.slice(1);
      fill(255);
      text(t + (showCursor ? "|" : ""), px + 16, py + ph / 2 - 1);
      fill(70, 130, 255);
      textAlign(RIGHT, CENTER); textStyle(BOLD);
      text("보내기", w - 22, py + ph / 2 - 1);
    } else {
      fill(130);
      text("메시지...", px + 16, py + ph / 2 - 1);
      fill(255); textAlign(CENTER, CENTER); textSize(20); textStyle(NORMAL);
      text("♡", w - 32, py + ph / 2);
    }
    textStyle(NORMAL);
  }
}

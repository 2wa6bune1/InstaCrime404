// ======================================================
// instagramDM.js
// ======================================================
class InstagramDM {
  constructor(parentUI) {
    this.ui = parentUI; // InstagramUI 객체 참조 (w, h 등 화면 크기 사용)
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

    // DM 상단 계정명 클릭 시 열리는 인스타그램식 계정 전환 시트
    this.accountSwitcherOpen = false;

    // 부계정 진입 시 잠깐 보여줄 비밀번호 입력창 상태
    this.passwordPromptOpen = false;
    this.closePasswordPromptWhenMonoEnds = false;
  }

  loadChatData(chatData) {
    if (chatData && Array.isArray(chatData)) {
      this.chatRooms = chatData;
    } else {
      this.chatRooms = [];
    }

    for (let i = 0; i < this.chatRooms.length; i++) {
      this.normalizeChatRoom(this.chatRooms[i]);
    }
  }

  update(appMouse) {
    // 채팅방 진입 시 독백 실행 처리
    if (this.ui.currentScreen === "chatRoom") {
      let currentChat = this.chatRooms[this.currentChatRoom];
      if (currentChat && currentChat.monoText && !currentChat.monoPlayed) {
        monologue.start(currentChat.monoText);
        currentChat.monoPlayed = true;
      }
    }

    if (
      this.passwordPromptOpen &&
      this.closePasswordPromptWhenMonoEnds &&
      typeof monologue !== "undefined" &&
      !monologue.active
    ) {
      this.passwordPromptOpen = false;
      this.closePasswordPromptWhenMonoEnds = false;
      this.ui.currentScreen = "dmList";
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

  getUnreadCount() {
    let n = 0;
    for (let r of this.chatRooms) if (r.unread) n++;
    return n;
  }

  room() {
    return this.chatRooms[this.currentChatRoom];
  }

  openDMList() {
    this.accountSwitcherOpen = false;
    this.passwordPromptOpen = false;
    this.closePasswordPromptWhenMonoEnds = false;
    this.ui.currentScreen = "dmList";
    this.dmTargetScrollY = 0;
    this.dmScrollY = 0;
  }

  openChatRoom(index) {
    this.accountSwitcherOpen = false;
    this.currentChatRoom = index;
    let room = this.chatRooms[index];
    room.unread = false;
    this.ui.currentScreen = "chatRoom";
    this.chatInputText = "";
    this.chatTargetScrollY = this.getChatMaxScroll();
    this.chatScrollY = this.chatTargetScrollY;
  }

  sendMessage(txt) {
    if (!txt) return;
    let room = this.room();
    if (!room.messages) room.messages = [];
    room.messages.push({ text: txt, sent: true });
    room.seen = false;
    room.time = "지금";
    this.chatInputText = "";
    this.chatTargetScrollY = 1e9;
  }

  getDMMaxScroll() {
    let itemH = 72;
    let contentH = 112 + this.chatRooms.length * itemH + 12;
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
    if (this.passwordPromptOpen) return;

    if (mx < 52 && my < 60) {
      this.accountSwitcherOpen = false;
      this.ui.currentScreen = "feed";
      return;
    }

    // DM 상단 계정명/화살표 클릭: 인스타그램식 계정 전환 시트를 먼저 엽니다.
    if (this.isAccountNameClicked(mx, my)) {
      this.accountSwitcherOpen = !this.accountSwitcherOpen;
      return;
    }

    if (this.accountSwitcherOpen) {
      if (this.handleAccountSwitcherClick(mx, my)) return;
      this.accountSwitcherOpen = false;
      return;
    }

    if (this._chatDragDist > 6) return;

    let listTop = 112, itemH = 72;
    let y0 = listTop - this.dmScrollY;
    for (let i = 0; i < this.chatRooms.length; i++) {
      let top = y0 + i * itemH;
      if (my > Math.max(top, 112) && my < top + itemH) { this.openChatRoom(i); return; }
    }
  }

  handleChatRoomClick(mx, my) {
    if (mx < 52 && my < 60) { this.ui.currentScreen = "dmList"; return; }
    let inputH = 60, y = this.ui.h - inputH;
    if (my > y) {
      if (mx > this.ui.w - 72) {
        let t = this.chatInputText.trim();
        if (t.length) this.sendMessage(t);
      }
    }
  }

  resolveUser(userOrKey) {
    if (!userOrKey) return null;

    // 이미 User 객체가 들어온 경우
    if (typeof userOrKey === "object" && typeof userOrKey.displayProfile === "function") {
      return userOrKey;
    }

    // "최지안" 같은 문자열 키가 들어온 경우
    if (typeof userOrKey === "string") {
      if (
        typeof dateManager !== "undefined" &&
        dateManager.users &&
        dateManager.users[userOrKey]
      ) {
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

    // 메시지 기본 방향 정리
    for (let i = 0; i < room.messages.length; i++) {
      let m = room.messages[i];
      if (m.separator) continue;

      let hasSender =
        m.user ||
        m.sender ||
        m.senderName ||
        m.userKey;

      // sent가 아예 없고, 보낸 유저도 없으면 플레이어 채팅으로 처리
      if (m.sent === undefined) {
        m.sent = !hasSender;
      }

      // 보낸 유저가 있으면 상대방 채팅
      if (hasSender) {
        m.sent = false;
      }
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

    let hasSender =
      m.user ||
      m.sender ||
      m.senderName ||
      m.userKey;

    // sent:true 이거나, 유저 정보가 없고 sent:false도 아니면 플레이어 채팅
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
    let user =
      this.resolveUser(m.user) ||
      this.resolveUser(senderKey) ||
      room.user ||
      null;

    let info = null;
    if (this.ui && typeof this.ui.getSenderInfo === "function") {
      info = this.ui.getSenderInfo(senderKey);
    }

    if (!user && info && info.user) {
      user = info.user;
    }

    let displayName =
      m.senderName ||
      m.sender ||
      (user && user.name) ||
      room.name ||
      "?";

    let color =
      m.color ||
      (info && info.color) ||
      room.avatarColor ||
      [130, 130, 140];

    return {
      sent: false,
      user,
      name: displayName,
      color
    };
  }

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

      // 프로필 사이에 테두리처럼 보이게 배경 원 먼저 그림
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

  displayDMList(appMouse) {
    const w = this.ui.w, h = this.ui.h;

    push();
    drawingContext.save();
    this.ui.createRectClip(0, 112, w, h - 112);

    if (this.chatRooms.length === 0) {
      noStroke(); fill(160);
      textAlign(CENTER, CENTER); textStyle(BOLD); textSize(16);
      text("아직 대화가 없어요", w / 2, h / 2 - 14);
      fill(110); textStyle(NORMAL); textSize(12.5);
      text("새 메시지가 오면 여기에 표시됩니다", w / 2, h / 2 + 10);
    } else {
      let topY = 112 - this.dmScrollY;
      for (let i = 0; i < this.chatRooms.length; i++) {
        let y = topY + i * 72;
        if (y > h || y + 72 < 100) continue;
        this.drawDMRoom(this.chatRooms[i], y, 72, appMouse);
      }
    }
    drawingContext.restore();
    pop();

    // 상단 헤더
    fill(20); noStroke();
    rect(0, 0, w, 112, 25, 25, 0, 0);

    let backHover = appMouse && dist(appMouse.x, appMouse.y, 24, 30) < 22;
    stroke(255); strokeWeight(2.4); noFill(); strokeJoin(ROUND); strokeCap(ROUND);
    push(); translate(22, 30); if (backHover) scale(1.15);
    line(6, -8, -4, 0); line(-4, 0, 6, 8);
    pop();

    let myName =
      (this.ui && typeof this.ui.getCurrentAccountName === "function")
        ? this.ui.getCurrentAccountName()
        : (this.ui.currentAccount === "main" ? "주인공" : "last.frame_");
    noStroke(); fill(255);
    textAlign(LEFT, CENTER); textStyle(BOLD); textSize(19);
    text(myName, 50, 30);
    let nameW = textWidth(myName);
    stroke(255); strokeWeight(2); noFill();
    line(50 + nameW + 9, 27, 50 + nameW + 14, 32);
    line(50 + nameW + 14, 32, 50 + nameW + 19, 27);

    stroke(255); strokeWeight(2); noFill(); strokeJoin(ROUND);
    push(); translate(w - 28, 30);
    rect(-9, -9, 18, 18, 4);
    line(-1, 1, 6, -6);
    pop();

    noStroke(); fill(38);
    rect(15, 64, w - 30, 34, 12);
    push(); translate(34, 81);
    stroke(150); strokeWeight(2); noFill();
    circle(0, 0, 11); line(4, 4, 8, 8);
    pop();
    noStroke(); fill(140);
    textAlign(LEFT, CENTER); textStyle(NORMAL); textSize(13);
    text("검색", 50, 82);

    stroke(45); strokeWeight(1); line(0, 112, w, 112);

    this.drawAccountSwitcher(appMouse);
    this.drawPasswordPrompt(appMouse);
  }

  getDisplayedAccountName() {
    if (this.ui && typeof this.ui.getCurrentAccountName === "function") {
      return this.ui.getCurrentAccountName();
    }
    return this.ui.currentAccount === "main" ? "주인공" : "last.frame_";
  }

  getPlayerAccountName() {
    if (this.ui && typeof this.ui.getPlayerAccountName === "function") {
      return this.ui.getPlayerAccountName();
    }
    return "주인공";
  }

  getSubAccountName() {
    if (this.ui && typeof this.ui.getSubAccountName === "function") {
      return this.ui.getSubAccountName();
    }
    return "last.frame_";
  }

  isAccountNameClicked(mx, my) {
    if (my < 8 || my > 54 || mx < 48) return false;

    push();
    textSize(19);
    textStyle(BOLD);
    let nameW = textWidth(this.getDisplayedAccountName());
    pop();

    return mx <= 50 + nameW + 40;
  }

  getAccountSwitcherLayout() {
    let sheetH = 258;
    return {
      x: 0,
      y: this.ui.h - sheetH,
      w: this.ui.w,
      h: sheetH,
      rowH: 64
    };
  }

  handleAccountSwitcherClick(mx, my) {
    let layout = this.getAccountSwitcherLayout();

    // 시트 바깥을 누르면 닫기
    if (mx < layout.x || mx > layout.x + layout.w || my < layout.y || my > layout.y + layout.h) {
      return false;
    }

    let firstRowY = layout.y + 72;
    let secondRowY = firstRowY + layout.rowH;

    if (my >= firstRowY && my < firstRowY + layout.rowH) {
      this.ui.currentAccount = "main";
      this.accountSwitcherOpen = false;
      return true;
    }

    if (my >= secondRowY && my < secondRowY + layout.rowH) {
      this.openSubAccountPasswordPrompt();
      return true;
    }

    return true;
  }

  getPlayerAccountUser() {
    if (typeof dateManager !== "undefined" && dateManager && dateManager.users) {
      return dateManager.users["주인공"] || null;
    }
    return null;
  }

  getSubAccountUser() {
    if (typeof dateManager !== "undefined" && dateManager && dateManager.users) {
      return dateManager.users["부계"] || dateManager.users["의문의_X"] || null;
    }
    return null;
  }

  openSubAccountPasswordPrompt() {
    this.accountSwitcherOpen = false;
    this.passwordPromptOpen = true;
    this.closePasswordPromptWhenMonoEnds = true;
    this.ui.currentAccount = "main";
    this.ui.currentScreen = "dmList";

    if (typeof monologue !== "undefined" && monologue) {
      monologue.start("비밀번호가 뭐지...? 아니 무엇보다 이 계정이 왜 내 폰에 로그인 되어있는거야?");
    }
  }

  drawAccountSwitcher(appMouse) {
    if (!this.accountSwitcherOpen) return;

    let layout = this.getAccountSwitcherLayout();

    noStroke();
    fill(0, 125);
    rect(0, 0, this.ui.w, this.ui.h);

    fill(24);
    rect(layout.x, layout.y, layout.w, layout.h, 26, 26, 0, 0);

    noStroke();
    fill(95);
    rect(this.ui.w / 2 - 22, layout.y + 12, 44, 4, 3);

    fill(255);
    textAlign(CENTER, BASELINE);
    textStyle(BOLD);
    textSize(17);
    text("계정 전환", this.ui.w / 2, layout.y + 43);

    stroke(45);
    strokeWeight(1);
    line(0, layout.y + 60, this.ui.w, layout.y + 60);

    this.drawAccountSwitcherRow(
      layout.x,
      layout.y + 72,
      layout.w,
      layout.rowH,
      this.getPlayerAccountName(),
      "현재 계정",
      this.getPlayerAccountUser(),
      this.ui.currentAccount === "main",
      appMouse
    );

    this.drawAccountSwitcherRow(
      layout.x,
      layout.y + 72 + layout.rowH,
      layout.w,
      layout.rowH,
      this.getSubAccountName(),
      "부계정",
      this.getSubAccountUser(),
      false,
      appMouse
    );

    stroke(45);
    strokeWeight(1);
    line(18, layout.y + 72 + layout.rowH * 2 + 8, this.ui.w - 18, layout.y + 72 + layout.rowH * 2 + 8);

    fill(70, 130, 255);
    noStroke();
    textAlign(CENTER, BASELINE);
    textStyle(BOLD);
    textSize(14);
    text("기존 계정으로 로그인", this.ui.w / 2, layout.y + layout.h - 32);

    textStyle(NORMAL);
  }

  drawAccountSwitcherRow(x, y, w, h, title, subtitle, user, selected, appMouse) {
    let hover = appMouse && appMouse.x >= x && appMouse.x <= x + w && appMouse.y >= y && appMouse.y <= y + h;

    if (hover) {
      noStroke();
      fill(255, 13);
      rect(x + 10, y + 4, w - 20, h - 8, 14);
    }

    let profileX = x + 42;
    let profileY = y + h / 2;

    if (user && typeof user.displayProfile === "function") {
      user.displayProfile(profileX, profileY, 42);
    } else {
      noStroke();
      fill(55);
      circle(profileX, profileY, 42);
      fill(95);
      circle(profileX, profileY, 34);
    }

    fill(255);
    noStroke();
    textAlign(LEFT, BASELINE);
    textStyle(BOLD);
    textSize(14);
    text(title, x + 74, y + 29);

    fill(150);
    textStyle(NORMAL);
    textSize(12);
    text(subtitle, x + 74, y + 47);

    if (selected) {
      noFill();
      stroke(70, 130, 255);
      strokeWeight(2.2);
      circle(x + w - 34, profileY, 22);
      noStroke();
      fill(70, 130, 255);
      textAlign(CENTER, CENTER);
      textStyle(BOLD);
      textSize(13);
      text("✓", x + w - 34, profileY);
    }

    textStyle(NORMAL);
  }

  drawPasswordPrompt(appMouse) {
    if (!this.passwordPromptOpen) return;

    const w = this.ui.w;
    const h = this.ui.h;
    let boxW = 300;
    let boxH = 190;
    let boxX = (w - boxW) / 2;
    let boxY = 185;

    noStroke();
    fill(0, 165);
    rect(0, 0, w, h);

    fill(32);
    stroke(90);
    strokeWeight(1);
    rect(boxX, boxY, boxW, boxH, 18);

    noStroke();
    fill(255);
    textAlign(CENTER, BASELINE);
    textStyle(BOLD);
    textSize(18);
    text("비밀번호 입력", w / 2, boxY + 42);

    fill(165);
    textStyle(NORMAL);
    textSize(12);
    text("@" + this.getSubAccountName(), w / 2, boxY + 66);

    fill(20);
    stroke(80);
    strokeWeight(1);
    rect(boxX + 28, boxY + 88, boxW - 56, 44, 12);

    noStroke();
    fill(120);
    textAlign(LEFT, CENTER);
    textSize(13);
    text("비밀번호", boxX + 44, boxY + 110);

    fill(170);
    textAlign(CENTER, BASELINE);
    textSize(11);
    text("로그인이 중단되었습니다", w / 2, boxY + 160);
  }

  drawDMRoom(room, y, itemH, appMouse) {
    const w = this.ui.w;
    let cy = y + itemH / 2;
    let hover = appMouse && appMouse.y > Math.max(y, 112) && appMouse.y < y + itemH;
    if (hover) { noStroke(); fill(255, 12); rect(0, y, w, itemH); }

    let ax = 42;
    this.drawChatAvatar(room, ax, cy, 52);
    if (room.active) {
      noStroke(); fill(20); circle(ax + 18, cy + 17, 16);
      fill(80, 220, 120); circle(ax + 18, cy + 17, 11);
    }

    let tx = ax + 40;
    noStroke(); fill(255);
    textAlign(LEFT, BASELINE); textSize(15);
    textStyle(room.unread ? BOLD : NORMAL);
    text(room.name, tx, cy - 2);

    let last = null;
    if (room.messages) {
      for (let i = room.messages.length - 1; i >= 0; i--) {
        if (room.messages[i].separator) continue;
        last = room.messages[i]; break;
      }
    }
    
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
    textStyle(NORMAL); fill(120);
    text("  ·  " + room.time, tx + pw, cy + 16);

    if (room.unread) {
      noStroke(); fill(40, 130, 255);
      circle(w - 28, cy, 11);
    } else {
      push(); translate(w - 28, cy);
      stroke(120); strokeWeight(1.6); noFill(); strokeJoin(ROUND);
      rect(-9, -5, 18, 13, 4);
      circle(0, 1.5, 7);
      line(-4, -5, -2, -8); line(-2, -8, 2, -8); line(2, -8, 4, -5);
      pop();
    }
    textStyle(NORMAL);

      if (room.active && !room.isGroup) {
      noStroke(); fill(20); circle(ax + 18, cy + 17, 16);
      fill(80, 220, 120); circle(ax + 18, cy + 17, 11);
    }
  }

  // 💡 수학적으로 길이를 계산해 박스가 글씨를 완벽하게 감싸도록 폰트 환경 강제 초기화
  wrapText(str, maxW) {
    str = String(str);
    push();
    textSize(14); textStyle(NORMAL); textFont("Arial");
    let lines = [], cur = "", lastSpace = -1;
    for (let i = 0; i < str.length; i++) {
      let ch = str[i];
      if (ch === "\n") { lines.push(cur); cur = ""; lastSpace = -1; continue; }
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

    // 1:1 채팅에서도 상대 프로필을 보여주기 위해 항상 왼쪽 아바타 공간 확보
    let avatarSlot = 36;
    let maxBubbleW = (w - avatarSlot) * 0.7;

    let padX = 14;
    let padY = 10;
    let lineH = 19;
    let gap = 6;
    let topPad = 14;
    let nameH = 16;
    let sepH = 30;

    textSize(14);
    textStyle(NORMAL);
    textFont("Arial");

    let items = [];
    let y = topPad;
    let prevKey = null;
    let msgs = room.messages || [];

    for (let i = 0; i < msgs.length; i++) {
      let m = msgs[i];

      if (m.separator) {
        items.push({
          type: "separator",
          text: m.separator,
          top: y,
          height: sepH
        });

        y += sepH;
        prevKey = null;
        continue;
      }

      let info = this.getMessageInfo(m, room);
      let key = info.sent ? "__me" : info.name;
      let sameAsPrev = key === prevKey;

      // 단체 채팅에서는 상대방 이름 표시
      let showName = isGroup && !info.sent && !sameAsPrev;

      if (sameAsPrev) {
        y -= 2;
      } else if (prevKey !== null) {
        y += 2;
      }

      if (showName) {
        y += nameH;
      }

      let lines = this.wrapText(m.text, maxBubbleW - padX * 2);
      let maxLineW = 0;

      for (let ln of lines) {
        maxLineW = max(maxLineW, textWidth(ln));
      }

      let bw = min(maxBubbleW, maxLineW + padX * 2);
      let bh = lines.length * lineH + padY * 2;

      items.push({
        type: "bubble",
        sender: info.name,
        user: info.user,
        color: info.color,
        sent: info.sent,
        lines,
        bw,
        bh,
        top: y,
        showName,
        // 모든 상대 메시지 옆에 프로필 표시
        showAvatar: !info.sent
      });

      y += bh + gap;
      prevKey = key;
    }

    if (room.seen) y += 16;

    return {
      items,
      totalH: y + 8,
      avatarSlot,
      isGroup,
      padX,
      padY,
      lineH
    };
  }

   displayChatRoom(appMouse) {
    const w = this.ui.w;
    const h = this.ui.h;

    let headerH = 70;
    let inputH = 60;

    push();
    drawingContext.save();
    this.ui.createRectClip(0, headerH, w, h - headerH - inputH);

    let layout = this.layoutChatMessages();
    let padX = layout.padX;
    let padY = layout.padY;
    let lineH = layout.lineH;
    let baseY = headerH + 6 - this.chatScrollY;
    let lastSent = null;
    let avatarSlot = layout.avatarSlot;

    for (let it of layout.items) {
      let y = baseY + it.top;

      if (it.type === "separator") {
        if (y > h || y + it.height < headerH) continue;

        stroke(60);
        strokeWeight(1);
        line(20, y + it.height / 2, w / 2 - 36, y + it.height / 2);
        line(w / 2 + 36, y + it.height / 2, w - 20, y + it.height / 2);

        noStroke();
        fill(150);
        textAlign(CENTER, CENTER);
        textStyle(NORMAL);
        textSize(11);
        text(it.text, w / 2, y + it.height / 2);
        continue;
      }

      if (it.sent) {
        lastSent = { it, y };
      }

      if (y > h || y + it.bh < headerH) continue;

      // 단체 채팅에서 이름 표시
      if (it.showName) {
        noStroke();
        fill(it.color[0], it.color[1], it.color[2]);
        textAlign(LEFT, BASELINE);
        textStyle(NORMAL);
        textSize(11);
        text(it.sender || "", 15 + avatarSlot + 6, y - 4);
      }

      let bx;

      noStroke();

      if (it.sent) {
        // 플레이어 말풍선
        bx = w - 15 - it.bw;
        fill(70, 120, 245);
      } else {
        // 상대방 말풍선
        bx = 15 + avatarSlot;
        fill(48);
      }

      rect(bx, y, it.bw, it.bh, 18);

      fill(255);
      textAlign(LEFT, CENTER);
      textStyle(NORMAL);
      textSize(14);

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

    let allMsgs = this.room().messages || [];
    let lastRealMsg = null;

    for (let i = allMsgs.length - 1; i >= 0; i--) {
      if (!allMsgs[i].separator) {
        lastRealMsg = allMsgs[i];
        break;
      }
    }

    if (this.room().seen && lastSent && lastRealMsg && this.getMessageInfo(lastRealMsg, this.room()).sent) {
      noStroke();
      fill(150);
      textAlign(RIGHT, TOP);
      textStyle(NORMAL);
      textSize(11);
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

      if (memberCount === 0 && room.memberNames) {
        memberCount = room.memberNames.length;
      }
    }

    let hasSub = (room.active && !room.isGroup) || (room.isGroup && memberCount > 0);

    text(room.name, 84, hasSub ? 32 : 40);

    if (room.active && !room.isGroup) {
      fill(150);
      textStyle(NORMAL);
      textSize(11);
      text(room.activeText || "활동 중", 84, 48);
    } else if (room.isGroup && memberCount > 0) {
      fill(150);
      textStyle(NORMAL);
      textSize(11);
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

  handleKeyPressed(k, code) {
    if (this.ui.currentScreen !== "chatRoom") return false;

    if (code === BACKSPACE) {
      this.chatInputText = this.chatInputText.slice(0, -1);
      return true;
    }

    if (code === ENTER) {
      let t = this.chatInputText.trim();
      if (t.length) this.sendMessage(t);
      return true;
    }

    return false;
  }

  handleKeyTyped(k) {
    if (this.ui.currentScreen !== "chatRoom") return false;
    if (!k || k.length !== 1) return false;
    if (k.charCodeAt(0) < 32) return false;
    if (this.chatInputText.length >= 120) return true;

    this.chatInputText += k;
    return true;
  }
}
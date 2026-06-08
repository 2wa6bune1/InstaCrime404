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
  }

  loadChatData(chatData) {
    if (chatData && Array.isArray(chatData)) {
      this.chatRooms = chatData;
    } else {
      this.chatRooms = []; // 데이터가 없으면 빈 배열
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
  room.unread = false; 
  this.ui.currentScreen = "chatRoom";
  this.chatInputText = "";
  this.chatTargetScrollY = this.getChatMaxScroll();
  this.chatScrollY = this.chatTargetScrollY;
}

  openChatRoom(index) {
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
    if (mx < 52 && my < 60) { this.ui.currentScreen = "feed"; return; } 
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
        else this.sendMessage("❤️");
      }
    }
  }

  drawChatAvatar(room, x, y, sz) {
    if (room.user && room.user.displayProfile) {
      room.user.displayProfile(x, y, sz);
      return;
    }
    let c = room.avatarColor || [110, 110, 110];
    noStroke(); fill(c[0], c[1], c[2]); circle(x, y, sz);
    fill(255); textAlign(CENTER, CENTER); textStyle(BOLD); textSize(sz * 0.42);
    text(room.name.charAt(0), x, y + 1);
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

    let myName = this.ui.currentAccount === "main" ? "주인공" : "의문의_X";
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
      if (last.sent) preview = "나: " + last.text;
      else if (room.isGroup && last.sender) preview = last.sender + ": " + last.text;
      else preview = last.text;
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
    let isGroup = this.room().isGroup;
    let avatarSlot = isGroup ? 36 : 0;
    let maxBubbleW = (w - avatarSlot) * 0.7;
    let padX = 14, padY = 10, lineH = 19, gap = 6, topPad = 14;
    let nameH = 16, sepH = 30;

    textSize(14); textStyle(NORMAL); textFont("Arial");
    let items = [];
    let y = topPad;
    let prevKey = null;
    let msgs = this.room().messages || [];

    for (let i = 0; i < msgs.length; i++) {
      let m = msgs[i];
      if (m.separator) {
        items.push({ type: "separator", text: m.separator, top: y, height: sepH });
        y += sepH; prevKey = null; continue;
      }

      let key = m.sent ? "__me" : (m.sender || "_other");
      let sameAsPrev = (key === prevKey);
      let showName = isGroup && !m.sent && !sameAsPrev;

      if (sameAsPrev) y -= 2;
      else if (prevKey !== null) y += 2;
      if (showName) y += nameH;

      let lines = this.wrapText(m.text, maxBubbleW - padX * 2);
      let maxLineW = 0;
      for (let ln of lines) maxLineW = max(maxLineW, textWidth(ln));
      
      let bw = min(maxBubbleW, maxLineW + padX * 2);
      let bh = lines.length * lineH + padY * 2;

      let nextKey = null;
      if (i + 1 < msgs.length) {
        let nm = msgs[i + 1];
        if (!nm.separator) nextKey = nm.sent ? "__me" : (nm.sender || "_other");
      }
      let isLastInRun = (nextKey !== key);

      items.push({
        type: "bubble",
        sender: m.sender, sent: m.sent,
        lines, bw, bh, top: y,
        showName,
        showAvatar: isGroup && !m.sent && isLastInRun,
      });

      y += bh + gap;
      prevKey = key;
    }

    if (this.room().seen) y += 16;
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

      if (it.showName) {
        let info = this.ui.getSenderInfo(it.sender);
        noStroke(); fill(info.color[0], info.color[1], info.color[2]);
        textAlign(LEFT, BASELINE); textStyle(NORMAL); textSize(11);
        text(it.sender || "", 15 + avatarSlot + 6, y - 4);
      }

      let bx;
      noStroke();
      if (it.sent) { bx = w - 15 - it.bw; fill(70, 120, 245); }
      else        { bx = 15 + avatarSlot; fill(48); }
      rect(bx, y, it.bw, it.bh, 18);

      // 💡 텍스트를 박스 Y축 기준으로 수직 중앙 정렬(CENTER)하고 미세 오차(-1.5px)를 빼서 완벽히 맞춤
      fill(255); textAlign(LEFT, CENTER); textStyle(NORMAL); textSize(14);
      for (let li = 0; li < it.lines.length; li++) {
        let centerY = y + padY + (lineH / 2) + (li * lineH);
        text(it.lines[li], bx + padX, centerY - 1.5);
      }

      if (it.showAvatar) {
        let info = this.ui.getSenderInfo(it.sender);
        let cax = 15 + 13, cay = y + it.bh - 13;
        if (info.user && info.user.displayProfile) {
          info.user.displayProfile(cax, cay, 26);
        } else {
          noStroke(); fill(info.color[0], info.color[1], info.color[2]);
          circle(cax, cay, 26);
          fill(255); textAlign(CENTER, CENTER); textStyle(BOLD); textSize(11);
          text((it.sender || "?").charAt(0), cax, cay + 1);
          textStyle(NORMAL);
        }
      }
    }

    let allMsgs = this.room().messages || [];
    let lastRealMsg = null;
    for (let i = allMsgs.length - 1; i >= 0; i--) {
      if (!allMsgs[i].separator) { lastRealMsg = allMsgs[i]; break; }
    }
    if (this.room().seen && lastSent && lastRealMsg && lastRealMsg.sent) {
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
    let hasSub = (room.active && !room.isGroup) || (room.isGroup && room.memberNames);
    text(room.name, 84, hasSub ? 32 : 40);
    if (room.active && !room.isGroup) {
      fill(150); textStyle(NORMAL); textSize(11);
      text(room.activeText || "활동 중", 84, 48);
    } else if (room.isGroup && room.memberNames) {
      fill(150); textStyle(NORMAL); textSize(11);
      text(room.memberNames.length + "명", 84, 48);
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
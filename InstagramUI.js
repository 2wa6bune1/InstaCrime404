// ======================================================
// instagramUI.js
// ======================================================
class InstagramUI {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.currentScreen = "feed";
    this.currentStory = 0;
    this.scrollY = 0;
    this.targetScrollY = 0;
    this.storyScrollX = 0;
    this.targetStoryScrollX = 0;
    this.isDraggingStory = false;
    this.wasMousePressed = false;
    this.dragDistance = 0;
    this.headerH = 65;
    this.storiesH = 105;
    this.bottomNavH = 58;
    this.postStartY = 185;
    this.postGap = 420;
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.nextStoryIndex = 0;
    this.stories = [];
    this.posts = [];
    this.backupStories = null;
    this.storyGroups = [];

    this.storyDuration = 5000;
    this.storyElapsedTime = 0;
    this.isStoryPaused = false;
    this.wasStoryPressed = false;
    this.lastPressedX = 0;
    this.lastPressedY = 0;
    this.ignorePress = false;

    this.isRefreshing = false;
    this.refreshTimer = 0;
    this.refreshThreshold = -70;

    this.storyBuffer = createGraphics(this.w, this.h);
    this.storyBuffer2 = createGraphics(this.w, this.h);
    this.webglBuffer = createGraphics(this.w, this.h, WEBGL);

    this.currentAccount = "main";
    this.lastAccountClickTime = 0;
    this.minDoubleClickDelay = 1;
    this.maxDoubleClickDelay = 500;

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

  loadData(storiesData, postsData) {
    this.stories = storiesData;
    this.posts = postsData;
    this.currentScreen = "feed";
    this.currentStory = 0;
    this.scrollY = 0;
    this.targetScrollY = 0;
    this.storyScrollX = 0;
    this.targetStoryScrollX = 0;
    this.storyElapsedTime = 0;
    this.ignorePress = false;
    this.isRefreshing = false;

    this.storyGroups = [];
    for (let i = 0; i < this.stories.length; i++) {
      let s = this.stories[i];
      let existingGroup = this.storyGroups.find(g => g.name === s.name);
      if (!existingGroup) {
        this.storyGroups.push({ name: s.name, firstIndex: i });
      }
    }
  }

  loadChatData(chatData) {
    this.chatRooms = chatData;
  }

  addMyStory(img, type = "default") {
    if (typeof dateManager === 'undefined' || !dateManager.users["주인공"]) return;

    let myUser = dateManager.users["주인공"];
    let newStory = new Story(myUser, img, "", type);

    this.stories.unshift(newStory);

    this.storyGroups = [];
    for (let i = 0; i < this.stories.length; i++) {
      let s = this.stories[i];
      let existingGroup = this.storyGroups.find(g => g.name === s.name);
      if (!existingGroup) {
        this.storyGroups.push({ name: s.name, firstIndex: i });
      }
    }
  }

  update(appMouse) {
    let maxScroll = this.getMaxScroll();

    if (this.targetScrollY < 0) {
      this.targetScrollY = lerp(this.targetScrollY, 0, 0.15);
    } else if (this.targetScrollY > maxScroll) {
      this.targetScrollY = lerp(this.targetScrollY, maxScroll, 0.15);
    }

    if (mouseIsPressed && !this.isDraggingStory && this.currentScreen === "feed") {
      let scaleFactor = (typeof phone !== 'undefined') ? phone.scale : 1;
      let dy = movedY / scaleFactor;

      if (this.targetScrollY < 0 && dy > 0) dy *= 0.3;
      if (this.targetScrollY > maxScroll && dy < 0) dy *= 0.3;

      if (!this.wasMousePressed) {
        if (appMouse && appMouse.y > 170) this.isDraggingVertical = true;
      }

      if (this.isDraggingVertical) {
        this.targetScrollY -= dy;
        this.targetScrollY = constrain(this.targetScrollY, -130, maxScroll + 130);
      }
    } else {
      this.isDraggingVertical = false;
    }

    this.scrollY = lerp(this.scrollY, this.targetScrollY, 0.22);

    if (this.scrollY < this.refreshThreshold && !this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTimer = frameCount;
    }

    if (this.isRefreshing && frameCount - this.refreshTimer > 90) {
      this.isRefreshing = false;
    }

    let totalStoryIcons = 1 + this.storyGroups.length;
    let maxStoryScroll = max(0, 45 + totalStoryIcons * 85 - this.w + 20);

    if (mouseIsPressed && !this.wasMousePressed) {
      this.dragDistance = 0;
      if (appMouse && appMouse.y > 65 && appMouse.y < 170) {
        this.isDraggingStory = true;
      }
    }

    if (mouseIsPressed && this.isDraggingStory) {
      this.dragDistance += abs(movedX);
      let scaleFactor = (typeof phone !== 'undefined') ? phone.scale : 1;
      this.targetStoryScrollX -= movedX / scaleFactor;
    }

    if (!mouseIsPressed) {
      this.isDraggingStory = false;
    }

    this.wasMousePressed = mouseIsPressed;
    this.targetStoryScrollX = constrain(this.targetStoryScrollX, 0, maxStoryScroll);
    this.storyScrollX = lerp(this.storyScrollX, this.targetStoryScrollX, 0.2);

    if (this.currentScreen === "story") {
      if (this.isTransitioning) {
        this.transitionProgress += 0.05;
        if (this.transitionProgress >= 1) {
          this.isTransitioning = false;
          this.currentStory = this.nextStoryIndex;
          this.transitionProgress = 0;
          this.storyElapsedTime = 0;
        }
      } else {
        let isAppHovered = appMouse && appMouse.x >= 0 && appMouse.x <= this.w && appMouse.y >= 0 && appMouse.y <= this.h;
        let isPressingStoryArea = mouseIsPressed && isAppHovered && appMouse.y >= 80;

        if (isPressingStoryArea) {
          if (!this.ignorePress) {
            this.isStoryPaused = true;
            this.wasStoryPressed = true;
            this.lastPressedX = appMouse.x;
            this.lastPressedY = appMouse.y;
          }
        } else {
          this.ignorePress = false;
          this.isStoryPaused = false;

          if (this.wasStoryPressed) {
            this.checkStoryViewerClick(this.lastPressedX, this.lastPressedY);
            this.wasStoryPressed = false;
          }
        }

        if (!this.isStoryPaused) {
          this.storyElapsedTime += deltaTime;
          if (this.storyElapsedTime >= this.storyDuration) {
            this.handleAutomaticNext();
          }
        }
      }
    }

    if (this.currentScreen === "dmList" || this.currentScreen === "chatRoom") {
      this.updateChatScroll(appMouse);
    }
    this.chatCursorBlink += deltaTime;
  }

  handleAutomaticNext() {
    let prevStory = this.currentStory;
    this.nextStoryIndex = this.currentStory + 1;

    if (this.nextStoryIndex >= this.stories.length) {
      this.currentScreen = "feed";
      this.currentStory = 0;
      this.storyElapsedTime = 0;
    } else {
      if (this.stories[prevStory].name !== this.stories[this.nextStoryIndex].name) {
        this.isTransitioning = true;
        this.transitionProgress = 0;
        this.stories[this.nextStoryIndex].isRead = true;
      } else {
        this.currentStory = this.nextStoryIndex;
        this.stories[this.currentStory].isRead = true;
        this.storyElapsedTime = 0;
      }
    }
  }

  display(appMouse = { x: -999, y: -999 }) {
    fill(20);
    noStroke();
    rect(0, 0, this.w, this.h, 25);

    if (this.currentScreen === "feed") {
      this.displayFeed(appMouse);
    } else if (this.currentScreen === "story") {
      this.displayStoryViewer();
    } else if (this.currentScreen === "storyUpload") {
      if (typeof storyUploader !== "undefined") {
        storyUploader.display(appMouse);
      }
    }
    else if (this.currentScreen === "dmList") {
      this.displayDMList(appMouse);
    } else if (this.currentScreen === "chatRoom") {
      this.displayChatRoom(appMouse);
    }
  }

  displayFeed(appMouse) {
    this.displayScrollableFeed(appMouse);
    this.displayHeader(appMouse);
    this.displayBottomNav(appMouse);
    this.displayScrollBar();
  }

  displayScrollableFeed(appMouse) {
    push();
    drawingContext.save();
    this.createRectClip(0, this.headerH, this.w, this.h - this.headerH - this.bottomNavH);

    if (this.scrollY < 0) {
      push();
      translate(this.w / 2, this.headerH + 30);
      stroke(150, 200, 255);
      strokeWeight(2.5);
      noFill();
      let spinAngle = this.isRefreshing ? (frameCount * 0.1) : map(this.scrollY, 0, this.refreshThreshold, 0, TWO_PI);
      rotate(spinAngle);
      arc(0, 0, 20, 20, 0, PI * 1.5);
      pop();
    }

    translate(0, -this.scrollY);

    let scrolledMouse = { x: appMouse.x, y: appMouse.y + this.scrollY };
    this.displayStories(scrolledMouse);
    this.displayPosts(scrolledMouse);

    drawingContext.restore();
    pop();
  }

  displayHeader(appMouse) {
    fill(30);
    noStroke();
    rect(0, 0, this.w, 65, 25, 25, 0, 0);

    fill(255);
    textSize(25);
    textStyle(BOLD);
    textAlign(LEFT, BASELINE);
    text("Instagram", 18, 42);

    let headerY = 32;
    // 💡 하트 아이콘을 오른쪽 끝(355)으로 이동
    let isHeartHover = appMouse && dist(appMouse.x, appMouse.y, 355, headerY) < 20;

    push();
    translate(355, headerY);
    if (isHeartHover) scale(1.2);
    fill(isHeartHover ? color(255, 150, 150) : 255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(26);
    text("♡", 0, 2);
    pop();

    stroke(50);
    line(0, 64, this.w, 64);
  }

  displayStories(scrolledMouse) {
    fill(30);
    noStroke();
    rect(0, 65, this.w, 105);

    push();
    translate(-this.storyScrollX, 0);

    let localMouseX = scrolledMouse.x + this.storyScrollX;
    let myX = 45;
    let myY = 105;
    let isMyHover = dist(localMouseX, scrolledMouse.y, myX, myY) < 35;

    push();
    translate(myX, myY);
    if (isMyHover) scale(1.1);

    if (typeof dateManager !== 'undefined' && dateManager.users["주인공"]) {
      dateManager.users["주인공"].displayProfile(0, 0, 56);
    }

    push();
    translate(18, 18);
    fill(50, 150, 255);
    stroke(30);
    strokeWeight(3);
    circle(0, 0, 20);
    noStroke();
    fill(255);
    rectMode(CENTER);
    rect(0, 0, 10, 2.5, 1);
    rect(0, 0, 2.5, 10, 1);
    pop();

    fill(isMyHover ? 255 : 220);
    noStroke();
    textAlign(CENTER, BASELINE);
    textSize(11);
    textStyle(NORMAL);
    text("내 스토리", 0, 48);
    pop();

    for (let i = 0; i < this.storyGroups.length; i++) {
      let x = 45 + (i + 1) * 85;
      let y = 105;
      let group = this.storyGroups[i];

      let isHover = dist(localMouseX, scrolledMouse.y, x, y) < 35;

      let isAllRead = true;
      for (let j = 0; j < this.stories.length; j++) {
        if (this.stories[j].name === group.name && !this.stories[j].isRead) {
          isAllRead = false;
          break;
        }
      }

      let firstStory = this.stories[group.firstIndex];
      let tempRead = firstStory.isRead;
      firstStory.isRead = isAllRead;

      push();
      translate(x, y);
      if (isHover) scale(1.1);
      firstStory.displayIcon(0, 0);
      firstStory.isRead = tempRead;

      fill(isHover ? 255 : 220);
      noStroke();
      textAlign(CENTER, BASELINE);
      textSize(11);
      textStyle(NORMAL);
      text(group.name, 0, 48);
      pop();
    }

    pop();
    stroke(50);
    line(0, 170, this.w, 170);
  }

  displayPosts(scrolledMouse) {
    for (let i = 0; i < this.posts.length; i++) {
      let postY = this.postStartY + i * this.postGap;
      this.posts[i].display(postY, this.w, scrolledMouse);
    }
  }

  displayBottomNav(appMouse) {
    fill(30);
    noStroke();
    rect(0, this.h - this.bottomNavH, this.w, this.bottomNavH);
    stroke(50);
    line(0, this.h - this.bottomNavH, this.w, this.h - this.bottomNavH);

    let xs = [40, 115, 195, 275, 350];
    let navY = this.h - (this.bottomNavH / 2);

    for (let i = 0; i < xs.length; i++) {
      let isHover = appMouse.y > this.h - this.bottomNavH && abs(appMouse.x - xs[i]) < 25;

      push();
      translate(xs[i], navY);

      if (isHover) scale(1.2);

      let iconColor = isHover ? color(150, 200, 255) : color(255);
      stroke(iconColor);
      strokeWeight(2);
      noFill();
      strokeJoin(ROUND);

      if (i === 0) {
        beginShape();
        vertex(-8, 1); vertex(0, -7); vertex(8, 1);
        vertex(8, 9); vertex(-8, 9);
        endShape(CLOSE);
      } else if (i === 1) {
        rectMode(CENTER);
        rect(0, 0, 18, 18, 4);
        fill(iconColor);
        noStroke();
        triangle(-2, -4, -2, 4, 4, 0);
      } else if (i === 2) {
        // 💡 하단바 중앙의 종이비행기(DM) 아이콘 부분
        beginShape();
        vertex(-9, 5);
        vertex(8, -8);
        vertex(4, 9);
        vertex(-1, 1);
        endShape(CLOSE);

        // 안읽음 알림을 이곳에 그림
        let unread = this.getUnreadCount();
        if (unread > 0) {
          push();
          noStroke();
          fill(255, 60, 90);
          circle(8, -8, 15);
          fill(255);
          textAlign(CENTER, CENTER);
          textSize(9);
          textStyle(BOLD);
          text(unread > 9 ? "9+" : "" + unread, 8, -7);
          pop();
        }
      } else if (i === 3) {
        circle(-2, -2, 12);
        line(2.5, 2.5, 8, 8);
      } else if (i === 4) {
        let accountUser = this.getCurrentAccountUser();

        if (accountUser) {
          accountUser.displayProfile(0, 0, 24);
        } else {
          circle(0, 0, 20);
          fill(iconColor);
          noStroke();
          circle(0, -3, 7);
          arc(0, 6.5, 14, 11, PI, TWO_PI);
        }
      }
      pop();
    }
  }

  displayScrollBar() {
    let maxScroll = this.getMaxScroll();
    if (maxScroll <= 0) return;
    let trackTop = this.headerH + 8;
    let trackBottom = this.h - this.bottomNavH - 8;
    let trackH = trackBottom - trackTop;
    let barH = max(40, trackH * 0.35);

    let barY = map(constrain(this.scrollY, 0, maxScroll), 0, maxScroll, trackTop, trackBottom - barH);

    noStroke();
    fill(255, 70);
    rect(this.w - 8, barY, 4, barH, 10);
  }

  displayStoryViewer() {
    if (!this.isTransitioning) {
      this.drawStoryToBuffer(this.currentStory, this.storyBuffer);
      image(this.storyBuffer, 0, 0);
    } else {
      this.drawStoryToBuffer(this.currentStory, this.storyBuffer);
      this.drawStoryToBuffer(this.nextStoryIndex, this.storyBuffer2);

      let p = this.transitionProgress;
      let easeP = p * (2 - p);
      let dir = (this.nextStoryIndex > this.currentStory) ? 1 : -1;
      let angle = -easeP * HALF_PI * dir;

      this.webglBuffer.clear();
      this.webglBuffer.background(20);

      this.webglBuffer.push();
      this.webglBuffer.translate(0, 0, -this.w / 2);
      this.webglBuffer.rotateY(angle);

      this.webglBuffer.push();
      this.webglBuffer.translate(0, 0, this.w / 2);
      this.webglBuffer.texture(this.storyBuffer);
      this.webglBuffer.noStroke();
      this.webglBuffer.plane(this.w, this.h);
      this.webglBuffer.pop();

      this.webglBuffer.push();
      if (dir === 1) {
        this.webglBuffer.translate(this.w / 2, 0, 0);
        this.webglBuffer.rotateY(HALF_PI);
      } else {
        this.webglBuffer.translate(-this.w / 2, 0, 0);
        this.webglBuffer.rotateY(-HALF_PI);
      }
      this.webglBuffer.texture(this.storyBuffer2);
      this.webglBuffer.noStroke();
      this.webglBuffer.plane(this.w, this.h);
      this.webglBuffer.pop();

      this.webglBuffer.pop();
      image(this.webglBuffer, 0, 0);
    }
  }

  drawStoryToBuffer(index, g) {
    if (this.stories.length === 0) return;
    let s = this.stories[index];
    g.clear();

    if (s.img) {
      g.image(s.img, 0, 0, this.w, this.h);
    } else {
      g.fill(s.bg);
      g.noStroke();
      g.rect(0, 0, this.w, this.h, 25);
      g.fill(255);
      g.textAlign(CENTER, BASELINE);
      g.textStyle(BOLD);
      g.textSize(30);
      g.text(s.text, this.w / 2, 310);
      g.textSize(15);
      g.textStyle(NORMAL);
      g.text("게임 속 인스타 스토리 화면", this.w / 2, 345);
    }

    let bottomH = 80;
    g.fill(35);
    g.noStroke();
    g.rect(0, this.h - bottomH, this.w, bottomH, 0, 0, 25, 25);

    let userStories = this.stories.filter(story => story.name === s.name);
    let numStories = userStories.length;
    let localIndex = userStories.indexOf(s);

    let padding = 15;
    let gap = 4;
    let totalGapWidth = max(0, (numStories - 1) * gap);
    let availableWidth = this.w - padding * 2;
    let barW = (availableWidth - totalGapWidth) / numStories;

    let currentProgress = 0;
    if (!this.isTransitioning) {
      currentProgress = constrain(this.storyElapsedTime / this.storyDuration, 0, 1);
    } else {
      currentProgress = (index === this.currentStory) ? 1 : 0;
    }

    for (let i = 0; i < numStories; i++) {
      let bx = padding + i * (barW + gap);
      g.fill(255, 100);
      g.noStroke();
      g.rect(bx, 18, barW, 4, 10);

      g.fill(255);
      if (i < localIndex) {
        g.rect(bx, 18, barW, 4, 10);
      } else if (i === localIndex) {
        g.rect(bx, 18, barW * currentProgress, 4, 10);
      }
    }

    if (s.user && typeof s.user.displayProfile === 'function') {
      s.user.displayProfile(32, 48, 32, g);
    }

    g.fill(255);
    g.textAlign(LEFT, BASELINE);
    g.textStyle(BOLD);
    g.textSize(14);
    g.text(s.name, 55, 53);

    let nameW = g.textWidth(s.name);

    g.textStyle(NORMAL);
    g.textSize(13);
    g.fill(170);

    let timeText = "2h";
    let timeX = 55 + nameW + 10;
    let timeY = 53;

    g.text(timeText, timeX, timeY);

    // 친한친구 스토리일 때 시간 옆 초록 별 아이콘
    if (s.type === "friend") {
      let timeW = g.textWidth(timeText);

      let iconX = timeX + timeW + 10;
      let iconY = 39;
      let iconSize = 22;

      // 초록색 둥근 사각형
      g.noStroke();
      g.fill(30, 200, 80);
      g.rect(iconX, iconY, iconSize, iconSize, 6);

      // 흰 별
      g.fill(255);
      g.textAlign(CENTER, CENTER);
      g.textStyle(BOLD);
      g.textSize(14);
      g.text("★", iconX + iconSize / 2, iconY + iconSize / 2 + 1);
    }

    g.noFill();
    g.stroke(255);
    g.strokeWeight(1.5);
    g.rect(20, this.h - 60, 270, 40, 20);

    g.noStroke();
    g.fill(255);
    g.textAlign(LEFT, BASELINE);
    g.textSize(14);
    g.text("메시지 보내기", 38, this.h - 35);

    let storyIconY = this.h - 40;

    g.push();
    g.translate(315, storyIconY);
    g.fill(255);
    g.noStroke();
    g.textAlign(CENTER, CENTER);
    g.textSize(26);
    g.text("♡", 0, 2);
    g.pop();

    g.push();
    g.translate(355, storyIconY);
    g.stroke(255);
    g.strokeWeight(2);
    g.noFill();
    g.strokeJoin(ROUND);
    g.beginShape();
    g.vertex(-9, 5);
    g.vertex(8, -8);
    g.vertex(4, 9);
    g.vertex(-1, 1);
    g.endShape(CLOSE);
    g.pop();

    g.strokeWeight(1);
  }

  changeAccount() {
    if (this.currentAccount === "main") {
      this.currentAccount = "sub";
    } else {
      this.currentAccount = "main";
    }
    this.targetScrollY = 0;
    this.scrollY = 0;
  }

  getCurrentAccountUser() {
    if (typeof dateManager === "undefined") return null;

    if (this.currentAccount === "main") {
      return dateManager.users["주인공"];
    } else {
      return dateManager.users["의문의_X"];
    }
  }

  checkAccountSwitchClick(mx, my) {
    let profileX = 350;
    let profileY = this.h - this.bottomNavH / 2;

    let isProfileButton =
      my > this.h - this.bottomNavH &&
      dist(mx, my, profileX, profileY) < 25;

    if (!isProfileButton) return false;

    let now = millis();
    let clickGap = now - this.lastAccountClickTime;

    if (
      clickGap >= this.minDoubleClickDelay &&
      clickGap <= this.maxDoubleClickDelay
    ) {
      this.changeAccount();
      this.lastAccountClickTime = 0;
    } else {
      this.lastAccountClickTime = now;
    }

    return true;
  }

  handleClick(mx, my) {
    // 💡 하단 네비게이션 바 기능 활성화 (스토리 화면이 아닐 때만)
    if (this.currentScreen !== "story" && this.currentScreen !== "storyUpload") {
      if (my > this.h - this.bottomNavH) {
        // 홈 버튼 (맨 왼쪽) 클릭 시 피드 최상단으로
        if (abs(mx - 40) < 25) {
          this.currentScreen = "feed";
          this.targetScrollY = 0;
          return;
        }
        // DM 버튼 (가운데 종이비행기) 클릭 시 채팅방 목록 오픈
        if (abs(mx - 195) < 25) {
          this.openDMList();
          return;
        }
      }
    }

    if (this.currentScreen === "feed") {
      let contentY = my + this.scrollY;
      this.checkStoryClick(mx, contentY);
      this.checkLikeClick(mx, contentY);

    } else if (this.currentScreen === "story") {
      if (mx > this.w - 50 && my < 80) {
        this.currentScreen = "feed";
        this.storyElapsedTime = 0;
      }
    } else if (this.currentScreen === "storyUpload") {
      if (typeof storyUploader !== "undefined") {
        storyUploader.handleClick(mx, my);
      }
    }
    else if (this.currentScreen === "dmList") {
      this.handleDMListClick(mx, my);
    } else if (this.currentScreen === "chatRoom") {
      this.handleChatRoomClick(mx, my);
    }
  }

  handleWheel(event) {
    if (this.currentScreen === "dmList") {
      this.dmTargetScrollY = constrain(this.dmTargetScrollY + event.deltaY * 0.7, 0, this.getDMMaxScroll());
      return;
    }
    if (this.currentScreen === "chatRoom") {
      this.chatTargetScrollY = constrain(this.chatTargetScrollY + event.deltaY * 0.7, 0, this.getChatMaxScroll());
      return;
    }

    if (this.currentScreen !== "feed") return;

    if (abs(event.deltaX) > 0) {
      this.targetStoryScrollX += event.deltaX * 0.7;
    }
    if (abs(event.deltaY) > 0) {
      let maxScroll = this.getMaxScroll();
      let dy = event.deltaY * 0.7;

      if (this.targetScrollY < 0 && dy < 0) dy *= 0.3;
      if (this.targetScrollY > maxScroll && dy > 0) dy *= 0.3;

      this.targetScrollY += dy;
      this.targetScrollY = constrain(this.targetScrollY, -130, maxScroll + 130);
    }
  }

  constrainScroll() {
    let maxScroll = this.getMaxScroll();
    this.targetScrollY = constrain(this.targetScrollY, 0, maxScroll);
  }

  getMaxScroll() {
    let contentBottom = this.postStartY + this.posts.length * this.postGap;
    let visibleBottom = this.h - this.bottomNavH;
    return max(0, contentBottom - visibleBottom);
  }

  checkStoryClick(mx, my) {
    if (this.dragDistance > 5) return;
    let scrollMx = mx + this.storyScrollX;

    if (dist(scrollMx, my, 45, 105) < 35) {
      if (typeof storyUploader !== 'undefined' && typeof storyUploader.open === 'function') {
        storyUploader.open();
      }
      return;
    }

    for (let i = 0; i < this.storyGroups.length; i++) {
      let x = 45 + (i + 1) * 85;
      let y = 105;
      if (dist(scrollMx, my, x, y) < 35) {
        let group = this.storyGroups[i];
        let targetIndex = group.firstIndex;
        for (let j = 0; j < this.stories.length; j++) {
          if (this.stories[j].name === group.name && !this.stories[j].isRead) {
            targetIndex = j;
            break;
          }
        }
        this.currentStory = targetIndex;
        this.currentScreen = "story";
        this.stories[this.currentStory].isRead = true;
        this.storyElapsedTime = 0;
        this.ignorePress = true;
      }
    }
  }

  checkLikeClick(mx, my) {
    for (let i = 0; i < this.posts.length; i++) {
      let postY = this.postStartY + i * this.postGap;
      if (mx > 10 && mx < 45 && my > postY + 305 && my < postY + 345) {
        this.posts[i].toggleLike();
      }
    }
  }

  checkStoryViewerClick(mx, my) {
    if (this.isTransitioning) return;

    let prevStory = this.currentStory;
    this.nextStoryIndex = (mx < this.w / 2) ? this.currentStory - 1 : this.currentStory + 1;

    if (this.nextStoryIndex < 0 || this.nextStoryIndex >= this.stories.length) {
      this.currentScreen = "feed";
      this.currentStory = 0;
      this.storyElapsedTime = 0;
      return;
    }

    if (this.stories[prevStory].name !== this.stories[this.nextStoryIndex].name) {
      this.isTransitioning = true;
      this.transitionProgress = 0;
      this.stories[this.nextStoryIndex].isRead = true;
    } else {
      this.currentStory = this.nextStoryIndex;
      this.stories[this.currentStory].isRead = true;
      this.storyElapsedTime = 0;
    }
  }

  createRectClip(x, y, w, h) {
    drawingContext.beginPath();
    drawingContext.rect(x, y, w, h);
    drawingContext.closePath();
    drawingContext.clip();
  }

  getUnreadCount() {
    if (!this.chatRooms) return 0;
    let n = 0;
    for (let r of this.chatRooms) if (r.unread) n++;
    return n;
  }

  room() { return this.chatRooms[this.currentChatRoom]; }

  openDMList() {
    this.currentScreen = "dmList";
    this.dmScrollY = 0;
    this.dmTargetScrollY = 0;
  }

  openChatRoom(index) {
    this.currentChatRoom = index;
    let room = this.chatRooms[index];
    room.unread = false;
    this.currentScreen = "chatRoom";
    this.chatInputText = "";
    this.chatTargetScrollY = this.getChatMaxScroll();
    this.chatScrollY = this.chatTargetScrollY;
  }

  sendMessage(txt) {
    if (!txt) return;
    let room = this.room();
    room.messages.push({ text: txt, sent: true });
    room.seen = false;
    room.time = "지금";
    this.chatInputText = "";
    this.chatTargetScrollY = 1e9;
  }

  handleChatKeyTyped(k) {
    if (this.currentScreen !== "chatRoom") return false;
    if (k && k.length === 1) { this.chatInputText += k; return true; }
    return false;
  }

  handleChatKeyPressed(kc) {
    if (this.currentScreen !== "chatRoom") return false;
    if (kc === BACKSPACE) { this.chatInputText = this.chatInputText.slice(0, -1); return true; }
    if (kc === ENTER || kc === RETURN) {
      let t = this.chatInputText.trim();
      if (t.length) this.sendMessage(t);
      return true;
    }
    return false;
  }

  getDMMaxScroll() {
    let itemH = 72;
    let contentH = 112 + this.chatRooms.length * itemH + 12;
    return max(0, contentH - this.h);
  }

  getChatMaxScroll() {
    let headerH = 70, inputH = 60;
    let viewH = this.h - headerH - inputH;
    let total = this.layoutChatMessages().totalH;
    return max(0, total - viewH);
  }

  updateChatScroll(appMouse) {
    const scaleFactor = (typeof phone !== "undefined") ? phone.scale : 1;
    const isChat = this.currentScreen === "chatRoom";
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
    if (mx < 52 && my < 60) { this.currentScreen = "feed"; return; }
    if (this._chatDragDist > 6) return;

    let listTop = 112, itemH = 72;
    let y0 = listTop - this.dmScrollY;
    for (let i = 0; i < this.chatRooms.length; i++) {
      let top = y0 + i * itemH;
      if (my > Math.max(top, 112) && my < top + itemH) { this.openChatRoom(i); return; }
    }
  }

  handleChatRoomClick(mx, my) {
    if (mx < 52 && my < 60) { this.currentScreen = "dmList"; return; }

    let inputH = 60, y = this.h - inputH;
    if (my > y) {
      if (mx > this.w - 72) {
        let t = this.chatInputText.trim();
        if (t.length) this.sendMessage(t);
        else this.sendMessage("❤️");
      }
      return;
    }
  }

  drawChatAvatar(room, x, y, sz, g) {
    if (room.user && room.user.displayProfile) {
      if (g) room.user.displayProfile(x, y, sz, g);
      else room.user.displayProfile(x, y, sz);
      return;
    }
    let c = room.avatarColor || [110, 110, 110];
    if (g) {
      g.noStroke(); g.fill(c[0], c[1], c[2]); g.circle(x, y, sz);
      g.fill(255); g.textAlign(CENTER, CENTER); g.textStyle(BOLD); g.textSize(sz * 0.42);
      g.text(room.name.charAt(0), x, y + 1);
    } else {
      noStroke(); fill(c[0], c[1], c[2]); circle(x, y, sz);
      fill(255); textAlign(CENTER, CENTER); textStyle(BOLD); textSize(sz * 0.42);
      text(room.name.charAt(0), x, y + 1);
    }
    textStyle(NORMAL);
  }

  displayDMList(appMouse) {
    const w = this.w, h = this.h;

    push();
    drawingContext.save();
    this.createRectClip(0, 112, w, h - 112);
    let topY = 112 - this.dmScrollY;
    for (let i = 0; i < this.chatRooms.length; i++) {
      let y = topY + i * 72;
      if (y > h || y + 72 < 100) continue;
      this.drawDMRoom(this.chatRooms[i], y, 72, appMouse);
    }
    drawingContext.restore();
    pop();

    fill(20); noStroke();
    rect(0, 0, w, 112, 25, 25, 0, 0);

    let backHover = appMouse && dist(appMouse.x, appMouse.y, 24, 30) < 22;
    stroke(255); strokeWeight(2.4); noFill(); strokeJoin(ROUND); strokeCap(ROUND);
    push(); translate(22, 30); if (backHover) scale(1.15);
    line(6, -8, -4, 0); line(-4, 0, 6, 8);
    pop();

    let myName = this.currentAccount === "main" ? "주인공" : "의문의_X";
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
    const w = this.w;
    let cy = y + itemH / 2;
    let hover = appMouse && appMouse.y > Math.max(y, 112) && appMouse.y < y + itemH;
    if (hover) { noStroke(); fill(255, 12); rect(0, y, w, itemH); }

    let ax = 42, asz = 52;
    this.drawChatAvatar(room, ax, cy, asz);
    if (room.active) {
      noStroke(); fill(20); circle(ax + 18, cy + 17, 16);
      fill(80, 220, 120); circle(ax + 18, cy + 17, 11);
    }

    let tx = ax + 40;
    noStroke(); fill(255);
    textAlign(LEFT, BASELINE); textSize(15);
    textStyle(room.unread ? BOLD : NORMAL);
    text(room.name, tx, cy - 3);

    let last = room.messages.length ? room.messages[room.messages.length - 1] : null;
    let preview = last ? (last.sent ? "나: " : "") + last.text : "";
    if (preview.length > 20) preview = preview.slice(0, 20) + "…";
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

  layoutChatMessages() {
    const w = this.w;
    let maxBubbleW = w * 0.66;
    let padX = 13, padY = 9, lineH = 19, gap = 7, topPad = 14;

    textSize(14); textStyle(NORMAL);
    let items = [];
    let y = topPad;
    let prevSent = null;
    let msgs = this.room().messages;
    for (let i = 0; i < msgs.length; i++) {
      let m = msgs[i];
      let lines = this.wrapText(m.text, maxBubbleW - padX * 2);
      let maxLineW = 0;
      for (let ln of lines) maxLineW = max(maxLineW, textWidth(ln));
      let bw = min(maxBubbleW, maxLineW + padX * 2);
      let bh = lines.length * lineH + padY * 2;
      if (prevSent !== null && prevSent !== m.sent) y += 4;
      items.push({ lines, bw, bh, sent: m.sent, top: y });
      y += bh + gap;
      prevSent = m.sent;
    }
    if (this.room().seen) y += 16;
    return { items, totalH: y + 8 };
  }

  wrapText(str, maxW) {
    str = String(str);
    let lines = [], cur = "", lastSpace = -1;
    for (let i = 0; i < str.length; i++) {
      let ch = str[i];
      if (ch === "\n") { lines.push(cur); cur = ""; lastSpace = -1; continue; }
      cur += ch;
      if (ch === " ") lastSpace = cur.length - 1;
      if (textWidth(cur) > maxW) {
        if (lastSpace > 0) { lines.push(cur.slice(0, lastSpace)); cur = cur.slice(lastSpace + 1); }
        else { lines.push(cur.slice(0, -1)); cur = ch; }
        lastSpace = -1;
      }
    }
    if (cur.length) lines.push(cur);
    if (!lines.length) lines.push("");
    return lines;
  }

  displayChatRoom(appMouse) {
    const w = this.w, h = this.h;
    let headerH = 70, inputH = 60, padX = 13, padY = 9, lineH = 19;

    push();
    drawingContext.save();
    this.createRectClip(0, headerH, w, h - headerH - inputH);

    let layout = this.layoutChatMessages();
    let baseY = headerH + 6 - this.chatScrollY;
    let lastSent = null;

    textSize(14); textStyle(NORMAL);
    for (let it of layout.items) {
      let y = baseY + it.top;
      if (it.sent) lastSent = { it, y };
      if (y > h || y + it.bh < headerH) continue;

      let bx;
      noStroke();
      if (it.sent) { bx = w - 15 - it.bw; fill(70, 120, 245); }
      else { bx = 15; fill(48); }
      rect(bx, y, it.bw, it.bh, 18);

      fill(255); textAlign(LEFT, TOP);
      for (let li = 0; li < it.lines.length; li++) {
        text(it.lines[li], bx + padX, y + padY + li * lineH);
      }
    }

    if (this.room().seen && lastSent) {
      noStroke(); fill(150);
      textAlign(RIGHT, TOP); textSize(11);
      text("읽음", w - 16, lastSent.y + lastSent.it.bh + 3);
    }

    drawingContext.restore();
    pop();

    this.drawChatHeader(appMouse, headerH);
    this.drawChatInput(appMouse, inputH);
  }

  drawChatHeader(appMouse, headerH) {
    const w = this.w;
    let room = this.room();
    fill(20); noStroke();
    rect(0, 0, w, headerH, 25, 25, 0, 0);

    let backHover = appMouse && dist(appMouse.x, appMouse.y, 20, 35) < 22;
    stroke(255); strokeWeight(2.4); noFill(); strokeJoin(ROUND); strokeCap(ROUND);
    push(); translate(20, 35); if (backHover) scale(1.15);
    line(6, -8, -4, 0); line(-4, 0, 6, 8);
    pop();

    this.drawChatAvatar(room, 56, 35, 38);
    if (room.active) {
      noStroke(); fill(20); circle(56 + 13, 35 + 13, 12);
      fill(80, 220, 120); circle(56 + 13, 35 + 13, 8);
    }

    noStroke(); fill(255);
    textAlign(LEFT, BASELINE); textStyle(BOLD); textSize(15);
    text(room.name, 84, room.active ? 32 : 40);
    if (room.active) {
      fill(150); textStyle(NORMAL); textSize(11);
      text(room.activeText || "활동 중", 84, 48);
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
    const w = this.w, h = this.h;
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
      text(t + (showCursor ? "|" : ""), px + 16, py + ph / 2 + 1);
      fill(70, 130, 255);
      textAlign(RIGHT, CENTER); textStyle(BOLD);
      text("보내기", w - 22, py + ph / 2 + 1);
    } else {
      fill(130);
      text("메시지...", px + 16, py + ph / 2 + 1);
      fill(255); textAlign(CENTER, CENTER); textSize(20); textStyle(NORMAL);
      text("♡", w - 32, py + ph / 2 + 2);
    }
    textStyle(NORMAL);
  }
}
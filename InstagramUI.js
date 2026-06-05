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
    this.backupStories = null; // 하이라이트 기능 위해 백업 공간
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

    // "main" = 주인공 본계정
    // "sub" = 주인공의 부계정 / 의문의 계정
    this.currentAccount = "main";
    this.lastAccountClickTime = 0;
    this.minDoubleClickDelay = 1;    // 0.001초
    this.maxDoubleClickDelay = 500;   // 0.5초
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

  addMyStory(img) {
    if (typeof dateManager === 'undefined' || !dateManager.users["주인공"]) return;

    let myUser = dateManager.users["주인공"];
    let newStory = new Story(myUser, color(50, 150, 255), color(150, 200, 255), color(20), "새 스토리", img);

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

  display(appMouse = {x: -999, y: -999}) {
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
    let isHeartHover = appMouse && dist(appMouse.x, appMouse.y, 310, headerY) < 20;
    let isDmHover = appMouse && dist(appMouse.x, appMouse.y, 355, headerY) < 20;

    push();
    translate(310, headerY);
    if (isHeartHover) scale(1.2);
    fill(isHeartHover ? color(255, 150, 150) : 255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(26);
    text("♡", 0, 2);
    pop();

    push();
    translate(355, headerY);
    if (isDmHover) scale(1.2);
    stroke(isDmHover ? color(150, 200, 255) : 255);
    strokeWeight(2);
    noFill();
    strokeJoin(ROUND);
    beginShape();
    vertex(-9, 5);
    vertex(8, -8);
    vertex(4, 9);
    vertex(-1, 1);
    endShape(CLOSE);
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
        beginShape();
        vertex(-9, 5);
        vertex(8, -8);
        vertex(4, 9);
        vertex(-1, 1);
        endShape(CLOSE);
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

    s.user.displayProfile(32, 48, 32, g);

    g.fill(255);
    g.textAlign(LEFT, BASELINE);
    g.textStyle(BOLD);
    g.textSize(14);
    g.text(s.name, 55, 53);
    g.textStyle(NORMAL);
    g.textSize(13);
    g.text("2h", 110, 53);
    g.textAlign(RIGHT, BASELINE);
    g.textSize(24);
    g.text("×", this.w - 22, 55);

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

  // 계정 전환 함수
  changeAccount() {
    if (this.currentAccount === "main") {
      this.currentAccount = "sub";
    } else {
      this.currentAccount = "main";
    }

    // 계정이 바뀌면 피드를 맨 위로 올림
    // 필요 없으면 아래 두 줄은 삭제 가능
    this.targetScrollY = 0;
    this.scrollY = 0;
  }

  // 현재 선택된 계정의 User 객체를 가져오는 함수
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
  }

  handleWheel(event) {
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
      if (typeof storyUploader !== 'undefined') {
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
}

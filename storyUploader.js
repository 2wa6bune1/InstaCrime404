// ======================================================
// storyUploader.js
// ======================================================
class StoryUploader {
  constructor(instagramUI) {
    this.instagramUI = instagramUI;

    // 화면 단계: camera -> tag -> result -> mainCamera -> endingScreen
    this.mode = "camera";

    // 카메라/글리치 연출 상태
    this.cameraStartFrame = 0;
    this.ghostEffectDone = false;
    this.ghostEffectDuration = 240;

    // 4일차 정답 업로드 후 실제 카메라 + 피묻은 손 연출
    this.mainCameraActive = false;
    this.mainCameraStartFrame = 0;
    this.mainHandBurstStarted = false;
    this.mainHandBurstStartFrame = 0;
    this.mainCameraEndingStarted = false;

    // 4일차: 2초 뒤 손자국 시작, 시작 후 4초 뒤 종료
    // 기존 6초에서 약 2초 줄임
    this.mainCameraVisibleFrames = 120;
    this.mainHandBurstFrames = 240;

    // 태그 선택 상태
    this.selectedTarget = null;
    this.resultType = null;
    this.endingResult = null;

    // 독백 상태
    this.tagIntroMonoPlayed = false;
    this.tagIntroMonoText = "이제 범인을 태그해서 스토리에 올려야 한다. 누구를 태그해야 하지?";
    this.wrongTargetMonoText = "아니야... 이 사람은 아닌 것 같다.";

    // 태그 후보
    // main은 실제 정답 후보이며, 화면에는 플레이어가 입력한 인스타 아이디로 표시됨.
    this.tagTargets = [
      {
        id: "jian",
        name: "최지안",
        handle: "@its_ji.anni",
        monoText: "지안이는 아닌 것 같다. 연쇄살인마가 범행을 저지른 장소를 굳이 다시 찾아갈까?"
      },
      {
        id: "sujin",
        name: "정수진",
        handle: "@su.zinni_",
        monoText: "수진이를 의심했지만... 수진이의 망가진 줄 이어폰은 깨끗하고 늘어난 흔적도 없었어."
      },
      {
        id: "seojun",
        name: "이서준",
        handle: "@seo_jun.lee",
        monoText: "서준이는 늘상 서아와 티격태격했지, 심각하게 싸웠다는 이야기는 들은적 없어."
      },
      {
        id: "haeun",
        name: "강하은",
        handle: "@grace_haeun",
        monoText: "하은이를 태그하면 안 될 것 같다. 사람을 죽일 애는 아니야"
      },
      {
        id: "main",
        name: "주인공",
        handle: "@player",
        monoText: "설마... 그럴리가 없잖아.."

      }
    ];
  }

  open() {
    if (typeof dateManager !== "undefined" && dateManager) {
      if (dateManager.currentDay !== 4) {
        if (typeof monologue !== "undefined" && monologue) {
          monologue.start("아직 스토리를 올릴 때는 아닌 것 같다.");
        }
        return;
      }

      let canUpload =
        dateManager.day4StoryUploadReady ||
        dateManager.day4StoryUploadUnlocked;

      if (!canUpload) {
        if (typeof monologue !== "undefined" && monologue) {
          monologue.start("먼저 확인할 것을 모두 확인해야 할 것 같다.");
        }
        return;
      }
    }

    this.instagramUI.currentScreen = "storyUpload";
    this.mode = "camera";

    this.cameraStartFrame = frameCount;
    this.ghostEffectDone = false;

    this.mainCameraActive = false;
    this.mainCameraStartFrame = 0;
    this.mainHandBurstStarted = false;
    this.mainHandBurstStartFrame = 0;
    this.mainCameraEndingStarted = false;

    this.endingResult = null;
    this.selectedTarget = null;
    this.resultType = null;
    this.tagIntroMonoPlayed = false;
  }

  display(appMouse = { x: -999, y: -999 }) {
    if (this.mode === "camera") {
      this.displayCameraScreen(appMouse);
    } else if (this.mode === "tag") {
      this.displayTagScreen(appMouse);
    } else if (this.mode === "result") {
      this.displayResultScreen(appMouse);
    } else if (this.mode === "mainCamera") {
      this.displayMainCameraScreen(appMouse);
    } else if (this.mode === "endingScreen") {
      this.displayEndingScreen(appMouse);
    }
  }

  drawDarkGradientBackground(w, h) {
    background(6, 7, 10);

    drawingContext.save();
    let g = drawingContext.createLinearGradient(0, 0, w, h);
    g.addColorStop(0.0, "rgba(38, 18, 32, 1)");
    g.addColorStop(0.42, "rgba(8, 9, 14, 1)");
    g.addColorStop(1.0, "rgba(0, 0, 0, 1)");
    drawingContext.fillStyle = g;
    drawingContext.fillRect(0, 0, w, h);
    drawingContext.restore();
  }

  roundedRectPath(ctx, x, y, w, h, r) {
    let radius = min(r, w / 2, h / 2);

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  displayCameraScreen(appMouse) {
    let w = this.instagramUI.w;
    let h = this.instagramUI.h;

    this.drawDarkGradientBackground(w, h);
    this.displayCameraPreview(w, h);

    // 동그란 귀신/움직이는 귀신 연출은 제거.
    // 지지직/글리치 효과만 남김.
    this.displayGhostEffect(w, h);

    this.displayCameraTopUI(w, h);
    this.displayCameraBottomUI(w, h, appMouse);
  }

  displayCameraTopUI(w, h) {
    noStroke();
    fill(0, 130);
    rect(0, 0, w, 74);

    fill(255);
    textAlign(LEFT, CENTER);
    textSize(30);
    textStyle(NORMAL);
    text("×", 24, 38);

    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text("스토리", w / 2, 36);

    fill(255, 150);
    textSize(11);
    textStyle(NORMAL);
    text("GLITCH CAMERA", w / 2, 56);

    textAlign(RIGHT, CENTER);
    textSize(19);
    fill(255, 190);
    text("⚙", w - 25, 38);
  }

  displayCameraPreview(w, h) {
    let cardX = 28;
    let cardY = 92;
    let cardW = w - 56;
    let cardH = h - 245;

    drawingContext.save();
    drawingContext.shadowColor = "rgba(0, 0, 0, 0.65)";
    drawingContext.shadowBlur = 24;
    drawingContext.shadowOffsetY = 10;

    noStroke();
    fill(10, 12, 18, 235);
    rect(cardX, cardY, cardW, cardH, 26);
    drawingContext.restore();

    drawingContext.save();
    let g = drawingContext.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    g.addColorStop(0.0, "rgba(255, 255, 255, 0.08)");
    g.addColorStop(0.5, "rgba(255, 255, 255, 0.015)");
    g.addColorStop(1.0, "rgba(200, 35, 60, 0.12)");
    drawingContext.fillStyle = g;
    drawingContext.fillRect(cardX, cardY, cardW, cardH);
    drawingContext.restore();

    stroke(255, 255, 255, 45);
    strokeWeight(1.2);
    noFill();
    rect(cardX, cardY, cardW, cardH, 26);

    let cx = w / 2;
    let cy = cardY + cardH / 2;

    stroke(255, 255, 255, 88);
    strokeWeight(1.4);
    noFill();
    rectMode(CENTER);
    rect(cx, cy, 210, 280, 18);
    rectMode(CORNER);

    let fx = cx - 105;
    let fy = cy - 140;
    let fw = 210;
    let fh = 280;
    let l = 28;

    stroke(255, 255, 255, 170);
    strokeWeight(2.2);

    line(fx, fy, fx + l, fy);
    line(fx, fy, fx, fy + l);
    line(fx + fw, fy, fx + fw - l, fy);
    line(fx + fw, fy, fx + fw, fy + l);
    line(fx, fy + fh, fx + l, fy + fh);
    line(fx, fy + fh, fx, fy + fh - l);
    line(fx + fw, fy + fh, fx + fw - l, fy + fh);
    line(fx + fw, fy + fh, fx + fw, fy + fh - l);

    noStroke();
    fill(255, 120);
    textAlign(CENTER, CENTER);
    textSize(13);
    textStyle(NORMAL);
    text("신호가 불안정합니다", cx, cy - 10);

    fill(255, 65);
    textSize(11);
    text("화면을 촬영해 스토리에 단서를 남기세요", cx, cy + 18);
  }

  displayCameraNoise(w, h, amount = 25, alphaMin = 5, alphaMax = 20) {
    for (let i = 0; i < amount; i++) {
      noStroke();
      fill(255, random(alphaMin, alphaMax));
      rect(random(w), random(h), random(1, 3), random(1, 3));
    }
  }

  displayGhostEffect(w, h) {
    let t = frameCount - this.cameraStartFrame;
    let progress = constrain(t / this.ghostEffectDuration, 0, 1);
    let intensity = 0.25 + sin(progress * PI) * 0.85;

    this.displayCameraNoise(w, h, floor(35 + 180 * intensity), 10, 115);

    for (let y = 0; y < h; y += 6) {
      noStroke();
      fill(255, 8 + 18 * intensity);
      rect(0, y, w, 1);
    }

    let glitchLineCount = floor(2 + 10 * intensity);

    for (let i = 0; i < glitchLineCount; i++) {
      let gy = random(82, h - 150);
      let gh = random(2, 13);
      let gx = random(-35, 20);
      let gw = w + random(10, 95);

      noStroke();

      if (random() < 0.65) {
        fill(255, random(18, 78) * intensity);
      } else {
        fill(200, 35, 60, random(18, 82) * intensity);
      }

      rect(gx, gy, gw, gh);
    }

    if (random() < 0.55 * intensity) {
      noStroke();

      fill(255, 0, 80, 50 * intensity);
      rect(random(-20, 20), random(h), w, random(1, 4));

      fill(50, 170, 255, 42 * intensity);
      rect(random(-20, 20), random(h), w, random(1, 4));
    }

    if (random() < 0.04 + 0.08 * intensity) {
      noStroke();
      fill(255, random(18, 65));
      rect(0, 0, w, h);
    }

    if (frameCount % 80 < 9) {
      fill(255, 70, 90, 155);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(12);
      textStyle(BOLD);
      text("SIGNAL LOST", w / 2, 112);
    }
  }

  displayCameraBottomUI(w, h, appMouse = { x: -999, y: -999 }) {
    let buttonX = w / 2;
    let buttonY = h - 72;

    let isShotHover = dist(appMouse.x, appMouse.y, buttonX, buttonY) < 48;

    noStroke();
    fill(0, 150);
    rect(0, h - 148, w, 148);

    drawingContext.save();
    drawingContext.shadowColor = "rgba(0, 0, 0, 0.45)";
    drawingContext.shadowBlur = 12;

    noStroke();
    fill(28, 30, 38);
    rect(34, h - 99, 52, 52, 14);
    drawingContext.restore();

    fill(255, 80);
    textAlign(CENTER, CENTER);
    textSize(10);
    textStyle(NORMAL);
    text("최근", 60, h - 73);

    push();
    translate(buttonX, buttonY);

    if (isShotHover) scale(1.06);

    drawingContext.save();
    drawingContext.shadowColor = "rgba(255, 255, 255, 0.22)";
    drawingContext.shadowBlur = isShotHover ? 22 : 12;

    noFill();
    stroke(255, isShotHover ? 255 : 220);
    strokeWeight(4);
    circle(0, 0, 72);
    drawingContext.restore();

    noStroke();
    fill(isShotHover ? color(255, 255, 255, 245) : color(255, 255, 255, 210));
    circle(0, 0, 54);

    fill(200, 40, 60, isShotHover ? 210 : 140);
    circle(0, 0, 32);

    pop();

    fill(255, 185);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    text("↺", w - 60, h - 72);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(13);
    textStyle(BOLD);
    text("스토리", w / 2, h - 25);
  }

  goToTagScreen() {
    this.ghostEffectDone = true;
    this.mode = "tag";

    if (
      !this.tagIntroMonoPlayed &&
      typeof monologue !== "undefined" &&
      monologue
    ) {
      monologue.start(this.tagIntroMonoText);
      this.tagIntroMonoPlayed = true;
    }
  }

  playWrongTargetMonologue(target) {
    if (typeof monologue === "undefined" || !monologue) return;

    let text = target.monoText || this.wrongTargetMonoText;
    monologue.start(text);
  }

  displayTagScreen(appMouse) {
    let w = this.instagramUI.w;
    let h = this.instagramUI.h;

    this.drawDarkGradientBackground(w, h);
    this.displayTagTopUI(w, h);
    this.displayStoryTagPreview(w, h);
    this.displayTagTargetList(w, h, appMouse);
    this.displayShareButton(w, h, appMouse);
  }

  displayTagTopUI(w, h) {
    noStroke();
    fill(0, 135);
    rect(0, 0, w, 72);

    fill(255);
    textAlign(LEFT, CENTER);
    textSize(30);
    textStyle(NORMAL);
    text("×", 24, 38);

    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text("스토리 작성", w / 2, 35);

    fill(255, 120);
    textSize(11);
    textStyle(NORMAL);
    text("TAG THE SUSPECT", w / 2, 55);
  }

  displayStoryTagPreview(w, h) {
    let cardX = 30;
    let cardY = 88;
    let cardW = w - 60;
    let cardH = 250;

    drawingContext.save();
    drawingContext.shadowColor = "rgba(0, 0, 0, 0.55)";
    drawingContext.shadowBlur = 20;
    drawingContext.shadowOffsetY = 10;

    noStroke();
    fill(14, 16, 22, 245);
    rect(cardX, cardY, cardW, cardH, 24);
    drawingContext.restore();

    drawingContext.save();
    let g = drawingContext.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    g.addColorStop(0.0, "rgba(255, 255, 255, 0.08)");
    g.addColorStop(0.45, "rgba(255, 255, 255, 0.015)");
    g.addColorStop(1.0, "rgba(220, 40, 70, 0.22)");
    drawingContext.fillStyle = g;
    drawingContext.fillRect(cardX, cardY, cardW, cardH);
    drawingContext.restore();

    stroke(255, 255, 255, 38);
    strokeWeight(1.2);
    noFill();
    rect(cardX, cardY, cardW, cardH, 24);

    for (let i = 0; i < 90; i++) {
      noStroke();
      fill(255, random(4, 22));
      rect(
        random(cardX + 5, cardX + cardW - 5),
        random(cardY + 5, cardY + cardH - 5),
        random(1, 3),
        random(1, 3)
      );
    }

    fill(255, 90);
    textAlign(CENTER, CENTER);
    textSize(11);
    textStyle(NORMAL);
    text("STORY PREVIEW", w / 2, cardY + 30);

    fill(255);
    textSize(29);
    textStyle(BOLD);
    text("네가 범인이야", w / 2, cardY + 105);

    if (this.selectedTarget) {
      let target = this.getTargetById(this.selectedTarget);

      fill(230, 48, 76);
      textSize(24);
      textStyle(BOLD);
      text(target.handle, w / 2, cardY + 154);

      fill(255, 145);
      textSize(13);
      textStyle(NORMAL);
      text(target.name + " 태그됨", w / 2, cardY + 193);
    } else {
      fill(255, 130);
      textSize(24);
      textStyle(BOLD);
      text("@____", w / 2, cardY + 154);

      fill(255, 100);
      textSize(13);
      textStyle(NORMAL);
      text("아래에서 태그할 계정을 선택하세요", w / 2, cardY + 193);
    }
  }

  getPlayerAccuseName() {
    if (typeof getPlayerInstagramId === "function") {
      return getPlayerInstagramId();
    }

    if (
      typeof dateManager !== "undefined" &&
      dateManager &&
      dateManager.users &&
      dateManager.users["주인공"] &&
      dateManager.users["주인공"].name
    ) {
      return dateManager.users["주인공"].name;
    }

    return "주인공";
  }

  getTagTargets() {
    let playerName = this.getPlayerAccuseName();

    return this.tagTargets.map(target => {
      if (target.id !== "main") return target;

      return {
        id: "main",
        name: playerName,
        handle: "@" + playerName
      };
    });
  }

  getTagListLayout(w, h) {
    return {
      titleX: 34,
      titleY: 354,
      startY: 376,
      itemX: 28,
      itemW: w - 56,
      itemH: 42,
      gap: 5
    };
  }

  getShareButtonLayout(w, h) {
    return {
      buttonX: 34,
      buttonY: h - 56,
      buttonW: w - 68,
      buttonH: 42
    };
  }

  displayTagTargetList(w, h, appMouse) {
    let layout = this.getTagListLayout(w, h);
    let targets = this.getTagTargets();

    fill(255);
    textAlign(LEFT, CENTER);
    textSize(14);
    textStyle(BOLD);
    text("태그할 계정", layout.titleX, layout.titleY);

    fill(255, 100);
    textAlign(RIGHT, CENTER);
    textSize(10.5);
    textStyle(NORMAL);
    text("정답은 하나", w - 34, layout.titleY);

    for (let i = 0; i < targets.length; i++) {
      let target = targets[i];
      let y = layout.startY + i * (layout.itemH + layout.gap);

      let isHover =
        appMouse.x >= layout.itemX &&
        appMouse.x <= layout.itemX + layout.itemW &&
        appMouse.y >= y &&
        appMouse.y <= y + layout.itemH;

      let isSelected = this.selectedTarget === target.id;

      drawingContext.save();
      drawingContext.shadowColor = isSelected
        ? "rgba(220, 45, 72, 0.35)"
        : "rgba(0, 0, 0, 0.22)";
      drawingContext.shadowBlur = isSelected ? 16 : 7;
      drawingContext.shadowOffsetY = 3;

      noStroke();

      if (isSelected) {
        fill(205, 42, 66);
      } else if (isHover) {
        fill(46, 48, 58);
      } else {
        fill(28, 30, 38);
      }

      rect(layout.itemX, y, layout.itemW, layout.itemH, 14);
      drawingContext.restore();

      stroke(255, 255, 255, isSelected ? 90 : 24);
      strokeWeight(1);
      noFill();
      rect(layout.itemX, y, layout.itemW, layout.itemH, 14);

      noStroke();
      fill(isSelected ? 255 : 72);
      circle(layout.itemX + 25, y + layout.itemH / 2, 28);

      fill(isSelected ? color(205, 42, 66) : color(185));
      textAlign(CENTER, CENTER);
      textSize(12);
      textStyle(BOLD);
      text(
        target.id === "main" ? "나" : target.name.charAt(0),
        layout.itemX + 25,
        y + layout.itemH / 2
      );

      fill(255);
      textAlign(LEFT, CENTER);
      textSize(12.5);
      textStyle(BOLD);
      text(target.name, layout.itemX + 52, y + 15);

      fill(255, isSelected ? 210 : 142);
      textSize(10.5);
      textStyle(NORMAL);
      text(target.handle, layout.itemX + 52, y + 30);

      if (isSelected) {
        fill(255);
        textAlign(RIGHT, CENTER);
        textSize(17);
        textStyle(BOLD);
        text("✓", layout.itemX + layout.itemW - 20, y + layout.itemH / 2);
      }
    }
  }

  displayShareButton(w, h, appMouse) {
    let layout = this.getShareButtonLayout(w, h);

    let isHover =
      appMouse.x >= layout.buttonX &&
      appMouse.x <= layout.buttonX + layout.buttonW &&
      appMouse.y >= layout.buttonY &&
      appMouse.y <= layout.buttonY + layout.buttonH;

    drawingContext.save();
    drawingContext.shadowColor = this.selectedTarget
      ? "rgba(220, 45, 72, 0.38)"
      : "rgba(0, 0, 0, 0.30)";
    drawingContext.shadowBlur = this.selectedTarget ? 18 : 10;
    drawingContext.shadowOffsetY = 6;

    noStroke();

    if (this.selectedTarget) {
      fill(isHover ? color(230, 58, 84) : color(205, 42, 66));
    } else {
      fill(78);
    }

    rect(layout.buttonX, layout.buttonY, layout.buttonW, layout.buttonH, 16);
    drawingContext.restore();

    stroke(255, 255, 255, this.selectedTarget ? 64 : 25);
    strokeWeight(1);
    noFill();
    rect(layout.buttonX, layout.buttonY, layout.buttonW, layout.buttonH, 16);

    noStroke();
    fill(this.selectedTarget ? 255 : 160);
    textAlign(CENTER, CENTER);
    textSize(14);
    textStyle(BOLD);
    text("스토리에 올리기", w / 2, layout.buttonY + layout.buttonH / 2);
  }

  displayResultScreen(appMouse) {
    // 이전 버전 호환용.
    // 현재 오답은 바로 Failed 엔딩 화면으로 이동한다.
    this.showEndingScreen("failed");
  }

  handleClick(mx, my) {
    if (this.mode === "mainCamera") {
      return;
    }

    if (this.mode === "endingScreen") {
      this.handleEndingScreenClick(mx, my);
      return;
    }

    if (this.mode === "camera") {
      this.handleCameraClick(mx, my);
    } else if (this.mode === "tag") {
      this.handleTagClick(mx, my);
    } else if (this.mode === "result") {
      this.handleResultClick(mx, my);
    }
  }

  handleCameraClick(mx, my) {
    let w = this.instagramUI.w;
    let h = this.instagramUI.h;

    if (mx < 60 && my < 75) {
      this.close();
      return;
    }

    if (dist(mx, my, w / 2, h - 72) < 52) {
      this.goToTagScreen();
      return;
    }
  }

  handleTagClick(mx, my) {
    let w = this.instagramUI.w;
    let h = this.instagramUI.h;

    if (mx < 60 && my < 75) {
      this.close();
      return;
    }

    let shareLayout = this.getShareButtonLayout(w, h);

    if (
      mx >= shareLayout.buttonX &&
      mx <= shareLayout.buttonX + shareLayout.buttonW &&
      my >= shareLayout.buttonY &&
      my <= shareLayout.buttonY + shareLayout.buttonH
    ) {
      if (this.selectedTarget) {
        this.uploadTaggedStory();
      }
      return;
    }

    let listLayout = this.getTagListLayout(w, h);
    let targets = this.getTagTargets();

    for (let i = 0; i < targets.length; i++) {
      let target = targets[i];
      let y = listLayout.startY + i * (listLayout.itemH + listLayout.gap);

      if (
        mx >= listLayout.itemX &&
        mx <= listLayout.itemX + listLayout.itemW &&
        my >= y &&
        my <= y + listLayout.itemH
      ) {
        this.selectedTarget = target.id;

        if (target.id !== "main") {
          this.playWrongTargetMonologue(target);
        }

        return;
      }
    }
  }

  handleResultClick(mx, my) {
    this.showEndingScreen("failed");
  }

  uploadTaggedStory() {
    if (!this.selectedTarget) return;

    this.resultType = this.selectedTarget === "main" ? "true" : "false";

    let storyImg = null;

    if (this.resultType === "true") {
      storyImg = this.createTaggedStoryImage();
      this.instagramUI.addMyStory(storyImg);
    }

    if (typeof dateManager !== "undefined" && dateManager) {
      dateManager.uploadedToday = this.resultType === "true";
      dateManager.accusedSuspect = this.selectedTarget;
      dateManager.accuseResult = this.resultType;
      dateManager.taggedTarget = this.selectedTarget;
      dateManager.taggedHandle = this.getTargetById(this.selectedTarget).handle;
      dateManager.storyUploadResult = this.resultType;

      if (storyImg) {
        if (!dateManager.uploadedStories) {
          dateManager.uploadedStories = {};
        }

        dateManager.uploadedStories[dateManager.currentDay] = storyImg;
      }
    }

    if (this.resultType === "true") {
      this.startMainCameraSequence();
      return;
    }

    this.showEndingScreen("failed");
  }

  createTaggedStoryImage() {
    let w = this.instagramUI.w;
    let h = this.instagramUI.h;
    let g = createGraphics(w, h);
    let target = this.getTargetById(this.selectedTarget);

    g.background(8, 9, 13);

    for (let i = 0; i < 150; i++) {
      g.noStroke();
      g.fill(255, random(5, 26));
      g.rect(random(w), random(h), random(1, 3), random(1, 3));
    }

    g.noStroke();
    g.fill(0, 115);
    g.rect(0, 0, w, h);

    g.stroke(255, 255, 255, 60);
    g.strokeWeight(1.5);
    g.noFill();
    g.rect(34, 80, w - 68, h - 160, 24);

    g.noStroke();
    g.fill(255);
    g.textAlign(CENTER, CENTER);
    g.textStyle(BOLD);
    g.textSize(32);
    g.text("네가 범인이야", w / 2, h / 2 - 45);

    g.textSize(26);
    g.fill(225, 45, 72);
    g.text(target.handle, w / 2, h / 2 + 10);

    g.textStyle(NORMAL);
    g.textSize(14);
    g.fill(255, 160);
    g.text(target.name + " 태그됨", w / 2, h / 2 + 52);

    return g;
  }

  close() {
    this.mode = "camera";
    this.ghostEffectDone = false;
    this.selectedTarget = null;
    this.resultType = null;
    this.endingResult = null;
    this.tagIntroMonoPlayed = false;

    this.mainCameraActive = false;
    this.mainCameraStartFrame = 0;
    this.mainHandBurstStarted = false;
    this.mainHandBurstStartFrame = 0;
    this.mainCameraEndingStarted = false;

    this.instagramUI.currentScreen = "feed";
  }

  getTargetById(id) {
    let targets = this.getTagTargets();

    for (let i = 0; i < targets.length; i++) {
      if (targets[i].id === id) {
        return targets[i];
      }
    }

    return {
      id: "unknown",
      name: "???",
      handle: "@unknown"
    };
  }

  showEndingScreen(result) {
    this.endingResult = result;
    this.resultType = result === "end" ? "true" : "false";
    this.mode = "endingScreen";

    this.mainCameraActive = false;
    this.mainHandBurstStarted = false;
    this.mainHandBurstStartFrame = 0;
    this.mainCameraStartFrame = 0;
    this.mainCameraEndingStarted = false;

    this.instagramUI.currentScreen = "storyUpload";
  }

  getEndingButtonBounds(w, h) {
    return {
      x: 42,
      y: h - 122,
      w: w - 84,
      h: 54
    };
  }

  displayEndingScreen(appMouse = { x: -999, y: -999 }) {
    let w = this.instagramUI.w;
    let h = this.instagramUI.h;
    let success = this.endingResult === "end";

    background(3, 3, 5);

    drawingContext.save();
    let bg = drawingContext.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, h * 0.75);
    bg.addColorStop(0.0, success ? "rgba(75, 0, 10, 0.52)" : "rgba(45, 45, 45, 0.45)");
    bg.addColorStop(0.55, "rgba(8, 8, 12, 0.96)");
    bg.addColorStop(1.0, "rgba(0, 0, 0, 1)");
    drawingContext.fillStyle = bg;
    drawingContext.fillRect(0, 0, w, h);
    drawingContext.restore();

    for (let i = 0; i < 160; i++) {
      noStroke();
      fill(255, random(4, 30));
      rect(random(w), random(h), random(1, 3), random(1, 3));
    }

    for (let y = 0; y < h; y += 7) {
      noStroke();
      fill(255, 9);
      rect(0, y, w, 1);
    }

    if (random() < 0.18) {
      noStroke();
      fill(220, 0, 35, random(18, 55));
      rect(0, random(h), w, random(2, 9));
    }

    let cardX = 34;
    let cardY = 112;
    let cardW = w - 68;
    let cardH = 360;

    drawingContext.save();
    drawingContext.shadowColor = success ? "rgba(180, 0, 25, 0.45)" : "rgba(0, 0, 0, 0.70)";
    drawingContext.shadowBlur = 34;
    drawingContext.shadowOffsetY = 14;

    noStroke();
    fill(8, 9, 13, 238);
    rect(cardX, cardY, cardW, cardH, 26);
    drawingContext.restore();

    stroke(success ? color(170, 10, 35, 130) : color(130, 130, 130, 80));
    strokeWeight(1.4);
    noFill();
    rect(cardX, cardY, cardW, cardH, 26);

    noStroke();
    fill(success ? color(210, 30, 55) : color(150));
    circle(w / 2, cardY + 86, 68);

    fill(10);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(34);
    text(success ? "!" : "×", w / 2, cardY + 86);

    fill(255);
    textSize(success ? 58 : 48);
    textStyle(BOLD);
    text(success ? "END" : "FAILED", w / 2, cardY + 178);

    fill(255, 155);
    textSize(14);
    textStyle(NORMAL);

    if (success) {
      text("스토리는 범인을 정확히 가리켰다.", w / 2, cardY + 238);
      text("이제 사건의 전말을 확인해야 한다.", w / 2, cardY + 263);
    } else {
      text("잘못된 사람을 지목했다.", w / 2, cardY + 238);
      text("그러나 사건은 이미 끝을 향해 가고 있다.", w / 2, cardY + 263);
    }

    let b = this.getEndingButtonBounds(w, h);
    let isHover =
      appMouse.x >= b.x &&
      appMouse.x <= b.x + b.w &&
      appMouse.y >= b.y &&
      appMouse.y <= b.y + b.h;

    drawingContext.save();
    drawingContext.shadowColor = "rgba(190, 0, 35, 0.45)";
    drawingContext.shadowBlur = isHover ? 30 : 18;
    drawingContext.shadowOffsetY = isHover ? 10 : 7;

    noStroke();
    fill(isHover ? color(185, 18, 42) : color(128, 8, 24));
    rect(b.x, b.y, b.w, b.h, 18);
    drawingContext.restore();

    stroke(255, 255, 255, isHover ? 105 : 55);
    strokeWeight(1.2);
    noFill();
    rect(b.x, b.y, b.w, b.h, 18);

    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(16);
    text("사건의 전말 보기", w / 2, b.y + b.h / 2);

    fill(255, 95);
    textStyle(NORMAL);
    textSize(11);
    text("누르면 되돌릴 수 없습니다", w / 2, b.y + b.h + 24);
  }

  handleEndingScreenClick(mx, my) {
    let b = this.getEndingButtonBounds(this.instagramUI.w, this.instagramUI.h);

    if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) {
      this.playEndingVideoAndGoDayZero();
    }
  }

  startMainCameraSequence() {
    this.mode = "mainCamera";
    this.mainCameraActive = true;
    this.mainCameraStartFrame = frameCount;
    this.mainHandBurstStarted = false;
    this.mainHandBurstStartFrame = 0;
    this.mainCameraEndingStarted = false;
  }

  displayMainCameraScreen(appMouse) {
    let w = this.instagramUI.w;
    let h = this.instagramUI.h;

    background(0);

    if (typeof webcam !== "undefined" && webcam) {
      this.drawWebcamCover(w, h);
    } else {
      noStroke();
      fill(15);
      rect(0, 0, w, h);

      fill(255, 120);
      textAlign(CENTER, CENTER);
      textSize(14);
      text("카메라를 불러오는 중", w / 2, h / 2);
    }

    this.displayMainCameraGlitchOverlay(w, h);

    let elapsed = frameCount - this.mainCameraStartFrame;

    if (!this.mainHandBurstStarted && elapsed >= this.mainCameraVisibleFrames) {
      this.mainHandBurstStarted = true;
      this.mainHandBurstStartFrame = frameCount;
    }

    if (this.mainHandBurstStarted) {
      this.displayBloodHandBurst(w, h);

      if (
        frameCount - this.mainHandBurstStartFrame >= this.mainHandBurstFrames &&
        !this.mainCameraEndingStarted
      ) {
        this.finishMainCameraSequence();
      }
    }

    this.displayMainCameraStatusText(w, h);
  }

  drawWebcamCover(w, h) {
    let camW = w;
    let camH = h;
    let camX = 0;
    let camY = 0;

    if (webcam.width && webcam.height) {
      let camAspect = webcam.width / webcam.height;
      let screenAspect = w / h;

      if (camAspect > screenAspect) {
        camH = h;
        camW = h * camAspect;
        camX = (w - camW) / 2;
        camY = 0;
      } else {
        camW = w;
        camH = w / camAspect;
        camX = 0;
        camY = (h - camH) / 2;
      }
    }

    push();
    translate(w - camX, camY);
    scale(-1, 1);
    image(webcam, 0, 0, camW, camH);
    pop();
  }

  displayMainCameraGlitchOverlay(w, h) {
    noStroke();
    fill(0, 80);
    rect(0, 0, w, h);

    for (let i = 0; i < 65; i++) {
      noStroke();
      fill(255, random(8, 45));
      rect(random(w), random(h), random(1, 4), random(1, 4));
    }

    for (let y = 0; y < h; y += 7) {
      fill(255, 12);
      rect(0, y, w, 1);
    }

    if (random() < 0.13) {
      fill(255, random(25, 65));
      rect(0, random(h), w, random(2, 8));
    }
  }

  displayMainCameraStatusText(w, h) {
    noStroke();
    fill(0, 125);
    rect(0, 0, w, 72);

    if (frameCount % 44 < 28) {
      fill(230, 35, 60, 230);
      circle(24, 38, 9);
    }

    textAlign(LEFT, CENTER);
    textSize(11);
    fill(255, 255, 255, 170);
    text("REC", 39, 38);

    fill(255, 155);
    textAlign(RIGHT, CENTER);
    textSize(12);
    text("LIVE", w - 28, 38);

    noStroke();
    fill(0, 125);
    rect(0, h - 78, w, 78);

    let totalFrames = this.mainCameraVisibleFrames + this.mainHandBurstFrames;
    let elapsed = frameCount - this.mainCameraStartFrame;
    let progress = constrain(elapsed / totalFrames, 0, 1);

    noStroke();
    fill(255, 60);
    rect(28, h - 42, w - 56, 4, 4);

    fill(230, 45, 72);
    rect(28, h - 42, (w - 56) * progress, 4, 4);

    fill(255, 180);
    textAlign(CENTER, CENTER);
    textSize(12);

    if (this.mainHandBurstStarted) {
      text("무언가 화면에 찍히고 있습니다", w / 2, h - 25);
    } else {
      text("업로드된 스토리가 카메라를 켰습니다", w / 2, h - 25);
    }
  }

  displayBloodHandBurst(w, h) {
    if (typeof day5HandImg === "undefined" || !day5HandImg) return;

    let elapsed = frameCount - this.mainHandBurstStartFrame;
    let progress = constrain(elapsed / this.mainHandBurstFrames, 0, 1);
    let count = floor(lerp(8, 24, progress));

    push();
    imageMode(CENTER);

    for (let i = 0; i < count; i++) {
      let x = random(-30, w + 30);
      let y = random(-30, h + 30);
      let s = random(w * 0.4, w * 0.8);
      let a = random(140, 255);

      push();
      translate(x, y);
      rotate(random(-0.8, 0.8));
      tint(255, a);
      image(day5HandImg, 0, 0, s, s);
      noTint();
      pop();
    }

    imageMode(CORNER);
    pop();
  }

  finishMainCameraSequence() {
    this.mainCameraEndingStarted = true;
    this.showEndingScreen("end");
  }

  playEndingVideoAndGoDayZero() {
    if (typeof bgmManager !== "undefined" && bgmManager && typeof bgmManager.stopAll === "function") {
      bgmManager.stopAll();
    }

    if (typeof endingVideo !== "undefined" && endingVideo) {
      if (typeof endingVideoPlaying !== "undefined") {
        endingVideoPlaying = true;
      }

      endingVideo.stop();
      endingVideo.time(0);

      endingVideo.elt.onended = () => {
        this.moveToDayZeroAfterEnding();
      };

      endingVideo.play();
      return;
    }

    this.moveToDayZeroAfterEnding();
  }

  moveToDayZeroAfterEnding() {
    if (typeof endingVideoPlaying !== "undefined") {
      endingVideoPlaying = false;
    }

    if (typeof endingVideo !== "undefined" && endingVideo) {
      endingVideo.stop();
      endingVideo.time(0);
      if (endingVideo.elt) endingVideo.elt.onended = null;
    }

    if (typeof dateManager !== "undefined" && dateManager) {
      dateManager.currentDay = 0;
      dateManager.day4StoryUploadUnlocked = false;
      dateManager.day4StoryUploadReady = false;
      dateManager.day4StoryUploadHintPlayed = false;
      dateManager.storyUploadResolved = true;
      dateManager.loadDailyData();
    }

    if (typeof phone !== "undefined" && phone) {
      phone.expanded = true;
      phone.targetScale = 1;
      phone.targetFlipProgress = 1;
      phone.targetX = phone.bigX;
      phone.targetY = phone.bigY;

      if (phone.instagram) {
        phone.instagram.currentAccount = "main";
        phone.instagram.currentScreen = "feed";
      }
    }

    if (typeof instagramStarted !== "undefined") {
      instagramStarted = true;
    }

    if (typeof gameState !== "undefined") {
      gameState = "PLAY";
    }

    if (
      typeof bgmManager !== "undefined" &&
      bgmManager &&
      typeof bgmManager.playForDay === "function"
    ) {
      bgmManager.playForDay(0);
    }

    if (
      typeof dateManager !== "undefined" &&
      dateManager &&
      typeof monologue !== "undefined" &&
      monologue &&
      !dateManager.startMonologuePlayed[0]
    ) {
      let startText = dateManager.getStartMonologue(0);

      if (startText) {
        monologue.start(startText);
      }

      dateManager.startMonologuePlayed[0] = true;
    }
  }

  closeMainCamera() {
    this.mode = "camera";
    this.mainCameraActive = false;
    this.mainHandBurstStarted = false;
    this.mainHandBurstStartFrame = 0;
    this.mainCameraStartFrame = 0;
    this.mainCameraEndingStarted = false;
    this.instagramUI.currentScreen = "feed";
  }
}
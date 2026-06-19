// ======================================================
// room.js
// ======================================================
class Room {
  constructor(bgImg = null) {
    this.bgImg = bgImg;

    this.bgFocusX = 0.5;
    this.bgFocusY = 0.82;
  }

  display() {
    if (this.bgImg) {
      this.drawCoverImage(
        this.bgImg,
        0, 0, width, height,
        this.bgFocusX,
        this.bgFocusY
      );
    } else {
      background(20);
    }

    noStroke();
    fill(0, 45);
    rect(0, 0, width, height);

    fill(255, 200);
    textAlign(LEFT, TOP);
    textSize(36);
    textStyle(BOLD);

    let dayText = dateManager.currentDay === 0 ? "Day 0" : `Day ${dateManager.currentDay}`;
    text(dayText, 30, 30);
  }

  drawCoverImage(img, x, y, w, h, focusX = 0.5, focusY = 0.5) {
    let imgRatio = img.width / img.height;
    let canvasRatio = w / h;

    let sx, sy, sw, sh;

    if (imgRatio > canvasRatio) {
      sh = img.height;
      sw = img.height * canvasRatio;

      sx = img.width * focusX - sw / 2;
      sx = constrain(sx, 0, img.width - sw);

      sy = 0;
    } else {
      sw = img.width;
      sh = img.width / canvasRatio;

      sy = img.height * focusY - sh / 2;
      sy = constrain(sy, 0, img.height - sh);

      sx = 0;
    }

    image(img, x, y, w, h, sx, sy, sw, sh);
  }

  getNextDayButtonBounds() {
    return {
      x: width - 230,
      y: height - 85,
      w: 190,
      h: 55
    };
  }

  displayNextDayButton() {
    if (typeof monologue !== "undefined" && monologue.active) return;
    if (!instagramStarted) return;

    // 0일차에는 다음날로 가기 버튼 삭제
    if (dateManager && dateManager.currentDay === 0) return;

    // 4일차에서 스토리 업로드가 열렸어도 버튼 이름을 바꾸지 않음.
    // 대신 안내 패널만 보여줌.
    if (
      dateManager &&
      dateManager.currentDay === 4 &&
      (dateManager.day4StoryUploadUnlocked || dateManager.day4StoryUploadReady)
    ) {
      this.displayStoryUploadHint();
      return;
    }

    let b = this.getNextDayButtonBounds();
    let isHover =
      mouseX >= b.x &&
      mouseX <= b.x + b.w &&
      mouseY >= b.y &&
      mouseY <= b.y + b.h;

    drawingContext.save();
    drawingContext.shadowColor = "rgba(0, 0, 0, 0.35)";
    drawingContext.shadowBlur = isHover ? 24 : 14;
    drawingContext.shadowOffsetY = 8;

    noStroke();
    fill(isHover ? color(200, 56, 66) : color(180, 45, 55));
    rect(b.x, b.y, b.w, b.h, 16);
    drawingContext.restore();

    stroke(255, 255, 255, isHover ? 90 : 45);
    strokeWeight(1.1);
    noFill();
    rect(b.x, b.y, b.w, b.h, 16);

    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(17);
    textStyle(BOLD);
    text("다음 날로 가기", b.x + b.w / 2, b.y + b.h / 2);
  }

  displayStoryUploadHint() {
    let panelW = 330;
    let panelH = 64;
    let panelX = width - panelW - 38;
    let panelY = height - panelH - 30;

    drawingContext.save();
    drawingContext.shadowColor = "rgba(0, 0, 0, 0.45)";
    drawingContext.shadowBlur = 22;
    drawingContext.shadowOffsetY = 9;

    noStroke();
    fill(12, 14, 20, 225);
    rect(panelX, panelY, panelW, panelH, 18);
    drawingContext.restore();

    stroke(255, 255, 255, 42);
    strokeWeight(1);
    noFill();
    rect(panelX, panelY, panelW, panelH, 18);

    noStroke();
    fill(220, 42, 66);
    circle(panelX + 34, panelY + panelH / 2, 22);

    fill(255);
    textAlign(LEFT, CENTER);
    textSize(15);
    textStyle(BOLD);
    text("내 스토리를 눌러 범인을 태그하자", panelX + 58, panelY + 25);

    fill(255, 155);
    textSize(12);
    textStyle(NORMAL);
    text("인스타 상단의 내 스토리 버튼을 사용하세요", panelX + 58, panelY + 45);
  }

  displayEndingButton() {
    // 5일차 제거 후 사용하지 않음
  }

  checkClick(mx, my) {
    if (typeof monologue !== "undefined" && monologue.active) {
      return false;
    }

    if (!instagramStarted) return false;

    // 0일차에는 다음날 버튼 클릭 없음
    if (dateManager && dateManager.currentDay === 0) return false;

    let b = this.getNextDayButtonBounds();

    if (mx > b.x && mx < b.x + b.w && my > b.y && my < b.y + b.h) {
      if (!areAllCluesChecked()) {
        if (typeof monologue !== "undefined") {
          monologue.start("아직 확인할 게 남은 것 같다.");
        }
        return true;
      }

      // 4일차에는 5일차로 넘어가지 않고 독백만 출력.
      // 버튼 문구는 계속 "다음 날로 가기"로 유지.
      if (dateManager && dateManager.currentDay === 4) {
        dateManager.day4StoryUploadUnlocked = true;
        dateManager.day4StoryUploadReady = true;
        dateManager.day4StoryUploadHintPlayed = true;

        if (typeof monologue !== "undefined") {
          monologue.start("범인을 알 것 같아. 스토리를 활용해보자");
        }

        return true;
      }

      dateManager.advanceDay();

      if (phone) {
        phone.expanded = true;
        phone.targetScale = 1;
        phone.targetFlipProgress = 1;
        phone.targetX = phone.bigX;
        phone.targetY = phone.bigY;
      }

      if (phone && phone.instagram) {
        phone.instagram.currentScreen = "feed";
      }

      if (
        dateManager &&
        !dateManager.startMonologuePlayed[dateManager.currentDay]
      ) {
        let startText = dateManager.getStartMonologue(dateManager.currentDay);

        if (startText && typeof monologue !== "undefined") {
          monologue.start(startText);
        }

        dateManager.startMonologuePlayed[dateManager.currentDay] = true;
      }

      return true;
    }

    return false;
  }
}
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
      // 이미지가 캔버스보다 가로로 긴 경우: 좌우 crop
      sh = img.height;
      sw = img.height * canvasRatio;

      sx = img.width * focusX - sw / 2;
      sx = constrain(sx, 0, img.width - sw);

      sy = 0;
    } else {
      // 이미지가 캔버스보다 세로로 긴 경우: 위아래 crop
      sw = img.width;
      sh = img.width / canvasRatio;

      sy = img.height * focusY - sh / 2;
      sy = constrain(sy, 0, img.height - sh);

      sx = 0;
    }

    image(img, x, y, w, h, sx, sy, sw, sh);
  }

  displayNextDayButton() {
    // 독백 텍스트 상자가 떠 있을 때는 다음날 버튼 숨김
    if (typeof monologue !== "undefined" && monologue.active) return;

    // 인스타그램이 시작되기 전에는 버튼 숨김
    if (!instagramStarted) return;

    // 5일차 엔딩 버튼과 겹치지 않도록 처리
    if (
      dateManager &&
      (
        dateManager.currentDay === 5 ||
        dateManager.day5EndingReady
      )
    ) return;

    let bx = width - 190;
    let by = height - 85;
    let bw = 150;
    let bh = 55;

    fill(180, 45, 55);
    noStroke();
    rect(bx, by, bw, bh, 12);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(17);
    textStyle(BOLD);
    text("다음 날로 가기", bx + bw / 2, by + bh / 2);
  }

  displayEndingButton() {
    if (typeof monologue !== "undefined" && monologue.active) return;

    if (!dateManager || !dateManager.day5EndingReady) return;

    fill(120, 20, 20);
    rect(50, height - 100, 220, 50, 10);

    fill(255);
    textAlign(LEFT, BASELINE);
    textSize(16);
    text("사건의 전말 확인하기", 70, height - 70);
  }

  checkClick(mx, my) {
    // 독백 중에는 버튼 클릭 자체를 무시
    if (typeof monologue !== "undefined" && monologue.active) {
      return false;
    }

    // 5일차 엔딩 버튼
    if (dateManager && dateManager.day5EndingReady) {
      if (mx > 50 && mx < 270 && my > height - 100 && my < height - 50) {
        if (typeof startEndingVideo === "function") {
          startEndingVideo();
        }
        return true;
      }
      return false;
    }

    if (!instagramStarted) return false;

    let bx = width - 230;
    let by = height - 85;
    let bw = 190;
    let bh = 55;

    if (mx > bx && mx < bx + bw && my > by && my < by + bh) {
      if (!areAllCluesChecked()) {
        if (typeof monologue !== "undefined") {
          monologue.start("아직 확인할 게 남은 것 같다.");
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

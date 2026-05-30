// ======================================================
// PhoneUI 클래스
// 
// 역할:
// 1. 핸드폰 프레임 그리기
// 2. 핸드폰 확대/축소 애니메이션
// 3. 홈 버튼 클릭 처리
// 4. 마우스 좌표를 핸드폰/앱 내부 좌표로 변환
// 5. InstagramUI 객체를 내부에 가지고 있음
// 6. 마우스 휠 입력을 InstagramUI에 전달
// ======================================================

class PhoneUI {
  constructor() {
    this.w = 430;
    this.h = 780;

    this.appX = 20;
    this.appY = 40;
    this.appW = 390;
    this.appH = 700;

    this.scale = 1;
    this.targetScale = 1;

    this.expanded = true;

    this.bigX = width / 2;
    this.bigY = height / 2;

    this.smallX = width - 145;
    this.smallY = height - 160;

    this.x = this.bigX;
    this.y = this.bigY;
    this.targetX = this.bigX;
    this.targetY = this.bigY;

    this.instagram = new InstagramUI(this.appW, this.appH);
  }

  update() {
    this.scale = lerp(this.scale, this.targetScale, 0.12);
    this.x = lerp(this.x, this.targetX, 0.12);
    this.y = lerp(this.y, this.targetY, 0.12);

    this.instagram.update();
  }

  display() {
    push();

    translate(this.x, this.y);
    scale(this.scale);
    translate(-this.w / 2, -this.h / 2);

    this.displayFrame();

    push();

    drawingContext.save();
    this.createRoundedClip(this.appX, this.appY, this.appW, this.appH, 26);

    translate(this.appX, this.appY);
    this.instagram.display();

    drawingContext.restore();

    pop();

    this.displayHomeButton();

    pop();
  }

  displayFrame() {
    noStroke();

    fill(0, 70);
    rect(10, 12, this.w, this.h, 45);

    fill(20);
    rect(0, 0, this.w, this.h, 45);

    fill(245);
    rect(this.appX, this.appY, this.appW, this.appH, 26);

    fill(5);
    rect(this.w / 2 - 60, 12, 120, 25, 15);

    fill(50);
    circle(this.w / 2 + 40, 24, 9);
  }

  displayHomeButton() {
    fill(35);
    stroke(80);
    strokeWeight(2);
    circle(this.w / 2, this.h - 22, 34);

    noStroke();
    fill(180);
    textAlign(CENTER);
    textStyle(NORMAL);
    textSize(10);

    if (this.expanded) {
      text("MINI", this.w / 2, this.h - 18);
    } else {
      text("OPEN", this.w / 2, this.h - 18);
    }

    strokeWeight(1);
  }

  displayMiniGuide() {
    fill(255, 240);
    noStroke();
    rect(width - 305, height - 85, 265, 42, 14);

    fill(30);
    textAlign(CENTER);
    textStyle(BOLD);
    textSize(14);
    text("작아진 핸드폰을 클릭하면 다시 열림", width - 172, height - 59);
  }

  handleMousePressed() {
    let phoneMouse = this.getPhoneLocalMouse();

    if (!this.expanded && this.isMouseInsidePhone()) {
      this.expand();
      return;
    }

    if (phoneMouse !== null && this.isHomeButtonClicked(phoneMouse.x, phoneMouse.y)) {
      this.toggleSize();
      return;
    }

    if (this.expanded) {
      let appMouse = this.getAppLocalMouse();

      if (appMouse !== null) {
        this.instagram.handleClick(appMouse.x, appMouse.y);
      }
    }
  }

  handleMouseWheel(delta) {
    // 핸드폰이 커져 있고, 마우스가 앱 화면 안에 있을 때만 피드 스크롤
    if (!this.expanded) {
      return;
    }

    let appMouse = this.getAppLocalMouse();

    if (appMouse !== null) {
      this.instagram.handleWheel(delta);
    }
  }

  toggleSize() {
    if (this.expanded) {
      this.minimize();
    } else {
      this.expand();
    }
  }

  minimize() {
    this.expanded = false;

    this.targetScale = 0.35;
    this.targetX = this.smallX;
    this.targetY = this.smallY;
  }

  expand() {
    this.expanded = true;

    this.targetScale = 1;
    this.targetX = this.bigX;
    this.targetY = this.bigY;
  }

  getPhoneLocalMouse() {
    let localX = (mouseX - this.x) / this.scale + this.w / 2;
    let localY = (mouseY - this.y) / this.scale + this.h / 2;

    if (
      localX >= 0 &&
      localX <= this.w &&
      localY >= 0 &&
      localY <= this.h
    ) {
      return {
        x: localX,
        y: localY
      };
    }

    return null;
  }

  getAppLocalMouse() {
    let phoneMouse = this.getPhoneLocalMouse();

    if (phoneMouse === null) {
      return null;
    }

    let appLocalX = phoneMouse.x - this.appX;
    let appLocalY = phoneMouse.y - this.appY;

    if (
      appLocalX >= 0 &&
      appLocalX <= this.appW &&
      appLocalY >= 0 &&
      appLocalY <= this.appH
    ) {
      return {
        x: appLocalX,
        y: appLocalY
      };
    }

    return null;
  }

  isMouseInsidePhone() {
    return this.getPhoneLocalMouse() !== null;
  }

  isHomeButtonClicked(px, py) {
    let homeX = this.w / 2;
    let homeY = this.h - 22;

    let d = dist(px, py, homeX, homeY);

    return d < 24;
  }

  createRoundedClip(x, y, w, h, r) {
    drawingContext.beginPath();

    drawingContext.moveTo(x + r, y);
    drawingContext.lineTo(x + w - r, y);
    drawingContext.quadraticCurveTo(x + w, y, x + w, y + r);

    drawingContext.lineTo(x + w, y + h - r);
    drawingContext.quadraticCurveTo(x + w, y + h, x + w - r, y + h);

    drawingContext.lineTo(x + r, y + h);
    drawingContext.quadraticCurveTo(x, y + h, x, y + h - r);

    drawingContext.lineTo(x, y + r);
    drawingContext.quadraticCurveTo(x, y, x + r, y);

    drawingContext.closePath();
    drawingContext.clip();
  }
}

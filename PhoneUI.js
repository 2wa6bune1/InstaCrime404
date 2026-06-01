// ======================================================
// PhoneUI.js
// ======================================================
class PhoneUI {
  constructor() {
    this.w = 430;
    this.h = 780;
    this.appX = 20;
    this.appY = 40;
    this.appW = 390;
    this.appH = 700;

    this.expanded = false; 
    this.scale = 0.4; 
    this.targetScale = 0.4; 
    
    this.flipProgress = 0; 
    this.targetFlipProgress = 0;

    this.bigX = width / 2;
    this.bigY = height / 2;
    
    this.smallX = width / 2;
    this.smallY = height - 160;

    this.x = this.smallX; 
    this.y = this.smallY; 
    this.targetX = this.smallX; 
    this.targetY = this.smallY; 

    this.instagram = new InstagramUI(this.appW, this.appH);
  }

  update() {
    this.scale = lerp(this.scale, this.targetScale, 0.12);
    this.x = lerp(this.x, this.targetX, 0.12);
    this.y = lerp(this.y, this.targetY, 0.12);
    this.flipProgress = lerp(this.flipProgress, this.targetFlipProgress, 0.12);
    
    let appMouse = this.getAppLocalMouse() || { x: -999, y: -999 };
    this.instagram.update(appMouse);
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.scale);

    let angleRot = lerp(0.2, 0, this.flipProgress);
    rotate(angleRot);

    let flipAngle = map(this.flipProgress, 0, 1, PI, 0);
    let flipScale = cos(flipAngle);
    scale(abs(flipScale), 1); 
    
    translate(-this.w / 2, -this.h / 2);

    let isPhoneHovered = !this.expanded && this.isMouseInsidePhone();

    if (this.flipProgress < 0.5) {
      this.displayPhoneBack(isPhoneHovered);
    } else {
      this.displayFrame();

      push();
      drawingContext.save();
      this.createRoundedClip(this.appX, this.appY, this.appW, this.appH, 26);
      translate(this.appX, this.appY);
      
      let appMouse = this.getAppLocalMouse() || { x: -999, y: -999 };
      this.instagram.display(appMouse);

      drawingContext.restore();
      pop();
      
      this.displayHomeButton();
    }
    pop();
  }

  displayPhoneBack(isHover) {
    noStroke();
    fill(0, 70);
    rect(10, 12, this.w, this.h, 45);
    
    fill(35);
    if (isHover) {
      let glow = 150 + sin(frameCount * 0.1) * 105;
      stroke(glow, glow, 255);
      strokeWeight(8);
    }
    rect(0, 0, this.w, this.h, 45);
    noStroke(); 

    fill(20);
    rect(30, 30, 150, 160, 35);
    fill(5);
    circle(75, 75, 50);
    circle(75, 145, 50);
    circle(140, 110, 40);
    fill(25);
    circle(75, 75, 30);
    circle(75, 145, 30);
    circle(140, 110, 20);
    fill(200, 200, 150);
    circle(140, 60, 15);
    fill(55);
    circle(this.w / 2, this.h / 2 - 20, 60);
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
    strokeWeight(1);
  }

  handleMousePressed() {
    let phoneMouse = this.getPhoneLocalMouse();
    if (phoneMouse === null) return false; 

    if (!this.expanded) {
      this.expand();
      return true; 
    }

    if (this.isHomeButtonClicked(phoneMouse.x, phoneMouse.y)) {
      this.minimize();
      return true; 
    }

    if (this.expanded) {
      let appMouse = this.getAppLocalMouse();
      if (appMouse !== null) {
        this.instagram.handleClick(appMouse.x, appMouse.y);
      }
    }
    return true; 
  }

  handleMouseWheel(event) {
    if (!this.expanded) return;
    let appMouse = this.getAppLocalMouse();
    if (appMouse !== null) {
      this.instagram.handleWheel(event);
    }
  }

  minimize() {
    this.expanded = false;
    this.targetScale = 0.4; 
    this.targetFlipProgress = 0; 
    this.targetX = this.smallX;
    this.targetY = this.smallY;
    
    // --- 추가: 폰을 엎어놓으면 스토리에서 빠져나와 피드로 초기화 ---
    this.instagram.currentScreen = "feed"; 
  }

  expand() {
    this.expanded = true;
    this.targetScale = 1;
    this.targetFlipProgress = 1; 
    this.targetX = this.bigX;
    this.targetY = this.bigY;
  }

  getPhoneLocalMouse() {
    if (this.flipProgress > 0.05 && this.flipProgress < 0.95) return null;

    let localX = (mouseX - this.x) / this.scale;
    let localY = (mouseY - this.y) / this.scale;

    let angleRot = lerp(0.2, 0, this.flipProgress);
    let rotX = localX * cos(-angleRot) - localY * sin(-angleRot);
    let rotY = localX * sin(-angleRot) + localY * cos(-angleRot);

    let flipAngle = map(this.flipProgress, 0, 1, PI, 0);
    let flipScale = abs(cos(flipAngle));
    if (flipScale < 0.01) flipScale = 0.01;
    
    let scaleX = rotX / flipScale;
    let scaleY = rotY;

    let finalX = scaleX + this.w / 2;
    let finalY = scaleY + this.h / 2;

    if (finalX >= 0 && finalX <= this.w && finalY >= 0 && finalY <= this.h) {
      return { x: finalX, y: finalY };
    }
    return null;
  }

  getAppLocalMouse() {
    let phoneMouse = this.getPhoneLocalMouse();
    if (phoneMouse === null) return null;
    let appLocalX = phoneMouse.x - this.appX;
    let appLocalY = phoneMouse.y - this.appY;
    if (appLocalX >= 0 && appLocalX <= this.appW && appLocalY >= 0 && appLocalY <= this.appH) {
      return { x: appLocalX, y: appLocalY };
    }
    return null;
  }

  isMouseInsidePhone() {
    return this.getPhoneLocalMouse() !== null;
  }

  isHomeButtonClicked(px, py) {
    let homeX = this.w / 2;
    let homeY = this.h - 22;
    return dist(px, py, homeX, homeY) < 24;
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
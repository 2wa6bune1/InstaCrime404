// ======================================================
// monologue.js 
// ======================================================
class MonologueSystem {
  constructor() {
    this.active = false;
    this.text = "";
    this.displayedText = "";
    this.charIndex = 0;
    this.lastUpdateTime = 0;
    this.speed = 40; // 글자가 나타나는 속도 (ms)
  }

  start(t) {
    this.active = true;
    this.text = t;
    this.displayedText = "";
    this.charIndex = 0;
    this.lastUpdateTime = millis();
  }

  update() {
    if (!this.active) return;
    if (this.charIndex < this.text.length) {
      if (millis() - this.lastUpdateTime > this.speed) {
        this.displayedText += this.text[this.charIndex];
        this.charIndex++;
        this.lastUpdateTime = millis();
      }
    }
  }

display() {
    if (!this.active) return;
    
    // 1. 박스 설정 (중앙 기준)
    let boxW = 600;
    let boxH = 100;
    let boxX = width / 2;
    let boxY = height - 90;

    push();
    rectMode(CENTER); // 박스는 중앙 기준
    fill(40, 230);
    noStroke();
    rect(boxX, boxY, boxW, boxH, 15);

    // 2. 텍스트 설정
    fill(255);
    textAlign(LEFT, TOP); // 텍스트는 좌측 상단 기준
    textSize(18);
    textStyle(NORMAL);
    
    // 💡 박스의 중앙 좌표(boxX, boxY)에서 박스 크기의 절반을 빼서 
    // 실제 박스 시작점(좌측 상단)을 정확히 계산합니다.
    let padding = 25;
    let boxLeft = boxX-30;
    let boxTop = boxY - (boxH / 4);
    
    let textX = boxLeft + padding;
    let textY = boxTop + padding;
    let textW = boxW - (padding * 2);
    let textH = boxH - (padding * 2);

    // 텍스트 출력
    text(this.displayedText, textX, textY, textW, textH);

    // 3. 화살표 위치 보정 (박스 오른쪽 하단 모서리 기준)
    if (this.charIndex >= this.text.length) {
      if (frameCount % 60 < 30) {
        fill(200);
        let arrowX = boxLeft + boxW - 30; // 박스 우측
        let arrowY = boxTop + boxH - 20; // 박스 하단
        triangle(arrowX, arrowY, 
                 arrowX + 15, arrowY, 
                 arrowX + 7.5, arrowY + 10);
      }
    }
    pop();
  }

  checkClick() {
    if (!this.active) return false;
    if (this.charIndex < this.text.length) {
      // 출력 중 클릭 시 전체 텍스트 즉시 출력
      this.charIndex = this.text.length;
      this.displayedText = this.text;
    } else {
      // 다 출력된 상태에서 클릭 시 창 닫기
      this.active = false;
    }
    return true; // 클릭 이벤트를 독백이 가로챘음을 반환
  }
}
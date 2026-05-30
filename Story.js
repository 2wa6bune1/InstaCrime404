// ======================================================
// Story 클래스
// 
// 스토리 하나의 데이터를 저장하고,
// 스토리 아이콘을 그리는 역할.
// ======================================================

class Story {
  constructor(name, color1, color2, bg, text) {
    this.name = name;
    this.color1 = color1;
    this.color2 = color2;
    this.bg = bg;
    this.text = text;
  }

  displayIcon(x, y) {
    noFill();
    strokeWeight(4);

    stroke(this.color1);
    arc(x, y, 64, 64, PI, TWO_PI);

    stroke(this.color2);
    arc(x, y, 64, 64, 0, PI);

    noStroke();
    fill(255);
    circle(x, y, 56);

    fill(230);
    circle(x, y, 48);

    fill(100);
    circle(x, y - 5, 14);
    ellipse(x, y + 13, 28, 22);

    strokeWeight(1);
  }
}

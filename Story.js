// ======================================================
// story.js
// ======================================================
class Story {
  constructor(name, color1, color2, bg, text, img = null, type = "default") {
    this.name = name;
    this.color1 = color1;
    this.color2 = color2; 
    this.bg = bg;
    this.text = text;
    this.img = img;
    this.isRead = false; 
    this.type = type;
  }

  displayIcon(x, y) {
    if (!this.isRead || this.cue) {
      let steps = 60;
      for (let i = 0; i < steps; i++) {
        let angle = map(i, 0, steps, 0, TWO_PI);
        let t = map(i, 0, steps, 0, 1);
        let r, g, b;

        if (this.type === "friend") {
          // 초록 계열
          r = lerp(50, 150, t);
          g = lerp(200, 255, t);
          b = lerp(80, 50, t);
        } else {
          // 기존 핑크-오렌지 계열
          r = lerp(255, 255, t);
          g = lerp(80, 200, t);
          b = lerp(150, 30, t);
        }

        stroke(r, g, b);
        strokeWeight(4);
        noFill();
        arc(x, y, 64, 64, angle, angle + TWO_PI / steps + 0.01);
      }
    } else {
      stroke(80);
      strokeWeight(4);
      noFill();
      circle(x, y, 64);
    }

    noStroke();
    fill(40);  circle(x, y, 56);
    fill(60);  circle(x, y, 48);
    fill(150);
    circle(x, y - 5, 14);
    ellipse(x, y + 13, 28, 22);
    strokeWeight(1);
  }

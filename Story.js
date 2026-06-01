// ======================================================
// story.js
// ======================================================
class Story {
  constructor(name, color1, color2, bg, text, img = null) {
    this.name = name;
    this.color1 = color1;
    this.color2 = color2;
    this.bg = bg;
    this.text = text;
    this.img = img;
    this.isRead = false; 
  }

  displayIcon(x, y) {
    noFill();
    strokeWeight(4);

    if (!this.isRead) {
      stroke(this.color1);
      arc(x, y, 64, 64, PI, TWO_PI);
      stroke(this.color2);
      arc(x, y, 64, 64, 0, PI);
    } else {
      stroke(80); 
      circle(x, y, 64);
    }

    noStroke();
    fill(40); 
    circle(x, y, 56);

    fill(60); 
    circle(x, y, 48);

    fill(150); 
    circle(x, y - 5, 14);
    ellipse(x, y + 13, 28, 22);

    strokeWeight(1);
  }
}
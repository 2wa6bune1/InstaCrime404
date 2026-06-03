// ======================================================
// story.js
// ======================================================
class Story {
  constructor(userObj, color1, color2, bg, text, img = null) {
    this.user = userObj;
    this.name = userObj.name; 
    this.color1 = color1;
    this.color2 = color2;
    this.bg = bg;
    this.text = text;
    this.img = img;
    this.isRead = false; 
  }

  displayIcon(x, y, target = window) {
    target.noFill();
    target.strokeWeight(4);

    if (!this.isRead) {
      target.stroke(this.color1);
      target.arc(x, y, 64, 64, PI, TWO_PI);
      target.stroke(this.color2);
      target.arc(x, y, 64, 64, 0, PI);
    } else {
      target.stroke(80); 
      target.circle(x, y, 64);
    }
    target.strokeWeight(1);
    
    this.user.displayProfile(x, y, 56, target);
  }
}
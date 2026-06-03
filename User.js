// ======================================================
// user.js
// ======================================================
class User {
  constructor(name, profileImg = null) {
    this.name = name;
    this.profileImg = profileImg; 
  }
  
  displayProfile(x, y, r, target = window) {
    if (this.profileImg) {
      target.push();
      target.imageMode(CENTER);
      target.drawingContext.save();
      target.drawingContext.beginPath();
      target.drawingContext.arc(x, y, r / 2, 0, Math.PI * 2);
      target.drawingContext.clip();
      target.image(this.profileImg, x, y, r, r);
      target.drawingContext.restore();
      target.pop();
    } else {
      target.push();
      target.noStroke();
      target.fill(40); target.circle(x, y, r);
      target.fill(60); target.circle(x, y, r * 0.85);
      target.fill(150); target.circle(x, y - r * 0.08, r * 0.25);
      target.arc(x, y + r * 0.23, r * 0.5, r * 0.4, PI, TWO_PI);
      target.pop();
    }
  }
}
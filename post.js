// ======================================================
// post.js
// ======================================================
class Post {
  constructor(userObj, location, caption, likes, bg, img = null) {
    this.userObj = userObj;
    this.user = userObj?.name; 
    this.location = location;
    this.caption = caption;
    this.likes = likes;
    this.bg = bg;
    this.img = img;
    this.liked = false;
  }

  display(y, appW, scrolledMouse = {x: -999, y: -999}) {
    fill(35); 
    noStroke();
    rect(0, y, appW, 400);

    this.userObj.displayProfile(28, y + 28, 36);

    fill(255); 
    textAlign(LEFT, BASELINE);
    textStyle(BOLD);
    textSize(14);
    text(this.user, 55, y + 24);

    textStyle(NORMAL);
    textSize(11);
    fill(150); 
    text(this.location, 55, y + 40);

    fill(255);
    textSize(20);
    text("⋯", 355, y + 30);

    if (this.img) {
      image(this.img, 0, y + 55, appW, 245);
    } else {
      fill(this.bg);
      rect(0, y + 55, appW, 245);
      
      fill(255, 160);
      noStroke();
      ellipse(appW / 2, y + 175, 160, 160);

      fill(255);
      textAlign(CENTER, BASELINE);
      textStyle(BOLD);
      textSize(22);
      text("GAME POST", appW / 2, y + 170);

      textSize(14);
      textStyle(NORMAL);
      text("이미지 영역", appW / 2, y + 195);
    }

    textSize(26);
    
    let iconY = y + 326; 
    let isLikeHover = dist(scrolledMouse.x, scrolledMouse.y, 28, iconY) < 20;
    let isCommentHover = dist(scrolledMouse.x, scrolledMouse.y, 72, iconY) < 20;
    let isDmHover = dist(scrolledMouse.x, scrolledMouse.y, 116, iconY) < 20;
    let isBookmarkHover = dist(scrolledMouse.x, scrolledMouse.y, 362, iconY) < 20;
    
    push();
    translate(28, iconY); 
    textAlign(CENTER, CENTER);
    if (isLikeHover) scale(1.2); 
    if (this.liked) {
      fill(255, 40, 80); 
      noStroke();
      textSize(28);
      text("♥", 0, 2);
    } else {
      fill(isLikeHover ? color(255, 150, 150) : 255);
      noStroke();
      textSize(28);
      text("♡", 0, 2);
    }
    pop();

    push();
    translate(72, iconY);
    if (isCommentHover) scale(1.2);
    stroke(isCommentHover ? color(150, 200, 255) : 255);
    strokeWeight(2);
    noFill();
    strokeJoin(ROUND);
    beginShape();
    vertex(-9, -6);
    vertex(9, -6);
    vertex(9, 6);
    vertex(-1, 6);
    vertex(-5, 10);
    vertex(-5, 6);
    vertex(-9, 6);
    endShape(CLOSE);
    pop();

    push();
    translate(116, iconY);
    if (isDmHover) scale(1.2);
    stroke(isDmHover ? color(150, 200, 255) : 255);
    strokeWeight(2);
    noFill();
    strokeJoin(ROUND);
    beginShape();
    vertex(-9, 5); 
    vertex(8, -8);
    vertex(4, 9);
    vertex(-1, 1);
    endShape(CLOSE);
    pop();

    push();
    translate(362, iconY);
    if (isBookmarkHover) scale(1.2);
    stroke(isBookmarkHover ? color(150, 200, 255) : 255);
    strokeWeight(2);
    noFill();
    strokeJoin(ROUND);
    beginShape();
    vertex(-6, -8);
    vertex(6, -8);
    vertex(6, 9);
    vertex(0, 5);
    vertex(-6, 9);
    endShape(CLOSE);
    pop();

    fill(255);
    noStroke();
    textAlign(LEFT, BASELINE);
    textSize(13);
    textStyle(BOLD);
    text(this.likes + " likes", 18, y + 360);

    textStyle(NORMAL);
    text(this.user + " " + this.caption, 18, y + 382);

    stroke(50); 
    line(0, y + 400, appW, y + 400);
  }

  toggleLike() {
    this.liked = !this.liked;
    if (this.liked) {
      this.likes++;
    } else {
      this.likes--;
    }
  }
}

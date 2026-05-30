// ======================================================
// Post 클래스
// 
// 게시물 하나의 데이터를 저장하고,
// 게시물 카드와 좋아요 기능을 관리함.
// ======================================================

class Post {
  constructor(user, location, caption, likes, bg) {
    this.user = user;
    this.location = location;
    this.caption = caption;
    this.likes = likes;
    this.bg = bg;

    this.liked = false;
  }

  display(y, appW) {
    fill(255);
    noStroke();
    rect(0, y, appW, 400);

    fill(40);
    circle(28, y + 28, 36);

    fill(0);
    textAlign(LEFT);
    textStyle(BOLD);
    textSize(14);
    text(this.user, 55, y + 24);

    textStyle(NORMAL);
    textSize(11);
    fill(90);
    text(this.location, 55, y + 40);

    fill(0);
    textSize(20);
    text("⋯", 355, y + 30);

    fill(this.bg);
    rect(0, y + 55, appW, 245);

    fill(255, 160);
    noStroke();
    ellipse(appW / 2, y + 175, 160, 160);

    fill(255);
    textAlign(CENTER);
    textStyle(BOLD);
    textSize(22);
    text("GAME POST", appW / 2, y + 170);

    textSize(14);
    textStyle(NORMAL);
    text("이미지 영역", appW / 2, y + 195);

    textAlign(LEFT);
    textSize(26);

    if (this.liked) {
      fill(255, 40, 80);
      text("♥", 18, y + 334);
    } else {
      fill(0);
      text("♡", 18, y + 334);
    }

    fill(0);
    text("💬", 58, y + 334);
    text("✈", 100, y + 334);
    text("▢", 345, y + 334);

    textSize(13);
    textStyle(BOLD);
    text(this.likes + " likes", 18, y + 360);

    textStyle(NORMAL);
    text(this.user + " " + this.caption, 18, y + 382);

    stroke(230);
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

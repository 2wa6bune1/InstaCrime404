// ======================================================
// story.js
// ======================================================
class Story {
  // 💡 인자에 monoText 추가, 기본값은 빈 문자열("")
  constructor(userObj, bgOrImg, text = "", type = "default", monoText = "") {
    this.user = userObj;
    this.name = userObj ? userObj.name : "Unknown";
    this.text = text;
    this.isRead = false;
    this.type = type;

    // 💡 독백 관련 변수
    this.monoText = monoText;
    this.monoPlayed = false;

    // 전달받은 값이 글자(파일 이름)인지 색상인지 똑똑하게 구분
    if (typeof bgOrImg === 'string' && bgOrImg !== "") {
      this.img = loadImage(bgOrImg);
      this.bg = color(20);
    } else if (bgOrImg && bgOrImg.width !== undefined && bgOrImg.height !== undefined) {
      this.img = bgOrImg;
      this.bg = color(20);
    } else {
      this.img = null;
      this.bg = bgOrImg || color(20);
    }
  }

  displayIcon(x, y, target = window) {
    if (!this.isRead || this.cue) {
      let steps = 60;
      for (let i = 0; i < steps; i++) {
        let angle = map(i, 0, steps, 0, TWO_PI);
        let t = map(i, 0, steps, 0, 1);
        let r, g, b;

        if (this.type === "friend") {
          r = lerp(50, 150, t); g = lerp(200, 255, t); b = lerp(80, 50, t);
        } else {
          r = lerp(255, 255, t); g = lerp(80, 200, t); b = lerp(150, 30, t);
        }

        target.stroke(r, g, b);
        target.strokeWeight(4);
        target.noFill();
        target.arc(x, y, 64, 64, angle, angle + TWO_PI / steps + 0.01);
      }
    } else {
      target.stroke(80);
      target.strokeWeight(4);
      target.noFill();
      target.circle(x, y, 64);
    }

    target.noStroke();

    // 에러 방지: 유저 정보가 있을 때만 프사 그리기
    if (this.user && typeof this.user.displayProfile === 'function') {
      this.user.displayProfile(x, y, 56, target);
    } else {
      target.fill(40); target.circle(x, y, 56);
      target.fill(60); target.circle(x, y, 48);
    }

    target.strokeWeight(1);
  }
}
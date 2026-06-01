// ======================================================
// user.js
// 유저의 닉네임과 프로필 사진을 관리합니다.
// ======================================================
class User {
  constructor(nickname, profileImg) {
    this.nickname = nickname;
    this.profileImg = profileImg; // 이미지가 없으면 null이나 undefined로 들어옴
  }
  
  // 프로필 사진을 그려주는 함수 (x좌표, y좌표, 지름)
  displayProfile(x, y, r) {
    if (this.profileImg) {
      // 이미지가 있으면 이미지를 출력
      image(this.profileImg, x - r/2, y - r/2, r, r);
    } else {
      // 이미지가 없으면 인스타 기본 프로필(회색 사람 실루엣) 출력
      push();
      noStroke();
      fill(200);
      circle(x, y, r);
      fill(100);
      circle(x, y - r * 0.1, r * 0.4);
      arc(x, y + r * 0.3, r * 0.7, r * 0.6, PI, TWO_PI);
      pop();
    }
  }
}
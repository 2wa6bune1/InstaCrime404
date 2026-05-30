// ======================================================
// sketch.js
// 전체 게임 실행을 담당하는 파일
// 
// 인스타 UI와 핸드폰 확대/축소 기능은 클래스로 분리함.
// 게시물 피드는 마우스 휠로 스크롤 가능.
// ======================================================

let phone;

function setup() {
  createCanvas(900, 800);
  textFont("Arial");

  phone = new PhoneUI();
}

function draw() {
 background(255)

  phone.update();
  phone.display();

  if (!phone.expanded) {
    phone.displayMiniGuide();
  }
}

function mousePressed() {
  phone.handleMousePressed();
}

// 마우스 휠 입력 처리
// event.delta가 양수면 아래로 휠, 음수면 위로 휠
function mouseWheel(event) {
  phone.handleMouseWheel(event.delta);

  // 브라우저 페이지 자체가 스크롤되는 것을 막음
  return false;
}

// ======================================================
// 게임 배경 화면
// 현재는 클래스로 분리하지 않고 sketch.js에 유지.
// ======================================================



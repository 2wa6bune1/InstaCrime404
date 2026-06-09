// ======================================================
// room.js
// ======================================================
class Room {
  constructor() {
    this.bgImg = null;
    this.goNextDay = true; 
  }
  
  display() {
    if (this.bgImg) {
      image(this.bgImg, 0, 0, width, height);
    } else {
      background(30); 
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(24);
      text("주인공의 방 (여기에 방 이미지가 깔립니다)", width/2, height/2);
    }

    // --- 추가: 현재 일차(Day) 화면에 표시 ---
    fill(255, 200);
    textAlign(LEFT, TOP);
    textSize(36);
    textStyle(BOLD);
    let dayText = dateManager.currentDay === 0 ? "Day 0" : `Day ${dateManager.currentDay}`;
    text(dayText, 30, 30);
  }

displayNextDayButton() {
  if (
    dateManager &&
    (
      dateManager.currentDay === 5 ||
      dateManager.day5EndingReady
    )
  ) return;

  if (this.goNextDay) {
    fill(255, 100, 100);
    rect(50, height - 100, 160, 50, 10);

    fill(255);
    textAlign(LEFT, BASELINE);
    textSize(16);
    text("다음 날짜로 가기", 70, height - 70);
  }
}

displayEndingButton() {
  if (!dateManager || !dateManager.day5EndingReady) return;

  fill(120, 20, 20);
  rect(50, height - 100, 220, 50, 10);

  fill(255);
  textAlign(LEFT, BASELINE);
  textSize(16);
  text("사건의 전말 확인하기", 70, height - 70);
}

checkClick(mx, my) {
  // 5일차 연출 후 새 버튼
  if (dateManager && dateManager.day5EndingReady) {
  if (mx > 50 && mx < 270 && my > height - 100 && my < height - 50) {
    if (typeof startEndingVideo === "function") {
      startEndingVideo();
    }
  }
  return;
  }

  // 평소 버튼
  if (this.goNextDay && mx > 50 && mx < 210 && my > height - 100 && my < height - 50) {
    dateManager.advanceDay();
    this.goNextDay = false;
  }
}
}


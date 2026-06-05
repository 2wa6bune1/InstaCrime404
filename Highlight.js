// ======================================================
// Highlight.js
// ======================================================
class Highlight {
  constructor(title,x,y) {
    this.title = title;
    this.highlights = []; // 기존 Story 객체들을 담을 배열
    this.x = x; 
    this.y = y; 
  }

  // 하이라이트에 Story 객체 추가하기
  addHightlight(newHighlightPhotos) {
    this.highlights.push(newHighlightPhotos);
  }

  // 프로필 화면에서 하이라이트 동그라미(버튼) 그리기
  displayIcon(isHovered) {
    push();
    translate(this.x, this.y);

    if (isHovered) scale(1.05); // 마우스가 그 위에 있을 때 살짝 커짐. 기준점 중심으로 화면 커짐

    // 하이라이트 테두리 
    stroke(180);
    strokeWeight(1.5);
    noFill();
    circle(0, 0, 64);

    // 첫 번째 스토리에 이미지가 있다면 썸네일처럼 사용
    if (this.highlights.length > 0 && this.highlights[0].img) {
      drawingContext.save(); //도화지 임시 백업하고 
      drawingContext.beginPath(); //새로 시작해야함; 기존 선들과 분리
      drawingContext.arc(0, 0, 28, 0, Math.PI * 2); // 반지름 28 (지름 56)
      drawingContext.clip();
      imageMode(CENTER);
      image(this.highlights[0].img, 0, 0, 56, 56);
      drawingContext.restore();
    } else {
      // 이미지가 없을 때는 기본 회색 아이콘으로 때우기
      noStroke();
      fill(40);  circle(0, 0, 56);
      fill(60);  circle(0, 0, 48);
    }

    // 하이라이트 제목
    fill(255);
    noStroke();
    textAlign(CENTER, BASELINE);
    textSize(11);
    textStyle(NORMAL);
    text(this.title, 0, 48);

    pop();
  }

  // 클릭 감지
 checkClick(mx, my, instagramUI) {
    if (dist(mx, my, this.x, this.y) < 30) {
      this.play(instagramUI); 
      return true; // 클릭 처리 후에는 true 반환하게끔
    }
    return false; 
  }

 play(instagramUI) {
    // 사진이 없을 때 실행 취소
    if (this.highlights.length === 0) return;

    // 원본 보호; 원래 스토리 사진들을 백업
    if (!instagramUI.backupStories) { //백업하는 곳이 비어 있을 때만 (하이라이트로 덮어씌워지는 버그 방지용)
      instagramUI.backupStories = instagramUI.stories; // 새 객체 만들어서 원본 스토리들 저장
    }

    // 필름 교체; 원래 스토리 보여주는 데에다가 하이라이트 사진 덮어씌우기
    instagramUI.stories = this.highlights;
    
    // 초기화. 첫 번째 사진부터, 타이머는 0초부터로 리셋해야됨
    instagramUI.currentStory = 0;           
    instagramUI.storyElapsedTime = 0;       
    instagramUI.isTransitioning = false;    
    
    // 인스타그램 UI한테 스토리 그리라고 함
    instagramUI.currentScreen = "story";

  }
}
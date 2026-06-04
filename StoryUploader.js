// ======================================================
// StoryUploader.js
// ======================================================
class StoryUploader {
  constructor(instagramUI) {
    this.instagramUI = instagramUI;

    // 화면 단계: camera → tag → result
    this.mode = "camera";

    // 카메라/귀신 연출 상태
    this.cameraStartFrame = 0;
    this.ghostEffectDone = false;

    // 귀신 연출 길이
    this.ghostEffectDuration = 240;

    // 태그 선택 상태
    this.selectedTarget = null;
    this.resultType = null;

    // 태그 후보
    // main은 정답 후보지만, 화면에는 "나"가 아니라 ??? 계정처럼 보이게 처리
    this.tagTargets = [
      {
        id: "jian",
        name: "최지안",
        handle: "@its_ji.anni"
      },
      {
        id: "sua",
        name: "정수아",
        handle: "@sua.archive"
      },
      {
        id: "seojun",
        name: "이서준",
        handle: "@seo_jun.lee"
      },
      {
        id: "haeun",
        name: "강하은",
        handle: "@grace_haeun"
      },
      {
        id: "main",
        name: "???",
        handle: "@unknown.archive"
      }
    ];
  }

  // 내 스토리 / 프로필 클릭 시 호출
  open() {
    this.instagramUI.currentScreen = "storyUpload";

    this.mode = "camera";

    this.cameraStartFrame = frameCount;
    this.ghostEffectDone = false;

    this.selectedTarget = null;
    this.resultType = null;
  }

  // InstagramUI에서 호출하는 메인 display 함수
  display(appMouse = { x: -999, y: -999 }) {
    if (this.mode === "camera") {
      this.displayCameraScreen(appMouse);
    } else if (this.mode === "tag") {
      this.displayTagScreen(appMouse);
    } else if (this.mode === "result") {
      this.displayResultScreen(appMouse);
    }
  }

  // ======================================================
  // 1. 카메라 화면
  // ======================================================
  displayCameraScreen(appMouse) {
    let w = this.instagramUI.w;
    let h = this.instagramUI.h;

    background(8);

    noStroke();
    fill(18);
    rect(0, 0, w, h);

    this.displayCameraNoise(w, h);
    this.displayCameraTopUI(w, h);
    this.displayCameraPreview(w, h);

    // 귀신 연출 자리: 현재는 강한 노이즈/글리치
    this.displayGhostEffect(w, h);

    // 촬영 버튼은 보이지만 작동하지 않음
    this.displayCameraBottomUI(w, h, appMouse);

    // 귀신 연출 종료 후 자동으로 스토리 태그 화면으로 이동
    this.updateGhostSequence();
  }

  displayCameraNoise(w, h) {
    // 카메라 기본 노이즈: 약하게 계속 깔림
    for (let i = 0; i < 25; i++) {
      noStroke();
      fill(255, random(5, 20));
      rect(random(w), random(h), random(1, 2), random(1, 2));
    }
  }

  displayCameraTopUI(w, h) {
    fill(255);
    noStroke();

    // 닫기 버튼
    textAlign(LEFT, CENTER);
    textSize(30);
    textStyle(NORMAL);
    text("×", 24, 38);

    // 화면 타이틀
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text("스토리", w / 2, 38);

    // 우측 더미 아이콘
    textAlign(RIGHT, CENTER);
    textSize(22);
    text("⚙", w - 24, 38);
  }

  displayCameraPreview(w, h) {
    push();

    // 중앙 초점 박스
    noFill();
    stroke(255, 60);
    strokeWeight(1.5);
    rectMode(CENTER);
    rect(w / 2, h / 2 - 20, 210, 280, 14);

    // 안내 문구
    noStroke();
    fill(255, 85);
    textAlign(CENTER, CENTER);
    textSize(14);
    textStyle(NORMAL);
    text("카메라가 켜졌습니다", w / 2, h / 2 - 20);

    pop();
  }

  // ======================================================
  // 귀신 연출 자리

  displayGhostEffect(w, h) {
    let t = frameCount - this.cameraStartFrame;
  
    // 전체 연출 진행도
    let progress = constrain(t / this.ghostEffectDuration, 0, 1);
  
    // 노이즈 강도: 중간에 가장 강함
    let intensity = sin(progress * PI);
  
    // 1. 기본 강한 노이즈
    let noiseCount = floor(map(intensity, 0, 1, 30, 260));
  
    for (let i = 0; i < noiseCount; i++) {
      noStroke();
  
      if (random() < 0.65) {
        fill(255, random(40, 150) * intensity);
      } else {
        fill(0, random(40, 120) * intensity);
      }
  
      rect(
        random(w),
        random(h),
        random(1, 5),
        random(1, 5)
      );
    }
  
    // 2. 귀신이 지나가는 구간
    // 45~75프레임 사이에만 등장
    let ghostStart = 45;
    let ghostEnd = 75;
  
    if (t >= ghostStart && t <= ghostEnd) {
      let ghostProgress = map(t, ghostStart, ghostEnd, 0, 1);
  
      // 왼쪽 밖에서 오른쪽 밖으로 빠르게 이동
      let ghostX = lerp(-120, w + 120, ghostProgress);
  
      // 살짝 위아래로 흔들림
      let ghostY = h / 2 - 40 + sin(t * 0.45) * 12;
  
      // 등장 중간에 가장 진하게
      let ghostAlpha = sin(ghostProgress * PI) * 150;
  
      push();
  
      // 약간 블러처럼 보이게 여러 겹 그림
      noStroke();
  
      fill(255, ghostAlpha * 0.18);
      ellipse(ghostX - 18, ghostY + 10, 95, 220);
  
      fill(255, ghostAlpha * 0.32);
      ellipse(ghostX, ghostY, 70, 190);
  
      fill(230, ghostAlpha * 0.45);
      ellipse(ghostX + 10, ghostY - 35, 48, 70);
  
      // 머리카락/그림자 느낌
      fill(0, ghostAlpha * 0.35);
      ellipse(ghostX + 7, ghostY - 55, 58, 80);
  
      // 얼굴 구멍 느낌
      fill(0, ghostAlpha * 0.65);
      ellipse(ghostX - 5, ghostY - 50, 7, 18);
      ellipse(ghostX + 16, ghostY - 50, 7, 18);
  
      // 입처럼 보이는 어두운 구멍
      ellipse(ghostX + 6, ghostY - 20, 13, 28);
  
      pop();
  
      // 귀신이 지나가는 동안 화면 찢김 강화
      for (let i = 0; i < 8; i++) {
        noStroke();
        fill(255, random(20, 90));
        rect(random(-20, 20), random(h), w + random(20, 80), random(2, 8));
      }
  
      // 순간 플래시
      if (random() < 0.25) {
        noStroke();
        fill(255, random(40, 120));
        rect(0, 0, w, h);
      }
    }
  
    // 3. 가로줄 글리치
    let glitchLineCount = floor(map(intensity, 0, 1, 1, 10));
  
    for (let i = 0; i < glitchLineCount; i++) {
      let y = random(h);
      let lineH = random(2, 12);
  
      noStroke();
      fill(255, random(20, 80) * intensity);
      rect(0, y, w, lineH);
    }
  
    // 4. 검은 가로줄
    if (random() < 0.35 * intensity) {
      noStroke();
      fill(0, random(80, 180));
      rect(0, random(h), w, random(6, 24));
    }
  
    // 5. 중간 구간 번쩍임
    if (
      t > this.ghostEffectDuration * 0.42 &&
      t < this.ghostEffectDuration * 0.58
    ) {
      if (random() < 0.18) {
        noStroke();
        fill(255, random(60, 140));
        rect(0, 0, w, h);
      }
    }
  }

  displayCameraBottomUI(w, h, appMouse = { x: -999, y: -999 }) {
    let buttonX = w / 2;
    let buttonY = h - 72;

    let isShotHover = dist(appMouse.x, appMouse.y, buttonX, buttonY) < 45;

    // 하단 어두운 영역
    noStroke();
    fill(0, 120);
    rect(0, h - 135, w, 135);

    // 좌측 최근 사진 더미 버튼
    fill(40);
    rect(35, h - 95, 48, 48, 10);

    fill(255, 90);
    textAlign(CENTER, CENTER);
    textSize(10);
    textStyle(NORMAL);
    text("최근", 59, h - 71);

    // 중앙 촬영 버튼
    // 보이지만 실제 기능은 없음
    push();
    translate(buttonX, buttonY);

    if (isShotHover) {
      scale(1.05);
    }

    noFill();
    stroke(255);
    strokeWeight(4);
    circle(0, 0, 66);

    noStroke();
    fill(255, 90);
    circle(0, 0, 50);

    pop();

    // 우측 카메라 전환 더미 버튼
    fill(255, 180);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    text("↺", w - 60, h - 72);

    // 하단 모드 텍스트
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(13);
    textStyle(BOLD);
    text("스토리", w / 2, h - 25);
  }

  updateGhostSequence() {
    let t = frameCount - this.cameraStartFrame;

    if (t >= this.ghostEffectDuration && !this.ghostEffectDone) {
      this.ghostEffectDone = true;
      this.mode = "tag";
    }
  }

  // ======================================================
  // 2. 스토리 태그 화면
  // ======================================================
  displayTagScreen(appMouse) {
    let w = this.instagramUI.w;
    let h = this.instagramUI.h;

    background(12);

    noStroke();
    fill(18);
    rect(0, 0, w, h);

    this.displayTagTopUI(w, h);
    this.displayStoryTagPreview(w, h);
    this.displayTagTargetList(w, h, appMouse);
    this.displayShareButton(w, h, appMouse);
  }

  displayTagTopUI(w, h) {
    fill(255);
    noStroke();

    // 닫기
    textAlign(LEFT, CENTER);
    textSize(30);
    textStyle(NORMAL);
    text("×", 24, 38);

    // 타이틀
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text("스토리 작성", w / 2, 38);
  }

  displayStoryTagPreview(w, h) {
    let cardX = 35;
    let cardY = 82;
    let cardW = w - 70;
    let cardH = 260;

    // 스토리 미리보기 카드
    noStroke();
    fill(25);
    rect(cardX, cardY, cardW, cardH, 22);

    // 어두운 오버레이
    fill(0, 90);
    rect(cardX, cardY, cardW, cardH, 22);

    // 상단 작은 텍스트
    fill(255, 75);
    textAlign(CENTER, CENTER);
    textSize(12);
    textStyle(NORMAL);
    text("스토리 미리보기", w / 2, cardY + 30);

    // 본문 문구
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(28);
    textStyle(BOLD);
    text("네가 범인이야", w / 2, cardY + 110);

    // 선택된 태그
    if (this.selectedTarget) {
      let target = this.getTargetById(this.selectedTarget);

      fill(220, 40, 60);
      textSize(24);
      textStyle(BOLD);
      text(target.handle, w / 2, cardY + 158);

      fill(255, 130);
      textSize(13);
      textStyle(NORMAL);
      text(target.name + " 태그됨", w / 2, cardY + 195);
    } else {
      fill(255, 130);
      textSize(22);
      textStyle(BOLD);
      text("@_____", w / 2, cardY + 158);

      fill(255, 100);
      textSize(13);
      textStyle(NORMAL);
      text("태그할 계정을 선택하세요", w / 2, cardY + 195);
    }
  }

  displayTagTargetList(w, h, appMouse) {
    fill(255);
    textAlign(LEFT, CENTER);
    textSize(15);
    textStyle(BOLD);
    text("태그할 계정", 45, 375);

    let startY = 405;
    let itemX = 35;
    let itemW = w - 70;
    let itemH = 48;
    let gap = 8;

    for (let i = 0; i < this.tagTargets.length; i++) {
      let target = this.tagTargets[i];
      let y = startY + i * (itemH + gap);

      let isHover =
        appMouse.x >= itemX &&
        appMouse.x <= itemX + itemW &&
        appMouse.y >= y &&
        appMouse.y <= y + itemH;

      let isSelected = this.selectedTarget === target.id;

      if (isSelected) {
        fill(200, 40, 60);
      } else if (isHover) {
        fill(50);
      } else {
        fill(32);
      }

      noStroke();
      rect(itemX, y, itemW, itemH, 13);

      // 프로필 더미 원
      fill(isSelected ? 255 : 70);
      circle(itemX + 28, y + itemH / 2, 28);

      fill(isSelected ? color(200, 40, 60) : color(180));
      textAlign(CENTER, CENTER);
      textSize(13);
      textStyle(BOLD);
      text(target.name.charAt(0), itemX + 28, y + itemH / 2);

      // 이름/핸들
      fill(255);
      textAlign(LEFT, CENTER);
      textSize(14);
      textStyle(BOLD);
      text(target.name, itemX + 55, y + 17);

      fill(255, 145);
      textSize(12);
      textStyle(NORMAL);
      text(target.handle, itemX + 55, y + 34);

      // 선택 체크
      if (isSelected) {
        fill(255);
        textAlign(RIGHT, CENTER);
        textSize(18);
        textStyle(BOLD);
        text("✓", itemX + itemW - 20, y + itemH / 2);
      }
    }
  }

  displayShareButton(w, h, appMouse) {
    let buttonX = 45;
    let buttonY = h - 62;
    let buttonW = w - 90;
    let buttonH = 42;

    let isHover =
      appMouse.x >= buttonX &&
      appMouse.x <= buttonX + buttonW &&
      appMouse.y >= buttonY &&
      appMouse.y <= buttonY + buttonH;

    if (this.selectedTarget) {
      fill(isHover ? color(230, 60, 80) : color(200, 40, 60));
    } else {
      fill(70);
    }

    noStroke();
    rect(buttonX, buttonY, buttonW, buttonH, 14);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(15);
    textStyle(BOLD);
    text("스토리에 올리기", w / 2, buttonY + buttonH / 2);
  }

  // ======================================================
  // 3. 결과 연결 화면
  // ======================================================
  displayResultScreen(appMouse) {
    let w = this.instagramUI.w;
    let h = this.instagramUI.h;

    background(8);

    noStroke();
    fill(15);
    rect(0, 0, w, h);

    let target = this.getTargetById(this.selectedTarget);

    fill(255);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(24);
    text("스토리가 업로드되었습니다", w / 2, 200);

    fill(255, 170);
    textSize(15);
    textStyle(NORMAL);

    if (this.resultType === "true") {
      text("무언가가 다시 움직이기 시작합니다.", w / 2, 242);
    } else {
      text("하지만 어딘가 잘못된 것 같습니다.", w / 2, 242);
    }

    // 업로드된 스토리 요약
    fill(30);
    noStroke();
    rect(55, 295, w - 110, 120, 18);

    fill(255, 90);
    textSize(12);
    textStyle(NORMAL);
    text("업로드한 스토리", w / 2, 323);

    fill(255);
    textSize(20);
    textStyle(BOLD);
    text("네가 범인이야", w / 2, 357);

    fill(220, 40, 60);
    textSize(18);
    text(target.handle, w / 2, 388);

    // 계속하기 버튼
    let buttonX = 55;
    let buttonY = h - 120;
    let buttonW = w - 110;
    let buttonH = 48;

    let isHover =
      appMouse.x >= buttonX &&
      appMouse.x <= buttonX + buttonW &&
      appMouse.y >= buttonY &&
      appMouse.y <= buttonY + buttonH;

    fill(isHover ? 70 : 50);
    noStroke();
    rect(buttonX, buttonY, buttonW, buttonH, 14);

    fill(255);
    textSize(15);
    textStyle(BOLD);
    text("계속하기", w / 2, buttonY + buttonH / 2);
  }

  // ======================================================
  // 클릭 처리
  // ======================================================
  handleClick(mx, my) {
    if (this.mode === "camera") {
      this.handleCameraClick(mx, my);
    } else if (this.mode === "tag") {
      this.handleTagClick(mx, my);
    } else if (this.mode === "result") {
      this.handleResultClick(mx, my);
    }
  }

  handleCameraClick(mx, my) {
    let w = this.instagramUI.w;
    let h = this.instagramUI.h;

    // 닫기 버튼만 작동
    if (mx < 60 && my < 75) {
      this.close();
      return;
    }

    // 촬영 버튼은 보이지만 작동하지 않음
    if (dist(mx, my, w / 2, h - 72) < 48) {
      // 의도적으로 아무 동작도 하지 않음
      // 귀신 연출이 끝나면 자동으로 태그 화면으로 넘어감
      return;
    }
  }

  handleTagClick(mx, my) {
    let w = this.instagramUI.w;
    let h = this.instagramUI.h;

    // 닫기
    if (mx < 60 && my < 75) {
      this.close();
      return;
    }

    // 태그 대상 클릭
    let startY = 405;
    let itemX = 35;
    let itemW = w - 70;
    let itemH = 48;
    let gap = 8;

    for (let i = 0; i < this.tagTargets.length; i++) {
      let target = this.tagTargets[i];
      let y = startY + i * (itemH + gap);

      if (
        mx >= itemX &&
        mx <= itemX + itemW &&
        my >= y &&
        my <= y + itemH
      ) {
        this.selectedTarget = target.id;
        return;
      }
    }

    // 스토리에 올리기 버튼
    let buttonX = 45;
    let buttonY = h - 62;
    let buttonW = w - 90;
    let buttonH = 42;

    if (
      mx >= buttonX &&
      mx <= buttonX + buttonW &&
      my >= buttonY &&
      my <= buttonY + buttonH
    ) {
      if (this.selectedTarget) {
        this.uploadTaggedStory();
      }
    }
  }

  handleResultClick(mx, my) {
    let w = this.instagramUI.w;
    let h = this.instagramUI.h;

    let buttonX = 55;
    let buttonY = h - 120;
    let buttonW = w - 110;
    let buttonH = 48;

    if (
      mx >= buttonX &&
      mx <= buttonX + buttonW &&
      my >= buttonY &&
      my <= buttonY + buttonH
    ) {
      this.continueAfterResult();
    }
  }

  // ======================================================
  // 업로드 및 결과 처리
  // ======================================================
  uploadTaggedStory() {
    // 현재 기획상 진범은 주인공/??? 계정
    if (this.selectedTarget === "main") {
      this.resultType = "true";
    } else {
      this.resultType = "false";
    }

    let storyImg = this.createTaggedStoryImage();

    // 내 스토리에 추가
    this.instagramUI.addMyStory(storyImg);

    // 결과 저장
    if (typeof dateManager !== "undefined") {
      dateManager.uploadedToday = true;

      // 기존 accuse 변수도 호환용으로 같이 저장
      dateManager.accusedSuspect = this.selectedTarget;
      dateManager.accuseResult = this.resultType;

      // 태그 방식 전용 저장값
      dateManager.taggedTarget = this.selectedTarget;
      dateManager.taggedHandle = this.getTargetById(this.selectedTarget).handle;
      dateManager.storyUploadResult = this.resultType;

      if (!dateManager.uploadedStories) {
        dateManager.uploadedStories = {};
      }

      dateManager.uploadedStories[dateManager.currentDay] = storyImg;
    }

    this.mode = "result";
  }

  createTaggedStoryImage() {
    let w = this.instagramUI.w;
    let h = this.instagramUI.h;
    let g = createGraphics(w, h);

    let target = this.getTargetById(this.selectedTarget);

    g.background(10);

    // 약한 노이즈
    for (let i = 0; i < 120; i++) {
      g.noStroke();
      g.fill(255, random(5, 22));
      g.rect(random(w), random(h), random(1, 2), random(1, 2));
    }

    g.noStroke();
    g.fill(255);
    g.textAlign(CENTER, CENTER);

    g.textStyle(BOLD);
    g.textSize(32);
    g.text("네가 범인이야", w / 2, h / 2 - 45);

    g.textSize(26);
    g.fill(220, 40, 60);
    g.text(target.handle, w / 2, h / 2 + 10);

    g.textStyle(NORMAL);
    g.textSize(14);
    g.fill(255, 150);
    g.text(target.name + " 태그됨", w / 2, h / 2 + 52);

    return g;
  }

  continueAfterResult() {
    // 지금은 이후 전개로 이어질 수 있는 최소 상태만 저장
    if (typeof dateManager !== "undefined") {
      dateManager.storyUploadResolved = true;
    }

    this.close();
  }

  close() {
    this.mode = "camera";
    this.ghostEffectDone = false;
    this.instagramUI.currentScreen = "feed";
  }

  getTargetById(id) {
    for (let i = 0; i < this.tagTargets.length; i++) {
      if (this.tagTargets[i].id === id) {
        return this.tagTargets[i];
      }
    }

    return {
      id: "unknown",
      name: "???",
      handle: "@unknown"
    };
  }
}

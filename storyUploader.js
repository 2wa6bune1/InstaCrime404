// ======================================================
// storyUploader.js
// ======================================================
class StoryUploader {
  constructor(instagramUI) {
    this.instagramUI = instagramUI;

    // 화면 단계: camera -> tag -> result
    this.mode = "camera";

    // 카메라/귀신 연출 상태
    this.cameraStartFrame = 0;
    this.ghostEffectDone = false;

    // 4일차 연출
    this.mainCameraActive = false;
    this.mainCameraStartFrame = 0;
    this.mainHandBurstStarted = false;
    this.mainHandBurstStartFrame = 0;

    // 4일차 ; 2초 뒤 손자국 시작, 시작 후 6초 뒤 종료 (느리게)
    this.mainCameraVisibleFrames = 120; // 2초
    this.mainHandBurstFrames = 360;     // 6초 (이전 3초 → 6초)

    // 귀신 연출 길이
    this.ghostEffectDuration = 240;

    // 태그 선택 상태
    this.selectedTarget = null;
    this.resultType = null;

    // 독백 상태
    this.tagIntroMonoPlayed = false;
    this.tagIntroMonoText = "이제 범인을 태그해서 스토리에 올려야 한다. 누구를 태그해야 하지?";
    this.wrongTargetMonoText = "아니야... 이 사람은 아닌 것 같다.";

    // 태그 후보
    // main은 정답 후보지만, 화면에는 "나"가 아니라 ??? 계정처럼 보이게 처리
    this.tagTargets = [
      {
        id: "jian",
        name: "최지안",
        handle: "@its_ji.anni",
        monoText: "지안이는 아닌 것 같다. 뭔가 맞지 않아."
      },
      {
        id: "sua",
        name: "정수아",
        handle: "@sua.archive",
        monoText: "수아를 의심했지만... 이건 아닌 것 같다."
      },
      {
        id: "seojun",
        name: "이서준",
        handle: "@seo_jun.lee",
        monoText: "서준이는 아닌 것 같다. 내가 놓친 게 있다."
      },
      {
        id: "haeun",
        name: "강하은",
        handle: "@grace_haeun",
        monoText: "하은이를 태그하면 안 될 것 같다."
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

    this.tagIntroMonoPlayed = false;
  }

  // InstagramUI에서 호출하는 메인 display 함수
  display(appMouse = { x: -999, y: -999 }) {
  if (this.mode === "camera") {
    this.displayCameraScreen(appMouse);
  } else if (this.mode === "tag") {
    this.displayTagScreen(appMouse);
  } else if (this.mode === "result") {
    this.displayResultScreen(appMouse);
  } else if (this.mode === "mainCamera") {
    this.displayMainCameraScreen(appMouse);
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

    // 중앙 카메라 버튼 클릭 시 스토리 작성 화면으로 이동
    this.displayCameraBottomUI(w, h, appMouse);

    // 자동 전환 제거
    // 이제 귀신 연출이 끝나도 자동으로 넘어가지 않고,
    // 중앙 카메라 버튼을 눌러야 tag 화면으로 넘어감.
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
  // 귀신 연출
  // ======================================================
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
    fill(isShotHover ? 255 : 255, isShotHover ? 130 : 90);
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

  // 이전 버전 호환용 함수
  // 현재는 displayCameraScreen에서 자동 호출하지 않음
  updateGhostSequence() {
    let t = frameCount - this.cameraStartFrame;

    if (t >= this.ghostEffectDuration && !this.ghostEffectDone) {
      this.goToTagScreen();
    }
  }

  goToTagScreen() {
    this.ghostEffectDone = true;
    this.mode = "tag";

    if (
      !this.tagIntroMonoPlayed &&
      typeof monologue !== "undefined" &&
      monologue
    ) {
      monologue.start(this.tagIntroMonoText);
      this.tagIntroMonoPlayed = true;
    }
  }

  playWrongTargetMonologue(target) {
    if (typeof monologue === "undefined" || !monologue) return;

    let text = target.monoText || this.wrongTargetMonoText;
    monologue.start(text);
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
    let cardH = 240;

    // 스토리 미리보기 카드
    noStroke();
    fill(25);
    rect(cardX, cardY, cardW, cardH, 22);

    // 어두운 오버레이
    fill(0, 90);
    rect(cardX, cardY, cardW, cardH, 22);

    // 약한 노이즈
    for (let i = 0; i < 80; i++) {
      fill(255, random(5, 18));
      rect(random(cardX, cardX + cardW), random(cardY, cardY + cardH), random(1, 2), random(1, 2));
    }

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
    text("네가 범인이야", w / 2, cardY + 105);

    // 선택된 태그
    if (this.selectedTarget) {
      let target = this.getTargetById(this.selectedTarget);

      fill(220, 40, 60);
      textSize(24);
      textStyle(BOLD);
      text(target.handle, w / 2, cardY + 153);

      fill(255, 130);
      textSize(13);
      textStyle(NORMAL);
      text(target.name + " 태그됨", w / 2, cardY + 190);
    } else {
      fill(255, 130);
      textSize(22);
      textStyle(BOLD);
      text("@_____", w / 2, cardY + 153);

      fill(255, 100);
      textSize(13);
      textStyle(NORMAL);
      text("태그할 계정을 선택하세요", w / 2, cardY + 190);
    }
  }

  getTagListLayout(w, h) {
    return {
      titleX: 45,
      titleY: 356,
      startY: 382,
      itemX: 35,
      itemW: w - 70,
      itemH: 42,
      gap: 6
    };
  }

  getShareButtonLayout(w, h) {
    return {
      buttonX: 45,
      buttonY: h - 58,
      buttonW: w - 90,
      buttonH: 42
    };
  }

  displayTagTargetList(w, h, appMouse) {
    let layout = this.getTagListLayout(w, h);

    fill(255);
    textAlign(LEFT, CENTER);
    textSize(15);
    textStyle(BOLD);
    text("태그할 계정", layout.titleX, layout.titleY);

    let itemX = layout.itemX;
    let itemW = layout.itemW;
    let itemH = layout.itemH;
    let gap = layout.gap;

    for (let i = 0; i < this.tagTargets.length; i++) {
      let target = this.tagTargets[i];
      let y = layout.startY + i * (itemH + gap);

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
      rect(itemX, y, itemW, itemH, 12);

      // 프로필 더미 원
      fill(isSelected ? 255 : 70);
      circle(itemX + 25, y + itemH / 2, 26);

      fill(isSelected ? color(200, 40, 60) : color(180));
      textAlign(CENTER, CENTER);
      textSize(12);
      textStyle(BOLD);

      if (target.id === "main") {
        text("?", itemX + 25, y + itemH / 2);
      } else {
        text(target.name.charAt(0), itemX + 25, y + itemH / 2);
      }

      // 이름/핸들
      fill(255);
      textAlign(LEFT, CENTER);
      textSize(13);
      textStyle(BOLD);
      text(target.name, itemX + 50, y + 15);

      fill(255, 145);
      textSize(11);
      textStyle(NORMAL);
      text(target.handle, itemX + 50, y + 30);

      // 선택 체크
      if (isSelected) {
        fill(255);
        textAlign(RIGHT, CENTER);
        textSize(17);
        textStyle(BOLD);
        text("✓", itemX + itemW - 20, y + itemH / 2);
      }
    }
  }

  displayShareButton(w, h, appMouse) {
    let layout = this.getShareButtonLayout(w, h);

    let buttonX = layout.buttonX;
    let buttonY = layout.buttonY;
    let buttonW = layout.buttonW;
    let buttonH = layout.buttonH;

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
  // 3. 결과 화면
  // ======================================================
  displayResultScreen(appMouse) {
    let w = this.instagramUI.w;
    let h = this.instagramUI.h;

    background(12);

    noStroke();
    fill(18);
    rect(0, 0, w, h);

    let target = this.getTargetById(this.selectedTarget);

    // 상단
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(16);
    textStyle(BOLD);
    text("스토리 업로드 완료", w / 2, 38);

    // 결과 카드
    let cardX = 35;
    let cardY = 115;
    let cardW = w - 70;
    let cardH = 360;

    noStroke();

    if (this.resultType === "true") {
      fill(35, 18, 22);
    } else {
      fill(24);
    }

    rect(cardX, cardY, cardW, cardH, 24);

    // 노이즈
    for (let i = 0; i < 90; i++) {
      fill(255, random(5, 20));
      rect(random(cardX, cardX + cardW), random(cardY, cardY + cardH), random(1, 2), random(1, 2));
    }

    fill(255);
    textAlign(CENTER, CENTER);

    textSize(28);
    textStyle(BOLD);

    if (this.resultType === "true") {
      text("스토리가 올라갔다", w / 2, cardY + 95);

      fill(220, 40, 60);
      textSize(24);
      text(target.handle, w / 2, cardY + 150);

      fill(255, 145);
      textSize(14);
      textStyle(NORMAL);
      text("이 계정이 정말 모든 사건의 중심에 있었다.", w / 2, cardY + 205);
      text("이제 끝을 확인할 시간이다.", w / 2, cardY + 230);
    } else {
      text("스토리가 올라갔다", w / 2, cardY + 95);

      fill(220, 40, 60);
      textSize(24);
      text(target.handle, w / 2, cardY + 150);

      fill(255, 145);
      textSize(14);
      textStyle(NORMAL);
      text("하지만 뭔가 잘못 짚은 것 같다.", w / 2, cardY + 205);
      text("다시 생각해봐야 한다.", w / 2, cardY + 230);
    }

    // 버튼
    let buttonX = 55;
    let buttonY = h - 120;
    let buttonW = w - 110;
    let buttonH = 48;

    let isHover =
      appMouse.x >= buttonX &&
      appMouse.x <= buttonX + buttonW &&
      appMouse.y >= buttonY &&
      appMouse.y <= buttonY + buttonH;

    if (isHover) {
      fill(230, 60, 80);
    } else {
      fill(200, 40, 60);
    }

    noStroke();
    rect(buttonX, buttonY, buttonW, buttonH, 14);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(15);
    textStyle(BOLD);
    text("계속하기", w / 2, buttonY + buttonH / 2);
  }

  // ======================================================
  // 클릭 처리
  // ======================================================
  handleClick(mx, my) {
  if (this.mode === "mainCamera") {
    return;
  }

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

    // 닫기 버튼
    if (mx < 60 && my < 75) {
      this.close();
      return;
    }

    // 중앙 카메라 버튼 클릭 시 스토리 작성 화면으로 이동
    if (dist(mx, my, w / 2, h - 72) < 48) {
      this.goToTagScreen();
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

    // 스토리에 올리기 버튼
    let shareLayout = this.getShareButtonLayout(w, h);

    if (
      mx >= shareLayout.buttonX &&
      mx <= shareLayout.buttonX + shareLayout.buttonW &&
      my >= shareLayout.buttonY &&
      my <= shareLayout.buttonY + shareLayout.buttonH
    ) {
      if (this.selectedTarget) {
        this.uploadTaggedStory();
      }
      return;
    }

    // 태그 대상 클릭
    let listLayout = this.getTagListLayout(w, h);

    let itemX = listLayout.itemX;
    let itemW = listLayout.itemW;
    let itemH = listLayout.itemH;
    let gap = listLayout.gap;

    for (let i = 0; i < this.tagTargets.length; i++) {
      let target = this.tagTargets[i];
      let y = listLayout.startY + i * (itemH + gap);

      if (
        mx >= itemX &&
        mx <= itemX + itemW &&
        my >= y &&
        my <= y + itemH
      ) {
        this.selectedTarget = target.id;

        // unknown 계정이 아닌 다른 계정을 누르면 독백 재생
        if (target.id !== "main") {
          this.playWrongTargetMonologue(target);
        }

        return;
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
  if (this.selectedTarget === "main") {
    this.resultType = "true";
  } else {
    this.resultType = "false";
  }

  // 💡 정답("main")을 맞췄을 때만 저격 스토리를 만들고 피드에 추가.
  //    오답이면 피드에 아예 올라가지 않음.
  let storyImg = null;
  if (this.resultType === "true") {
    storyImg = this.createTaggedStoryImage();
    this.instagramUI.addMyStory(storyImg);
  }

  if (typeof dateManager !== "undefined") {
    // uploadedToday 는 "실제로 저격 스토리가 피드에 올라간 날"만 true
    dateManager.uploadedToday = (this.resultType === "true");
    dateManager.accusedSuspect = this.selectedTarget;
    dateManager.accuseResult = this.resultType;
    dateManager.taggedTarget = this.selectedTarget;
    dateManager.taggedHandle = this.getTargetById(this.selectedTarget).handle;
    dateManager.storyUploadResult = this.resultType;

    // uploadedStories 도 정답으로 실제 스토리가 올라간 경우에만 기록
    if (storyImg) {
      if (!dateManager.uploadedStories) {
        dateManager.uploadedStories = {};
      }
      dateManager.uploadedStories[dateManager.currentDay] = storyImg;
    }
  }

  // main을 골랐을 때만 카메라 연출로 전환
  if (this.selectedTarget === "main") {
    this.startMainCameraSequence();
    return;
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

    // 어두운 비네팅 느낌
    g.noStroke();
    g.fill(0, 80);
    g.rect(0, 0, w, h);

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
    this.selectedTarget = null;
    this.resultType = null;
    this.tagIntroMonoPlayed = false;

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

  startMainCameraSequence() {
  this.mode = "mainCamera";
  this.mainCameraStartFrame = frameCount;
  this.mainHandBurstStarted = false;
  this.mainHandBurstStartFrame = 0;
}

displayMainCameraScreen(appMouse) {
  let w = this.instagramUI.w; // 390
  let h = this.instagramUI.h; // 700

  background(0);

  // 카메라 화면 (webcam 본래 비율 유지하면서 화면 가득 = cover behavior)
  // 이전엔 image(webcam, 0, 0, w, h) 라서 세로로 늘어났음. 이제 비율 유지.
  if (typeof webcam !== "undefined" && webcam) {
    let camW = w;
    let camH = h;
    let camX = 0;
    let camY = 0;

    if (webcam.width && webcam.height) {
      let camAspect = webcam.width / webcam.height;
      let screenAspect = w / h;
      if (camAspect > screenAspect) {
        // 카메라가 더 가로로 김 → 높이 맞추고 좌우 잘림
        camH = h;
        camW = h * camAspect;
        camX = (w - camW) / 2;
        camY = 0;
      } else {
        // 카메라가 더 세로로 김 → 너비 맞추고 상하 잘림
        camW = w;
        camH = w / camAspect;
        camX = 0;
        camY = (h - camH) / 2;
      }
    }

    push();
    // 좌우 거울 반전 + 위치 보정
    translate(w - camX, camY);
    scale(-1, 1);
    image(webcam, 0, 0, camW, camH);
    pop();
  }

  let elapsed = frameCount - this.mainCameraStartFrame;

  // 2초 뒤 손자국 시작
  if (!this.mainHandBurstStarted && elapsed >= 120) {
    this.mainHandBurstStarted = true;
    this.mainHandBurstStartFrame = frameCount;
  }

  // 손자국 연출
  if (this.mainHandBurstStarted) {
    this.displayBloodHandBurst(w, h);

    // 손자국 시작 후 6초(360프레임) 지나면 자동 종료
    if (frameCount - this.mainHandBurstStartFrame >= this.mainHandBurstFrames) {
      this.closeMainCamera();
    }
  }
}

displayBloodHandBurst(w, h) {
  if (typeof day5HandImg === "undefined" || !day5HandImg) return;

  let elapsed = frameCount - this.mainHandBurstStartFrame;
  // 6초에 걸쳐 점진적 증가
  let progress = constrain(elapsed / this.mainHandBurstFrames, 0, 1);
  // 큰 손자국이라 너무 빽빽하면 답답해서 개수는 8 → 24 정도로
  let count = floor(lerp(8, 24, progress));

  push();
  imageMode(CENTER);

  for (let i = 0; i < count; i++) {
    let x = random(-30, w + 30);
    let y = random(-30, h + 30);
    // 💡 더 크게: 이전 0.18~0.45 → 0.4~0.8 (약 2배)
    let s = random(w * 0.4, w * 0.8);
    let a = random(140, 255);

    push();
    translate(x, y);
    rotate(random(-0.8, 0.8));
    tint(255, a);
    image(day5HandImg, 0, 0, s, s);
    noTint();
    pop();
  }

  imageMode(CORNER);
  pop();
}

closeMainCamera() {
  this.mode = "camera";
  this.mainHandBurstStarted = false;
  this.mainHandBurstStartFrame = 0;
  this.mainCameraStartFrame = 0;
  this.instagramUI.currentScreen = "feed";
}




}

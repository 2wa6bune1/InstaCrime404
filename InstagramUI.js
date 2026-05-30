// ======================================================
// InstagramUI 클래스
// 
// 역할:
// 1. 인스타그램풍 피드 화면 출력
// 2. 게시물 피드 스크롤
// 3. 스토리 화면 출력
// 4. 피드/스토리 화면 전환
// 5. 좋아요 클릭 처리
// ======================================================

class InstagramUI {
  constructor(w, h) {
    this.w = w;
    this.h = h;

    this.currentScreen = "feed";
    this.currentStory = 0;

    // 피드 스크롤 관련 변수
    this.scrollY = 0;
    this.targetScrollY = 0;

    // 화면 고정 영역
    this.headerH = 65;
    this.storiesH = 105;
    this.bottomNavH = 58;

    // 게시물 시작 위치
    this.postStartY = 185;

    // 게시물 하나의 높이
    this.postGap = 420;

    this.stories = [
      new Story(
        "me",
        color(255, 120, 80),
        color(255, 210, 90),
        color(255, 150, 120),
        "오늘의 미션"
      ),
      new Story(
        "npc_01",
        color(180, 80, 255),
        color(255, 80, 150),
        color(120, 90, 220),
        "새로운 단서 발견"
      ),
      new Story(
        "shop",
        color(255, 220, 80),
        color(255, 80, 180),
        color(255, 190, 80),
        "아이템 세일 중"
      ),
      new Story(
        "rival",
        color(80, 200, 255),
        color(180, 80, 255),
        color(80, 160, 220),
        "라이벌의 게시물"
      )
    ];

    this.posts = [
      new Post(
        "npc_01",
        "Seongsu Quest Zone",
        "오늘도 플레이어를 기다리는 중...",
        128,
        color(240, 180, 130)
      ),
      new Post(
        "shop_master",
        "Item Store",
        "새로운 장비가 입고되었습니다.",
        342,
        color(140, 190, 230)
      ),
      new Post(
        "rival",
        "Back Alley",
        "플레이어보다 먼저 단서를 찾았다.",
        221,
        color(170, 130, 220)
      ),
      new Post(
        "quest_bot",
        "Main Quest",
        "오늘의 미션이 업데이트되었습니다.",
        76,
        color(130, 210, 170)
      )
    ];
  }

  update() {
    // 스크롤도 부드럽게 움직이게 함
    this.scrollY = lerp(this.scrollY, this.targetScrollY, 0.25);
  }

  display() {
    fill(245);
    noStroke();
    rect(0, 0, this.w, this.h, 25);

    if (this.currentScreen === "feed") {
      this.displayFeed();
    } else if (this.currentScreen === "story") {
      this.displayStoryViewer();
    }
  }

  displayFeed() {
    // 피드의 스크롤되는 부분
    this.displayScrollableFeed();

    // 헤더와 하단바는 스크롤되지 않게 마지막에 그림
    this.displayHeader();
    this.displayBottomNav();

    // 스크롤바 표시
    this.displayScrollBar();
  }

  displayScrollableFeed() {
    push();

    // 헤더 아래, 하단바 위 영역만 피드가 보이게 클리핑
    drawingContext.save();
    this.createRectClip(0, this.headerH, this.w, this.h - this.headerH - this.bottomNavH);

    // 스크롤 적용
    translate(0, -this.scrollY);

    // 스토리 영역과 게시물들이 같이 스크롤됨
    this.displayStories();

    this.displayPosts();

    drawingContext.restore();

    pop();
  }

  displayHeader() {
    fill(255);
    noStroke();
    rect(0, 0, this.w, 65, 25, 25, 0, 0);

    fill(0);
    textSize(25);
    textStyle(BOLD);
    textAlign(LEFT);
    text("Instagram", 18, 42);

    textSize(24);
    textStyle(NORMAL);
    text("♡", 312, 40);
    text("✈", 350, 40);

    stroke(220);
    line(0, 64, this.w, 64);
  }

  displayStories() {
    fill(255);
    noStroke();
    rect(0, 65, this.w, 105);

    for (let i = 0; i < this.stories.length; i++) {
      let x = 45 + i * 85;
      let y = 105;

      this.stories[i].displayIcon(x, y);

      fill(30);
      noStroke();
      textAlign(CENTER);
      textSize(11);
      textStyle(NORMAL);
      text(this.stories[i].name, x, y + 48);
    }

    stroke(220);
    line(0, 170, this.w, 170);
  }

  displayPosts() {
    for (let i = 0; i < this.posts.length; i++) {
      let postY = this.postStartY + i * this.postGap;
      this.posts[i].display(postY, this.w);
    }
  }

  displayBottomNav() {
    fill(255);
    noStroke();
    rect(0, this.h - this.bottomNavH, this.w, this.bottomNavH);

    stroke(220);
    line(0, this.h - this.bottomNavH, this.w, this.h - this.bottomNavH);

    fill(0);
    noStroke();
    textAlign(CENTER);
    textSize(24);

    text("⌂", 40, this.h - 22);
    text("⌕", 115, this.h - 22);
    text("＋", 195, this.h - 22);
    text("♡", 275, this.h - 22);
    text("◉", 350, this.h - 22);
  }

  displayScrollBar() {
    let maxScroll = this.getMaxScroll();

    if (maxScroll <= 0) {
      return;
    }

    let trackTop = this.headerH + 8;
    let trackBottom = this.h - this.bottomNavH - 8;
    let trackH = trackBottom - trackTop;

    let barH = max(40, trackH * 0.35);
    let barY = map(this.scrollY, 0, maxScroll, trackTop, trackBottom - barH);

    noStroke();
    fill(0, 70);
    rect(this.w - 8, barY, 4, barH, 10);
  }

  displayStoryViewer() {
    let s = this.stories[this.currentStory];

    fill(s.bg);
    noStroke();
    rect(0, 0, this.w, this.h, 25);

    for (let i = 0; i < this.stories.length; i++) {
      if (i <= this.currentStory) {
        fill(255);
      } else {
        fill(255, 100);
      }

      noStroke();
      rect(15 + i * 90, 18, 78, 4, 10);
    }

    fill(255);
    circle(32, 48, 32);

    fill(255);
    textAlign(LEFT);
    textStyle(BOLD);
    textSize(14);
    text(s.name, 55, 53);

    textStyle(NORMAL);
    textSize(13);
    text("2h", 110, 53);

    textAlign(RIGHT);
    textSize(24);
    text("×", this.w - 22, 55);

    fill(255, 80);
    noStroke();
    rect(45, 145, 300, 380, 24);

    fill(255);
    textAlign(CENTER);
    textStyle(BOLD);
    textSize(30);
    text(s.text, this.w / 2, 310);

    textSize(15);
    textStyle(NORMAL);
    text("게임 속 인스타 스토리 화면", this.w / 2, 345);

    noFill();
    stroke(255);
    strokeWeight(1.5);
    rect(20, this.h - 65, 270, 40, 20);

    noStroke();
    fill(255);
    textAlign(LEFT);
    textSize(14);
    text("메시지 보내기", 38, this.h - 40);

    textAlign(CENTER);
    textSize(24);
    text("♡", 320, this.h - 38);
    text("✈", 355, this.h - 38);

    strokeWeight(1);
  }

  handleClick(mx, my) {
    if (this.currentScreen === "feed") {
      // 스크롤된 상태이므로 클릭 y좌표를 실제 피드 내부 좌표로 보정
      let contentY = my + this.scrollY;

      this.checkStoryClick(mx, contentY);
      this.checkLikeClick(mx, contentY);
    } else if (this.currentScreen === "story") {
      this.checkStoryViewerClick(mx, my);
    }
  }

  handleWheel(delta) {
    // 스토리 화면에서는 피드 스크롤하지 않음
    if (this.currentScreen !== "feed") {
      return;
    }

    // delta가 양수면 아래로 스크롤
    this.targetScrollY += delta * 0.7;

    this.constrainScroll();
  }

  constrainScroll() {
    let maxScroll = this.getMaxScroll();

    this.targetScrollY = constrain(this.targetScrollY, 0, maxScroll);
  }

  getMaxScroll() {
    let contentBottom = this.postStartY + this.posts.length * this.postGap;
    let visibleBottom = this.h - this.bottomNavH;

    return max(0, contentBottom - visibleBottom);
  }

  checkStoryClick(mx, my) {
    for (let i = 0; i < this.stories.length; i++) {
      let x = 45 + i * 85;
      let y = 105;

      let d = dist(mx, my, x, y);

      if (d < 35) {
        this.currentStory = i;
        this.currentScreen = "story";
      }
    }
  }

  checkLikeClick(mx, my) {
    for (let i = 0; i < this.posts.length; i++) {
      let postY = this.postStartY + i * this.postGap;

      if (
        mx > 10 &&
        mx < 45 &&
        my > postY + 305 &&
        my < postY + 345
      ) {
        this.posts[i].toggleLike();
      }
    }
  }

  checkStoryViewerClick(mx, my) {
    if (mx > this.w - 50 && my < 80) {
      this.currentScreen = "feed";
      return;
    }

    if (mx < this.w / 2) {
      this.currentStory--;

      if (this.currentStory < 0) {
        this.currentScreen = "feed";
        this.currentStory = 0;
      }
    } else {
      this.currentStory++;

      if (this.currentStory >= this.stories.length) {
        this.currentScreen = "feed";
        this.currentStory = 0;
      }
    }
  }

  createRectClip(x, y, w, h) {
    drawingContext.beginPath();
    drawingContext.rect(x, y, w, h);
    drawingContext.closePath();
    drawingContext.clip();
  }
}

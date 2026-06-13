/// ======================================================
// sketch.js
// ======================================================
let phone;
let dateManager;
let room;
let storyUploader;
let clueHighlight;
let monologue; // 독백 시스템 변수 추가
let bgmManager; // bgm관리자

let webcam; // StoryUploader의 mainCamera 연출에서 사용
let day5HandImg;

let endingVideo;
let endingVideoPlaying = false;

let gameState = "START";
let roomBgImg;
let instagramStarted = false;

let imgProfileMain, imgProfileFriend, imgProfileNpc, imgProfileRival, imgProfileNews;
let imgProfileAlba, imgProfileCop, imgProfileX, imgProfileShop, imgProfileSystem;
let haeun1, haeun2, haeun3, haeun4, haeun5;
let jian1_1, jian1_2, jian1_3, jian1_4, jian2_1, jian2_2, jian2_3, jian2_4;
let jian3_1, jian3_2, jian3_3, jian4_1, jian4_2, jian4_3, jian4_4;
let news1, news2, news3, news4, news5, news6, news7, news8, news9, seojun1, seojun2_1, seojun2_2, seojun3, seojun4_1, seojun4_2;
let sooah1, sooah3, sooah4, accountX0, accountX1, accountX2, accountX3, accountX4, accountX5;

function preload() {
  bgmManager = new BgmManager();
  bgmManager.preload();

  roomBgImg = loadImage("assets/roomBg.png");

  imgProfileNews = loadImage("assets/NewsProfile.png");
  imgProfileX = loadImage("assets/imgProfileX.png");
  imgProfileRival = loadImage("assets/sooahProfile.png");
  imgProfileNpc = loadImage("assets/jianProfile.png");
  imgProfileAlba = loadImage("assets/seojunProfile.png");
  imgProfileCop = loadImage("assets/haeunProfile.png");

  day5HandImg = loadImage("assets/bloodHand.png");

  haeun1 = loadImage("assets/haeun1.png");
  haeun2 = loadImage("assets/haeun2.png");
  haeun3 = loadImage("assets/haeun3.png");
  haeun4 = loadImage("assets/haeun4.png");
  haeun5 = loadImage("assets/haeun5.png");

  jian1_1 = loadImage("assets/jian1-1.png");
  jian1_2 = loadImage("assets/jian1-2.png");
  jian1_3 = loadImage("assets/jian1-3.png");
  jian1_4 = loadImage("assets/jian1-4.png");
  jian2_1 = loadImage("assets/jian2-1.png");
  jian2_2 = loadImage("assets/jian2-2.png");
  jian2_3 = loadImage("assets/jian2-3.png");
  jian2_4 = loadImage("assets/jian2-4.png");
  jian3_1 = loadImage("assets/jian3-1.png");
  jian3_2 = loadImage("assets/jian3-2.png");
  jian3_3 = loadImage("assets/jian3-3.png");
  jian4_1 = loadImage("assets/jian4-1.png");
  jian4_2 = loadImage("assets/jian4-2.png");
  jian4_3 = loadImage("assets/jian4-3.png");
  jian4_4 = loadImage("assets/jian4-4.JPG");

  news1 = loadImage("assets/news1.png");
  news2 = loadImage("assets/news2.png");
  news3 = loadImage("assets/news3.png");
  news4 = loadImage("assets/news4.png");
  news5 = loadImage("assets/news5.png");
  news6 = loadImage("assets/news6.png");
  news7 = loadImage("assets/news7.png");
  news8 = loadImage("assets/news8.png");
  news9 = loadImage("assets/news9.png");

  seojun1 = loadImage("assets/seojun1.png");
  seojun2_1 = loadImage("assets/seojun2-1.png");
  seojun2_2 = loadImage("assets/seojun2-2.png");
  seojun3 = loadImage("assets/seojun3.png");
  seojun4_1 = loadImage("assets/seojun4-1.png");
  seojun4_2 = loadImage("assets/seojun4-2.png");

  sooah1 = loadImage("assets/sooah1.JPG");
  sooah3 = loadImage("assets/sooah3.JPG");
  sooah4 = loadImage("assets/sooah4.JPG");

  accountX0 = loadImage("assets/X0.JPG");
  accountX1 = loadImage("assets/X1.JPG");
  accountX2 = loadImage("assets/X2.png");
  accountX3 = loadImage("assets/X3.png");
  accountX4 = loadImage("assets/X4.JPG");
  accountX5 = loadImage("assets/X5.JPG");
}

function setup() {
  createCanvas(900, 800);
  textFont("Arial");

  room = new Room(roomBgImg);
  dateManager = new DateManager();
  phone = new PhoneUI();
  monologue = new MonologueSystem();

  dateManager.loadDailyData();

  // StoryUploader의 mainCamera 연출에서 사용
  webcam = createCapture(VIDEO);
  webcam.size(width, height);
  webcam.hide();
  webcam.elt.setAttribute("playsinline", "");
  webcam.elt.muted = true;
  webcam.elt.autoplay = true;
  webcam.elt.play();

  endingVideo = createVideo("assets/endingVideoTest.mp4");
  endingVideo.hide();

  clueHighlight = new Highlight("결정적 증거", 200, 150);

  let dummyUser = dateManager.users["단짝_친구"];
  if (dummyUser) {
    clueHighlight.addHightlight(new Story(dummyUser, color(0), color(0), color(0), "하이라이트 테스트"));
  }

  storyUploader = new StoryUploader(phone.instagram);
}

function areAllCluesChecked() {
  let currentStories = phone && phone.instagram
    ? phone.instagram.stories
    : [];

  let currentChats = phone && phone.instagram && phone.instagram.dm
    ? phone.instagram.dm.chatRooms
    : [];

  let allStoriesRead =
    currentStories.length === 0 ||
    currentStories.every(s => s.isRead);

  let allChatsRead =
    currentChats.length === 0 ||
    currentChats.every(c => !c.unread);

  return allStoriesRead && allChatsRead;
}

function mouseWheel(event) {
  if (gameState === "PLAY") {
    phone.handleMouseWheel(event);
  }
  return false;
}

function draw() {
  if (endingVideoPlaying) {
    image(endingVideo, 0, 0, width, height);

    if (endingVideo.elt.ended) {
      endingVideoPlaying = false;

      if (phone && phone.instagram) {
        phone.instagram.currentScreen = "feed";
      }

      if (dateManager) {
        dateManager.day5EndingReady = false;
        dateManager.day5SequenceFinished = true;
      }
    }
    return;
  }

  if (gameState === "START") {
    background(20);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(40);
    textStyle(BOLD);
    text("MYSTERY GAME", width / 2, height / 3 - 30);

    fill(200, 40, 60);
    noStroke();
    rect(width / 2 - 100, height / 2 - 20, 200, 60, 15);

    fill(255);
    textSize(24);
    textStyle(NORMAL);
    text("게임 시작하기", width / 2, height / 2 + 10);
  } else {
    // 1일차 시작 전만 방 배경 표시
    if (!instagramStarted && dateManager.currentDay === 1) {
      room.display();
    } else {
      // 핸드폰 클릭 후부터는 계속 검정 배경
      background(0);

      fill(255, 200);
      textAlign(LEFT, TOP);
      textSize(36);
      textStyle(BOLD);

      let dayText = dateManager.currentDay === 0 ? "Day 0" : `Day ${dateManager.currentDay}`;
      text(dayText, 30, 30);
    }

    phone.update();

    if (phone.instagram.currentScreen === "profile") {
      clueHighlight.displayIcon(false);
    }

    if (phone.instagram.backupStories && phone.instagram.currentScreen !== "story") {
      phone.instagram.stories = phone.instagram.backupStories;
      phone.instagram.backupStories = null;
      phone.instagram.currentScreen = "feed";
    }

    phone.display();

    // 인스타그램 시작 후부터 오른쪽 하단 버튼 계속 표시
    if (instagramStarted) {
      if (
        dateManager &&
        dateManager.currentDay === 5 &&
        dateManager.day5EndingReady &&
        !endingVideoPlaying
      ) {
        room.displayEndingButton();
      } else {
        room.displayNextDayButton();
      }
    }

    monologue.update();
    monologue.display();
  }
}

if (gameState === "START") {
  background(20);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  textStyle(BOLD);
  text("MYSTERY GAME", width / 2, height / 3 - 30);

  fill(200, 40, 60);
  noStroke();
  rect(width / 2 - 100, height / 2 - 20, 200, 60, 15);

  fill(255);
  textSize(24);
  textStyle(NORMAL);
  text("게임 시작하기", width / 2, height / 2 + 10);
} else {
  let currentStories = (phone && phone.instagram) ? phone.instagram.stories : [];
  let currentChats = (phone && phone.instagram && phone.instagram.dm) ? phone.instagram.dm.chatRooms : [];

  let allStoriesRead = currentStories.length === 0 || currentStories.every(s => s.isRead);
  let allChatsRead = currentChats.length === 0 || currentChats.every(c => !c.unread);

  if (allStoriesRead && allChatsRead) {
    if (!dateManager.endMonologuePlayed[dateManager.currentDay] && phone.instagram.currentScreen === "feed") {
      let endText = dateManager.getEndMonologue(dateManager.currentDay);

      if (endText) {
        monologue.start(endText);
      }

      dateManager.endMonologuePlayed[dateManager.currentDay] = true;
    } else if (dateManager.endMonologuePlayed[dateManager.currentDay] && !monologue.active) {
      room.goNextDay = true;
    } else {
      room.goNextDay = false;
    }
  } else {
    room.goNextDay = false;
  }

  room.display();
  phone.update();

  if (phone.instagram.currentScreen === "profile") {
    clueHighlight.displayIcon(false);
  }

  if (phone.instagram.backupStories && phone.instagram.currentScreen !== "story") {
    phone.instagram.stories = phone.instagram.backupStories;
    phone.instagram.backupStories = null;
    phone.instagram.currentScreen = "feed";
  }

  phone.display();

  if (!phone.expanded) {
    if (
      dateManager &&
      dateManager.currentDay === 5 &&
      dateManager.day5EndingReady &&
      !endingVideoPlaying
    ) {
      room.displayEndingButton();
    } else if (!(dateManager && dateManager.currentDay === 5)) {
      room.displayNextDayButton();
    }
  }

  monologue.update();
  monologue.display();
}

function mousePressed() {
  if (gameState === "START") {
    if (
      mouseX > width / 2 - 100 &&
      mouseX < width / 2 + 100 &&
      mouseY > height / 2 - 20 &&
      mouseY < height / 2 + 40
    ) {
      userStartAudio();
      gameState = "PLAY";

      if (bgmManager) {
        bgmManager.playForDay(dateManager.currentDay);
      }
    }
    return;
  }

  if (monologue.active) {
    monologue.checkClick();
    return;
  }

  // 다음날 버튼 / 엔딩 버튼을 핸드폰보다 먼저 처리
  if (typeof room.checkClick === "function") {
    let roomClicked = room.checkClick(mouseX, mouseY);
    if (roomClicked) return;
  }

  phone.handleMousePressed();
}
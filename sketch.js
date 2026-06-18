/// ======================================================
// sketch.js
// ======================================================
let phone;
let dateManager;
let room;
let storyUploader;
let clueHighlight;
let monologue;
let bgmManager;

let introVideo;
let introVideoPlaying = false;
let introVideoWatched = false;

let webcam;
let day5HandImg;

let endingVideo;
let endingVideoPlaying = false;

let gameState = "START";
let roomBgImg;
let instagramStarted = false;
let showResetConfirm = false;

let playerInstagramId = "";
let idInputText = "";
let idInputFocused = true;
let idInputError = "";
const INSTAGRAM_ID_MAX_LENGTH = 10;

// 날짜 전환 영상은 아래 객체에 실제 파일 경로가 정의된 날짜에만 재생됩니다.
// 기본값은 비어 있으므로, 정의된 영상이 없으면 DAY 전환 화면이 나오지 않습니다.
// 예시:
// const DAY_TRANSITION_VIDEO_PATHS = {
//   1: "assets/day1.mp4",
//   2: "assets/day2.mp4",
//   3: "assets/day3.mp4",
//   4: "assets/day4.mp4",
//   5: "assets/day5.mp4",
//   0: "assets/day0.mp4"
// };
const DAY_TRANSITION_VIDEO_PATHS = {};

let dayTransitionVideos = {};
let dayTransitionVideoLoadFailed = {};
let dayTransitionActive = false;
let currentDayTransitionVideo = null;

let imgProfileMain, imgProfileFriend, imgProfileNpc, imgProfileRival, imgProfileNews;
let imgProfileAlba, imgProfileCop, imgProfileX, imgProfileShop, imgProfileSystem;
let haeun1, haeun2, haeun3, haeun4, haeun5;
let jian1_1, jian1_2, jian1_3, jian1_4, jian2_1, jian2_2, jian2_3, jian2_4;
let jian3_1, jian3_2, jian3_3, jian4_1, jian4_2, jian4_3, jian4_4;
let news1, news2, news3, news4, news5, news6, news7, news8, news9, seojun1, seojun2_1, seojun2_2, seojun3_v2, seojun4_1, seojun4_2;
let sooah1, sooah3, sooah4, accountX0, accountX1, accountX2, accountX3, accountX4, accountX5;

function preload() {
  bgmManager = new BgmManager();
  bgmManager.preload();

  introVideo = createVideo("assets/intro.mp4");
  introVideo.hide();

  preloadDayTransitionVideos();

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
  seojun3_v2 = loadImage("assets/seojun3_v2.png");
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

function preloadDayTransitionVideos() {
  dayTransitionVideos = {};
  dayTransitionVideoLoadFailed = {};

  for (let dayKey in DAY_TRANSITION_VIDEO_PATHS) {
    let videoPath = DAY_TRANSITION_VIDEO_PATHS[dayKey];

    if (!videoPath || String(videoPath).trim() === "") {
      continue;
    }

    let video = createVideo(videoPath);
    video.hide();

    video.elt.onerror = function () {
      dayTransitionVideoLoadFailed[dayKey] = true;
      delete dayTransitionVideos[dayKey];

      if (currentDayTransitionVideo === video) {
        dayTransitionActive = false;
        currentDayTransitionVideo = null;
      }
    };

    dayTransitionVideos[dayKey] = video;
  }
}

function getDayTransitionVideo(day) {
  let dayKey = String(day);

  if (dayTransitionVideoLoadFailed[dayKey]) {
    return null;
  }

  return dayTransitionVideos[dayKey] || null;
}

function setup() {
  createCanvas(900, 800);
  textFont("Arial");

  initializeGameObjects();

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
}

function initializeGameObjects() {
  room = new Room(roomBgImg);
  dateManager = new DateManager();
  phone = new PhoneUI();
  monologue = new MonologueSystem();

  applyPlayerInstagramId();
  dateManager.loadDailyData();

  clueHighlight = new Highlight("결정적 증거", 200, 150);
  let dummyUser = dateManager.users["단짝_친구"];
  if (dummyUser) {
    clueHighlight.addHightlight(new Story(dummyUser, color(0), color(0), color(0), "하이라이트 테스트"));
  }

  storyUploader = new StoryUploader(phone.instagram);
}

function sanitizeInstagramId(value) {
  return String(value || "")
    .replace(/[^A-Za-z0-9_.]/g, "")
    .slice(0, INSTAGRAM_ID_MAX_LENGTH);
}

function isValidInstagramId(value) {
  return /^[A-Za-z0-9_.]{1,10}$/.test(String(value || ""));
}

function getPlayerInstagramId() {
  return playerInstagramId || "주인공";
}

function applyPlayerInstagramId() {
  let cleanId = sanitizeInstagramId(playerInstagramId);
  if (!cleanId) cleanId = "주인공";

  if (dateManager && typeof dateManager.setPlayerInstagramId === "function") {
    dateManager.setPlayerInstagramId(cleanId);
  } else if (dateManager && dateManager.users && dateManager.users["주인공"]) {
    dateManager.users["주인공"].name = cleanId;
  }
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
  if (gameState === "PLAY" && !dayTransitionActive) {
    phone.handleMouseWheel(event);
  }
  return false;
}

function draw() {
  if (introVideoPlaying) {
    drawFullScreenVideo(introVideo);

    if (introVideo.elt.ended) {
      introVideoPlaying = false;
      introVideoWatched = true;

      introVideo.stop();
      introVideo.time(0);

      gameState = "START";
      idInputFocused = true;
    }

    return;
  }

  if (endingVideoPlaying) {
    drawFullScreenVideo(endingVideo);

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

  if (dayTransitionActive) {
    drawDayTransitionVideo();
    return;
  }

  if (gameState === "START") {
    drawStartScreen();
    return;
  }

  drawPlayScreen();
}

function drawFullScreenVideo(video) {
  background(0);
  if (video) {
    image(video, 0, 0, width, height);
  }
}

function drawStartScreen() {
  background(20);

  if (!introVideoWatched) {
    drawOpeningStartScreen();
  } else {
    drawInstagramIdInputScreen();
  }
}

function drawOpeningStartScreen() {
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
}

function drawInstagramIdInputScreen() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(34);
  textStyle(BOLD);
  text("인스타 아이디 입력", width / 2, height / 3 - 65);

  fill(170);
  textSize(15);
  textStyle(NORMAL);
  text("게임 안에서 플레이어 계정명으로 표시됩니다.", width / 2, height / 3 - 25);

  let inputX = width / 2 - 170;
  let inputY = height / 2 - 42;
  let inputW = 340;
  let inputH = 58;

  stroke(idInputFocused ? color(90, 150, 255) : color(95));
  strokeWeight(2);
  fill(30);
  rect(inputX, inputY, inputW, inputH, 14);

  noStroke();
  textAlign(LEFT, CENTER);
  textSize(22);
  textStyle(NORMAL);

  fill(130);
  text("@", inputX + 22, inputY + inputH / 2);

  let shown = idInputText;
  let cursor = idInputFocused && frameCount % 60 < 30 ? "|" : "";
  if (shown.length === 0) {
    fill(95);
    text("your_id", inputX + 52, inputY + inputH / 2);
  } else {
    fill(255);
    text(shown + cursor, inputX + 52, inputY + inputH / 2);
  }

  fill(150);
  textAlign(CENTER, CENTER);
  textSize(13);
  text("최대 10자 · 영어, 숫자, _, . 만 사용 가능", width / 2, inputY + inputH + 25);
  text("입력한 아이디는 저장되지 않습니다.", width / 2, inputY + inputH + 48);

  if (idInputError) {
    fill(255, 95, 110);
    textSize(13);
    text(idInputError, width / 2, inputY + inputH + 74);
  }

  let startEnabled = isValidInstagramId(idInputText);
  fill(startEnabled ? color(200, 40, 60) : color(75));
  noStroke();
  rect(width / 2 - 110, height / 2 + 100, 220, 58, 15);

  fill(startEnabled ? 255 : 150);
  textSize(22);
  textStyle(BOLD);
  text("게임 시작", width / 2, height / 2 + 129);
}

function drawPlayScreen() {
  updateEndOfDayMonologue();

  if (!instagramStarted && dateManager.currentDay === 1) {
    room.display();
  } else {
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

  if (!dayTransitionActive) {
    monologue.update();
  }

  drawResetButton();
  drawResetConfirmPopup();

  monologue.display();
}

function updateEndOfDayMonologue() {
  if (!dateManager || !phone || !phone.instagram) return;
  if (dayTransitionActive) return;

  let currentStories = phone.instagram.stories || [];
  let currentChats = phone.instagram.dm ? phone.instagram.dm.chatRooms : [];

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
}

function drawResetButton() {
  fill(60);
  noStroke();
  rect(30, height - 60, 80, 35, 8);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(14);
  textStyle(NORMAL);
  text("Reset", 70, height - 43);
}

function drawResetConfirmPopup() {
  if (!showResetConfirm) return;

  fill(0, 0, 0, 160);
  noStroke();
  rect(0, 0, width, height);

  fill(40);
  stroke(80);
  strokeWeight(1);
  rect(width / 2 - 130, height / 2 - 70, 260, 140, 12);

  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(16);
  textStyle(BOLD);
  text("정말 리셋하시겠습니까?", width / 2, height / 2 - 30);

  fill(200, 40, 60);
  noStroke();
  rect(width / 2 - 110, height / 2 + 10, 100, 38, 8);
  fill(255);
  textSize(15);
  textStyle(NORMAL);
  text("Yes", width / 2 - 60, height / 2 + 29);

  fill(70);
  noStroke();
  rect(width / 2 + 10, height / 2 + 10, 100, 38, 8);
  fill(255);
  text("No", width / 2 + 60, height / 2 + 29);
}

function startDayTransition(day) {
  let video = getDayTransitionVideo(day);

  // 실제로 정의된 날짜 전환 영상이 없으면 아무 연출도 띄우지 않습니다.
  if (!video) {
    dayTransitionActive = false;
    currentDayTransitionVideo = null;
    return false;
  }

  if (currentDayTransitionVideo && currentDayTransitionVideo !== video) {
    currentDayTransitionVideo.stop();
    currentDayTransitionVideo.time(0);
  }

  currentDayTransitionVideo = video;
  dayTransitionActive = true;

  video.stop();
  video.time(0);
  video.play();

  return true;
}

function drawDayTransitionVideo() {
  background(0);

  if (!currentDayTransitionVideo) {
    stopDayTransitionVideo();
    return;
  }

  image(currentDayTransitionVideo, 0, 0, width, height);

  if (currentDayTransitionVideo.elt.ended) {
    stopDayTransitionVideo();
  }
}

function stopDayTransitionVideo() {
  if (currentDayTransitionVideo) {
    currentDayTransitionVideo.stop();
    currentDayTransitionVideo.time(0);
  }

  currentDayTransitionVideo = null;
  dayTransitionActive = false;
}

function mousePressed() {
  if (dayTransitionActive) return;

  if (showResetConfirm) {
    handleResetConfirmClick();
    return;
  }

  if (gameState !== "START" && isResetButtonClicked(mouseX, mouseY)) {
    showResetConfirm = true;
    return;
  }

  if (gameState === "START") {
    handleStartScreenClick();
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

function handleStartScreenClick() {
  if (!introVideoWatched) {
    if (isOpeningStartButtonClicked(mouseX, mouseY)) {
      userStartAudio();
      introVideoPlaying = true;
      introVideo.play();
    }
    return;
  }

  idInputFocused = isIdInputClicked(mouseX, mouseY);

  if (isIdStartButtonClicked(mouseX, mouseY)) {
    startGameFromIdInput();
  }
}

function isOpeningStartButtonClicked(mx, my) {
  return (
    mx > width / 2 - 100 &&
    mx < width / 2 + 100 &&
    my > height / 2 - 20 &&
    my < height / 2 + 40
  );
}

function isIdInputClicked(mx, my) {
  let inputX = width / 2 - 170;
  let inputY = height / 2 - 42;
  let inputW = 340;
  let inputH = 58;

  return mx >= inputX && mx <= inputX + inputW && my >= inputY && my <= inputY + inputH;
}

function isIdStartButtonClicked(mx, my) {
  return mx >= width / 2 - 110 && mx <= width / 2 + 110 && my >= height / 2 + 100 && my <= height / 2 + 158;
}

function startGameFromIdInput() {
  let cleanId = sanitizeInstagramId(idInputText.trim());

  if (!isValidInstagramId(cleanId)) {
    idInputError = "아이디를 1~10자의 영어, 숫자, _, . 로 입력해 주세요.";
    idInputFocused = true;
    return;
  }

  playerInstagramId = cleanId;
  idInputText = cleanId;
  idInputError = "";

  applyPlayerInstagramId();
  dateManager.loadDailyData();

  if (phone && phone.instagram) {
    phone.instagram.currentAccount = "main";
    phone.instagram.currentScreen = "feed";
  }

  gameState = "PLAY";
  instagramStarted = false;

  if (bgmManager) {
    bgmManager.playForDay(dateManager.currentDay);
  }

  startDayTransition(dateManager.currentDay);
}

function isResetButtonClicked(mx, my) {
  return mx > 30 && mx < 110 && my > height - 60 && my < height - 25;
}

function handleResetConfirmClick() {
  if (
    mouseX > width / 2 - 110 && mouseX < width / 2 - 10 &&
    mouseY > height / 2 + 10 && mouseY < height / 2 + 48
  ) {
    resetGameToStartScreen();
    return;
  }

  if (
    mouseX > width / 2 + 10 && mouseX < width / 2 + 110 &&
    mouseY > height / 2 + 10 && mouseY < height / 2 + 48
  ) {
    showResetConfirm = false;
  }
}

function resetGameToStartScreen() {
  showResetConfirm = false;
  gameState = "START";
  instagramStarted = false;

  // 1-1. 리셋 시 주인공 인스타 아이디와 도입부 진행 상태를 모두 초기화
  playerInstagramId = "";
  idInputText = "";
  idInputError = "";
  idInputFocused = true;
  introVideoWatched = false;
  introVideoPlaying = false;
  endingVideoPlaying = false;
  stopDayTransitionVideo();

  if (introVideo) {
    introVideo.stop();
    introVideo.time(0);
  }

  if (endingVideo) {
    endingVideo.stop();
    endingVideo.time(0);
  }

  if (bgmManager) {
    bgmManager.stopAll();
  }

  initializeGameObjects();
}

function keyPressed() {
  if (gameState === "START" && introVideoWatched) {
    // Backspace/Enter처럼 keyPressed에서 직접 처리해야 하는 키만 막는다.
    // 일반 문자 키까지 return false로 막으면 브라우저가 keyTyped 이벤트를 발생시키지 않아
    // 아이디 입력창에 글자가 들어가지 않는다.
    if (handleIdInputKeyPressed()) {
      return false;
    }
    return;
  }

  if (
    gameState === "PLAY" &&
    !dayTransitionActive &&
    !showResetConfirm &&
    !(monologue && monologue.active) &&
    phone && phone.instagram && phone.instagram.dm &&
    typeof phone.instagram.dm.handleKeyPressed === "function" &&
    phone.instagram.dm.handleKeyPressed(key, keyCode)
  ) {
    return false;
  }
}

function keyTyped() {
  if (gameState === "START" && introVideoWatched) {
    if (handleIdInputKeyTyped(key)) {
      return false;
    }
    return;
  }

  if (
    gameState === "PLAY" &&
    !dayTransitionActive &&
    !showResetConfirm &&
    !(monologue && monologue.active) &&
    phone && phone.instagram && phone.instagram.dm &&
    typeof phone.instagram.dm.handleKeyTyped === "function" &&
    phone.instagram.dm.handleKeyTyped(key)
  ) {
    return false;
  }
}

function handleIdInputKeyPressed() {
  if (!idInputFocused) return false;

  if (keyCode === BACKSPACE) {
    idInputText = idInputText.slice(0, -1);
    idInputError = "";
    return true;
  }

  if (keyCode === ENTER) {
    startGameFromIdInput();
    return true;
  }

  return false;
}

function handleIdInputKeyTyped(ch) {
  if (!idInputFocused) return false;
  if (!ch || ch.length !== 1) return false;

  if (!/[A-Za-z0-9_.]/.test(ch)) {
    idInputError = "영어, 숫자, _, . 만 사용할 수 있습니다.";
    return true;
  }

  if (idInputText.length >= INSTAGRAM_ID_MAX_LENGTH) {
    idInputError = "아이디는 최대 10자까지 입력할 수 있습니다.";
    return true;
  }

  idInputText += ch;
  idInputText = sanitizeInstagramId(idInputText);
  idInputError = "";
  return true;
}

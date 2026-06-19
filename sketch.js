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

let dayZeroReplayVideo;
let dayZeroReplayVideoPlaying = false;

let gameState = "START";
let mainImage;
let roomBgImg;
let instagramStarted = false;
let showResetConfirm = false;

let playerInstagramId = "";
let idInputText = "";
let idInputFocused = true;
let idInputError = "";
const INSTAGRAM_ID_MAX_LENGTH = 10;

// ======================================================
// Instagram Sans 폰트
// ======================================================
let fontInstagramLight;
let fontInstagramRegular;
let fontInstagramMedium;
let fontInstagramBold;
let fontInstagramHeadline;

// 한글은 Instagram Sans에서 깨질 수 있으므로 기본 sans-serif 사용
const KOREAN_UI_FONT = "sans-serif";

// ======================================================
// 시작 버튼: 우하단 자동 배치
// ======================================================
const OPENING_START_BUTTON_W = 260;
const OPENING_START_BUTTON_H = 76;
const OPENING_START_BUTTON_MARGIN_X = 44;
const OPENING_START_BUTTON_MARGIN_Y = 42;

// ======================================================
// 날짜 전환 영상
// 해당 날짜로 넘어갈 때 재생됨.
// 예: Day 2로 넘어가면 dayTwoVideo.mp4 재생
// ======================================================
const DAY_TRANSITION_VIDEO_PATHS = {
  1: "assets/dayOneVideo.mp4",
  2: "assets/dayTwoVideo.mp4",
  3: "assets/dayThreeVideo.mp4",
  4: "assets/dayFourVideo.mp4"
};

let dayTransitionVideos = {};
let dayTransitionVideoLoadFailed = {};
let dayTransitionActive = false;
let currentDayTransitionVideo = null;

let imgProfileMain, imgProfileFriend, imgProfileNpc, imgProfileRival, imgProfileNews;
let imgProfileAlba, imgProfileCop, imgProfileX, imgProfileShop, imgProfileSystem;
let haeun1, haeun2, haeun3, haeun4, haeun5;
let jian1_1, jian1_2, jian1_3, jian1_4, jian2_1, jian2_2, jian2_3, jian2_4;
let jian3_1, jian3_2, jian3_3, jian4_1, jian4_2, jian4_3, jian4_4;
let news1, news2, news3, news4, news5, news6, news7, news8, news9;
let seojun1, seojun2_1, seojun2_2, seojun3_v2, seojun4_1, seojun4_2;
let sooah1, sooah3, sooah4;
let accountX0, accountX1, accountX2, accountX3, accountX4, accountX5;
let endingVideo1;

function preload() {
  bgmManager = new BgmManager();
  bgmManager.preload();

  introVideo = createVideo("assets/intro.mp4");
  introVideo.hide();

  preloadDayTransitionVideos();

  // 폰트
  fontInstagramLight = loadFont("assets/Instagram Sans Light.ttf");
  fontInstagramRegular = loadFont("assets/Instagram Sans.ttf");
  fontInstagramMedium = loadFont("assets/Instagram Sans Medium.ttf");
  fontInstagramBold = loadFont("assets/Instagram Sans Bold.ttf");
  fontInstagramHeadline = loadFont("assets/Instagram Sans Headline.otf");

  // 시작 화면 이미지 / 방 배경
  mainImage = loadImage("assets/mainImage.png");
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
  seoah1 = loadImage("assets/seoah1.jpg");
    seoah2 = loadImage("assets/seoah2.jpg");
  seoah3 = loadImage("assets/seoah3.png");
  seoah4 = loadImage("assets/seoah4.png");
  seoah5 = loadImage("assets/seoah5.png");
  seoah6 = loadImage("assets/seoah6.png");
    endingVideo1 = createVideo("assets/movie.mp4");
  endingVideo1.hide();


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
  setKoreanUIFont(NORMAL);

  initializeGameObjects();

  // StoryUploader의 mainCamera 연출에서 사용
  webcam = createCapture(VIDEO);
  webcam.size(width, height);
  webcam.hide();
  webcam.elt.setAttribute("playsinline", "");
  webcam.elt.muted = true;
  webcam.elt.autoplay = true;
  webcam.elt.play();

  // 4일차 END / FAILED 화면에서 "사건의 전말 보기" 버튼을 눌렀을 때 재생
  endingVideo = createVideo("assets/endingVideoTest.mp4");
  endingVideo.hide();

  // 0일차 채팅의 "▶영상 보기"를 눌렀을 때 재생
  dayZeroReplayVideo = createVideo("assets/endingVideo.mp4");
  dayZeroReplayVideo.hide();
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
    clueHighlight.addHightlight(
      new Story(dummyUser, color(0), color(0), color(0), "하이라이트 테스트")
    );
  }

  storyUploader = new StoryUploader(phone.instagram);

  applyGlobalFonts();
}

function setInstagramFont(weight = "regular") {
  let selectedFont = fontInstagramRegular;

  if (weight === "light") {
    selectedFont = fontInstagramLight;
  } else if (weight === "medium") {
    selectedFont = fontInstagramMedium;
  } else if (weight === "bold") {
    selectedFont = fontInstagramBold;
  } else if (weight === "headline") {
    selectedFont = fontInstagramHeadline;
  }

  if (selectedFont) {
    textFont(selectedFont);
  }
}

function setKoreanUIFont(style = NORMAL) {
  textFont(KOREAN_UI_FONT);
  textStyle(style);
}

function applyGlobalFonts() {
  setKoreanUIFont(NORMAL);

  if (phone && phone.instagram) {
    let buffers = [
      phone.instagram.storyBuffer,
      phone.instagram.storyBuffer2,
      phone.instagram.webglBuffer
    ];

    for (let g of buffers) {
      if (g && typeof g.textFont === "function") {
        g.textFont(KOREAN_UI_FONT);
      }
    }
  }
}

function getOpeningStartButtonBounds() {
  return {
    x: width - OPENING_START_BUTTON_W - OPENING_START_BUTTON_MARGIN_X,
    y: height - OPENING_START_BUTTON_H - OPENING_START_BUTTON_MARGIN_Y,
    w: OPENING_START_BUTTON_W,
    h: OPENING_START_BUTTON_H
  };
}

function roundedRectPathForButton(ctx, x, y, w, h, r) {
  let radius = min(r, w / 2, h / 2);

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
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

  if (!cleanId) {
    cleanId = "주인공";
  }

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
  if (gameState === "PLAY" && !dayTransitionActive && !endingVideoPlaying && !dayZeroReplayVideoPlaying) {
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

  // 4일차 END / FAILED 화면의 "사건의 전말 보기" 버튼 이후 재생되는 영상
  // 이 영상이 끝난 뒤의 0일차 이동은 StoryUploader 또는 startEndingVideo()의 onended에서 처리
  if (endingVideoPlaying) {
    drawFullScreenVideo(endingVideo);
    return;
  }

  // 0일차 채팅의 "▶영상 보기" 클릭 시 재생되는 영상
  if (dayZeroReplayVideoPlaying) {
    drawFullScreenVideo(dayZeroReplayVideo);

    if (dayZeroReplayVideo.elt.ended) {
      dayZeroReplayVideoPlaying = false;
      dayZeroReplayVideo.stop();
      dayZeroReplayVideo.time(0);

      if (
        typeof bgmManager !== "undefined" &&
        bgmManager &&
        typeof bgmManager.playForDay === "function" &&
        typeof dateManager !== "undefined" &&
        dateManager
      ) {
        bgmManager.playForDay(dateManager.currentDay);
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
  drawMediaContain(video, 0, 0, width, height);
}

function drawMediaContain(media, x, y, w, h) {
  if (!media) return;

  // video는 실제 원본 크기(videoWidth/videoHeight)를 우선 사용.
  // 아직 메타데이터가 준비되지 않은 순간에는 1920x1080으로 계산해서
  // 첫 프레임부터 16:9 비율이 깨지지 않게 함.
  let mediaW = 1920;
  let mediaH = 1080;

  if (media.elt && media.elt.videoWidth > 0 && media.elt.videoHeight > 0) {
    mediaW = media.elt.videoWidth;
    mediaH = media.elt.videoHeight;
  } else if (media.width > 0 && media.height > 0) {
    mediaW = media.width;
    mediaH = media.height;
  }

  let s = min(w / mediaW, h / mediaH);
  let drawW = mediaW * s;
  let drawH = mediaH * s;
  let drawX = x + (w - drawW) / 2;
  let drawY = y + (h - drawH) / 2;

  image(media, drawX, drawY, drawW, drawH);
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
  background(0);

  if (mainImage) {
    drawMediaContain(mainImage, 0, 0, width, height);
  } else {
    background(14, 14, 18);
  }

  // 배경 위에 어두운 그라데이션을 올려서 버튼이 더 잘 보이게 함
  push();
  drawingContext.save();

  let bgGradient = drawingContext.createLinearGradient(0, height * 0.2, width, height);
  bgGradient.addColorStop(0.0, "rgba(0, 0, 0, 0.08)");
  bgGradient.addColorStop(0.55, "rgba(0, 0, 0, 0.24)");
  bgGradient.addColorStop(1.0, "rgba(0, 0, 0, 0.80)");

  drawingContext.fillStyle = bgGradient;
  drawingContext.fillRect(0, 0, width, height);

  drawingContext.restore();
  pop();

  let b = getOpeningStartButtonBounds();

  let isHovered = (
    mouseX >= b.x &&
    mouseX <= b.x + b.w &&
    mouseY >= b.y &&
    mouseY <= b.y + b.h
  );

  let lift = isHovered ? -5 : 0;
  let pulse = 0.5 + 0.5 * sin(frameCount * 0.06);

  // 버튼 모서리 둥글기.
  // h / 2에 가깝게 잡아서 귀퉁이가 완전히 삭제된 캡슐형 버튼처럼 보이게 함.
  let buttonRadius = 34;

  push();
  translate(0, lift);

  // 버튼 본체
  drawingContext.save();

  drawingContext.shadowColor = "rgba(0, 0, 0, 0.58)";
  drawingContext.shadowBlur = isHovered ? 36 : 24;
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = isHovered ? 15 : 11;

  roundedRectPathForButton(
    drawingContext,
    b.x,
    b.y,
    b.w,
    b.h,
    buttonRadius
  );

  drawingContext.fillStyle = isHovered
    ? "rgba(12, 14, 20, 0.96)"
    : "rgba(8, 10, 15, 0.90)";
  drawingContext.fill();

  drawingContext.restore();

  // 버튼 내부 효과
  drawingContext.save();

  roundedRectPathForButton(
    drawingContext,
    b.x,
    b.y,
    b.w,
    b.h,
    buttonRadius
  );
  drawingContext.clip();

  let buttonGradient = drawingContext.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
  buttonGradient.addColorStop(
    0.0,
    isHovered ? "rgba(255, 255, 255, 0.16)" : "rgba(255, 255, 255, 0.10)"
  );
  buttonGradient.addColorStop(0.48, "rgba(255, 255, 255, 0.035)");
  buttonGradient.addColorStop(1.0, "rgba(0, 0, 0, 0.18)");

  drawingContext.fillStyle = buttonGradient;
  drawingContext.fillRect(b.x, b.y, b.w, b.h);

  drawingContext.fillStyle = isHovered
    ? "rgba(255, 255, 255, 0.13)"
    : "rgba(255, 255, 255, 0.075)";
  drawingContext.fillRect(b.x, b.y, b.w, b.h * 0.48);

  let accentR = floor(215 + pulse * 25);
  let accentB = floor(82 + pulse * 25);

  drawingContext.fillStyle = `rgba(${accentR}, 45, ${accentB}, 0.95)`;
  roundedRectPathForButton(
    drawingContext,
    b.x + 18,
    b.y + 18,
    5,
    b.h - 36,
    5
  );
  drawingContext.fill();

  noStroke();
  fill(255, 255, 255, isHovered ? 34 : 22);
  circle(b.x + b.w - 42, b.y + b.h / 2, 42);

  drawingContext.restore();

  // 버튼 테두리
  drawingContext.save();

  roundedRectPathForButton(
    drawingContext,
    b.x,
    b.y,
    b.w,
    b.h,
    buttonRadius
  );

  drawingContext.strokeStyle = isHovered
    ? "rgba(255, 255, 255, 0.46)"
    : "rgba(255, 255, 255, 0.25)";
  drawingContext.lineWidth = 1.25;
  drawingContext.stroke();

  drawingContext.restore();

  // 텍스트
  setInstagramFont("light");

  textAlign(LEFT, CENTER);
  textStyle(NORMAL);
  textSize(11);
  fill(255, 255, 255, 165);
  text("TAP TO ENTER", b.x + 36, b.y + 23);

  setKoreanUIFont(BOLD);

  textAlign(LEFT, CENTER);
  textSize(25);
  fill(255);
  text("게임 시작", b.x + 36, b.y + 51);

  // 오른쪽 화살표
  let arrowX = b.x + b.w - 42;
  let arrowY = b.y + b.h / 2;

  stroke(255, 255, 255, isHovered ? 245 : 190);
  strokeWeight(2.3);
  strokeCap(ROUND);

  line(arrowX - 9, arrowY, arrowX + 8, arrowY);
  line(arrowX + 3, arrowY - 6, arrowX + 9, arrowY);
  line(arrowX + 3, arrowY + 6, arrowX + 9, arrowY);

  // 버튼 위쪽 작은 장식 텍스트
  setInstagramFont("medium");

  noStroke();
  textAlign(RIGHT, CENTER);
  textStyle(NORMAL);
  textSize(12);
  fill(255, 255, 255, 145);
  text("START THE CASE", b.x + b.w, b.y - 17);

  pop();

  setKoreanUIFont(NORMAL);
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

  // 핸드폰을 켜도 방 배경 이미지가 계속 보이도록 항상 방을 먼저 그림
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

  if (instagramStarted) {
    room.displayNextDayButton();
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

  let allStoriesRead =
    currentStories.length === 0 ||
    currentStories.every(s => s.isRead);

  let allChatsRead =
    currentChats.length === 0 ||
    currentChats.every(c => !c.unread);

  if (allStoriesRead && allChatsRead) {
    if (
      !dateManager.endMonologuePlayed[dateManager.currentDay] &&
      phone.instagram.currentScreen === "feed"
    ) {
      let endText = dateManager.getEndMonologue(dateManager.currentDay);

      if (endText) {
        monologue.start(endText);
      }

      dateManager.endMonologuePlayed[dateManager.currentDay] = true;
    } else if (
      dateManager.endMonologuePlayed[dateManager.currentDay] &&
      !monologue.active
    ) {
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

  drawMediaContain(currentDayTransitionVideo, 0, 0, width, height);

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

// StoryUploader가 직접 처리하지 못하는 경우를 위한 호환용 함수.
// endingVideoTest.mp4 재생 후 Day 0으로 넘어감.
function startEndingVideo() {
  if (!endingVideo) return;

  if (
    typeof bgmManager !== "undefined" &&
    bgmManager &&
    typeof bgmManager.stopAll === "function"
  ) {
    bgmManager.stopAll();
  }

  endingVideoPlaying = true;

  endingVideo.stop();
  endingVideo.time(0);

  endingVideo.elt.onended = function () {
    moveGameToDayZeroAfterEndingVideo();
  };

  endingVideo.play();
}

function moveGameToDayZeroAfterEndingVideo() {
  endingVideoPlaying = false;

  if (endingVideo) {
    endingVideo.stop();
    endingVideo.time(0);

    if (endingVideo.elt) {
      endingVideo.elt.onended = null;
    }
  }

  if (dateManager) {
    dateManager.currentDay = 0;

    dateManager.day4StoryUploadUnlocked = false;
    dateManager.day4StoryUploadReady = false;
    dateManager.day4StoryUploadHintPlayed = false;
    dateManager.storyUploadResolved = true;

    dateManager.uploadedToday = false;
    dateManager.accusedSuspect = null;
    dateManager.accuseResult = null;
    dateManager.taggedTarget = null;
    dateManager.taggedHandle = null;
    dateManager.storyUploadResult = null;

    dateManager.loadDailyData();
  }

  if (phone) {
    phone.expanded = true;
    phone.targetScale = 1;
    phone.targetFlipProgress = 1;
    phone.targetX = phone.bigX;
    phone.targetY = phone.bigY;

    if (phone.instagram) {
      phone.instagram.currentAccount = "main";
      phone.instagram.currentScreen = "feed";
    }
  }

  instagramStarted = true;
  gameState = "PLAY";

  if (bgmManager && typeof bgmManager.playForDay === "function") {
    bgmManager.playForDay(0);
  }

  if (
    dateManager &&
    monologue &&
    !dateManager.startMonologuePlayed[0]
  ) {
    let startText = dateManager.getStartMonologue(0);

    if (startText) {
      monologue.start(startText);
    }

    dateManager.startMonologuePlayed[0] = true;
  }
}

// 0일차 채팅의 "▶영상 보기" 클릭 시 호출
function startDayZeroReplayVideo() {
  if (!dayZeroReplayVideo) return;

  if (
    typeof bgmManager !== "undefined" &&
    bgmManager &&
    typeof bgmManager.stopAll === "function"
  ) {
    bgmManager.stopAll();
  }

  dayZeroReplayVideoPlaying = true;

  dayZeroReplayVideo.stop();
  dayZeroReplayVideo.time(0);
  dayZeroReplayVideo.play();
}

function mousePressed() {
  if (dayTransitionActive) return;
  if (endingVideoPlaying) return;
  if (dayZeroReplayVideoPlaying) return;

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

  // 다음날 버튼 / 4일차 독백 버튼을 핸드폰보다 먼저 처리
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
  let b = getOpeningStartButtonBounds();

  return (
    mx > b.x &&
    mx < b.x + b.w &&
    my > b.y &&
    my < b.y + b.h
  );
}

function isIdInputClicked(mx, my) {
  let inputX = width / 2 - 170;
  let inputY = height / 2 - 42;
  let inputW = 340;
  let inputH = 58;

  return (
    mx >= inputX &&
    mx <= inputX + inputW &&
    my >= inputY &&
    my <= inputY + inputH
  );
}

function isIdStartButtonClicked(mx, my) {
  return (
    mx >= width / 2 - 110 &&
    mx <= width / 2 + 110 &&
    my >= height / 2 + 100 &&
    my <= height / 2 + 158
  );
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
  return (
    mx > 30 &&
    mx < 110 &&
    my > height - 60 &&
    my < height - 25
  );
}

function handleResetConfirmClick() {
  if (
    mouseX > width / 2 - 110 &&
    mouseX < width / 2 - 10 &&
    mouseY > height / 2 + 10 &&
    mouseY < height / 2 + 48
  ) {
    resetGameToStartScreen();
    return;
  }

  if (
    mouseX > width / 2 + 10 &&
    mouseX < width / 2 + 110 &&
    mouseY > height / 2 + 10 &&
    mouseY < height / 2 + 48
  ) {
    showResetConfirm = false;
  }
}

function resetGameToStartScreen() {
  showResetConfirm = false;
  gameState = "START";
  instagramStarted = false;

  playerInstagramId = "";
  idInputText = "";
  idInputError = "";
  idInputFocused = true;

  introVideoWatched = false;
  introVideoPlaying = false;
  endingVideoPlaying = false;
  dayZeroReplayVideoPlaying = false;

  stopDayTransitionVideo();

  if (introVideo) {
    introVideo.stop();
    introVideo.time(0);
  }

  if (endingVideo) {
    endingVideo.stop();
    endingVideo.time(0);

    if (endingVideo.elt) {
      endingVideo.elt.onended = null;
    }
  }

  if (dayZeroReplayVideo) {
    dayZeroReplayVideo.stop();
    dayZeroReplayVideo.time(0);
  }

  if (bgmManager) {
    bgmManager.stopAll();
  }

  initializeGameObjects();
}

function keyPressed() {
  if (gameState === "START" && introVideoWatched) {
    if (handleIdInputKeyPressed()) {
      return false;
    }

    return;
  }

  if (
    gameState === "PLAY" &&
    !dayTransitionActive &&
    !showResetConfirm &&
    !endingVideoPlaying &&
    !dayZeroReplayVideoPlaying &&
    !(monologue && monologue.active) &&
    phone &&
    phone.instagram &&
    phone.instagram.dm &&
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
    !endingVideoPlaying &&
    !dayZeroReplayVideoPlaying &&
    !(monologue && monologue.active) &&
    phone &&
    phone.instagram &&
    phone.instagram.dm &&
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
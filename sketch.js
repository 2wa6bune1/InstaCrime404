// ======================================================
// sketch.js
// ======================================================
let phone;
let dateManager;
let room;
let storyUploader;
let clueHighlight;
let monologue; // 독백 시스템 변수 추가

let webcam; //5일차
let day5CameraActive = false;
let day5CameraStartFrame = 0;
let day5HandImg;
let endingVideo;
let endingVideoPlaying = false; 

let gameState = "START"; 

let imgProfileMain, imgProfileFriend, imgProfileNpc, imgProfileRival, imgProfileNews;
let imgProfileAlba, imgProfileCop, imgProfileX, imgProfileShop, imgProfileSystem;
let haeun1, haeun2, haeun3, haeun4, haeun5;
let jian1_1, jian1_2, jian1_3, jian1_4, jian2_1, jian2_2, jian2_3, jian2_4;
let jian3_1, jian3_2, jian3_3, jian4_1, jian4_2, jian4_3, jian4_4;
let news1, news2, news3, news4, news5, news6, news7, news8, news9, seojun1, seojun2_1, seojun2_2, seojun3, seojun4_1, seojun4_2;
let sooah1, sooah3, sooah4, accountX0, accountX1, accountX2, accountX3, accountX4, accountX5;

function preload() {
   // imgProfileFriend = loadImage('friendProfile.jpg');
   imgProfileNews = loadImage('assets/NewsProfile.png');
   imgProfileX = loadImage('assets/imgProfileX.png');
   imgProfileRival = loadImage('assets/sooahProfile.png');
   imgProfileNpc = loadImage('assets/jianProfile.png');
   imgProfileAlba = loadImage('assets/seojunProfile.png');
   imgProfileCop = loadImage('assets/haeunProfile.png');
   day5HandImg = loadImage('assets/bloodHand.png');
   haeun1 = loadImage('assets/haeun1.png');
   haeun2 = loadImage('assets/haeun2.png');
   haeun3 = loadImage('assets/haeun3.png');
   haeun4 = loadImage('assets/haeun4.png');
   haeun5 = loadImage('assets/haeun5.png');
   jian1_1 = loadImage('assets/jian1-1.png');
   jian1_2 = loadImage('assets/jian1-2.png');
   jian1_3 = loadImage('assets/jian1-3.png');
   jian1_4 = loadImage('assets/jian1-4.png');
   jian2_1 = loadImage('assets/jian2-1.png');
   jian2_2 = loadImage('assets/jian2-2.png');
   jian2_3 = loadImage('assets/jian2-3.png');
   jian2_4 = loadImage('assets/jian2-4.png');
   jian3_1 = loadImage('assets/jian3-1.png');
   jian3_2 = loadImage('assets/jian3-2.png');
   jian3_3 = loadImage('assets/jian3-3.png');
   jian4_1 = loadImage('assets/jian4-1.png');
   jian4_2 = loadImage('assets/jian4-2.png');
   jian4_3 = loadImage('assets/jian4-3.png');
   jian4_4 = loadImage('assets/jian4-4.png');
   news1 = loadImage('assets/news1.png');
   news2 = loadImage('assets/news2.png');
   news3 = loadImage('assets/news3.png');
   news4 = loadImage('assets/news4.png');
   news5 = loadImage('assets/news5.png');
   news6 = loadImage('assets/news6.png');
   news7 = loadImage('assets/news7.png');
   news8 = loadImage('assets/news8.png');
   news9 = loadImage('assets/news9.png');
   seojun1 = loadImage('assets/seojun1.png');
   seojun2_1 = loadImage('assets/seojun2-1.png');
   seojun2_2 = loadImage('assets/seojun2-2.png');
   seojun3 = loadImage('assets/seojun3.png');
   seojun4_1 = loadImage('assets/seojun4-1.png');
   seojun4_2 = loadImage('assets/seojun4-2.png');
   sooah1 = loadImage('assets/sooah1.JPG');
   sooah3 = loadImage('assets/sooah3.JPG');
   sooah4 = loadImage('assets/sooah4.JPG');
   accountX0 = loadImage('assets/X0.JPG');
   accountX1 = loadImage('assets/X1.JPG');
   accountX2 = loadImage('assets/X2.png');
   accountX3 = loadImage('assets/X3.png');
   accountX4 = loadImage('assets/X4.JPG');
   accountX5 = loadImage('assets/X5.JPG');
}

function setup() {
  createCanvas(900, 800);
  textFont("Arial");

  room = new Room();
  dateManager = new DateManager();
  phone = new PhoneUI(); 
  monologue = new MonologueSystem(); // 독백 시스템 초기화
  dateManager.loadDailyData(); 
  webcam = createCapture(VIDEO); //5일차 사용자 얼굴 비춰주는 카메라
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
        dateManager.day5CameraTriggered = false;
        dateManager.day5StartFrame = 0;
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

    updateDay5Sequence();
    drawDay5NoiseOverlay();

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
    
    monologue.update();
    monologue.display();
  }
}



function mousePressed() {
  if (gameState === "START") {
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && mouseY > height/2 - 20 && mouseY < height/2 + 40) {
      gameState = "PLAY";
    }
    return;
  }

  // 💡 독백이 떠있을 때 클릭하면 독백만 처리하고 함수 종료
  if (monologue.active) {
    monologue.checkClick();
    return; 
  }

  // 독백이 없을 때만 폰 클릭 이벤트 실행
  let phoneClicked = phone.handleMousePressed(); 
  if (!phoneClicked) {
    if (phone.expanded) {
      phone.minimize(); 
    } else {
      if (typeof room.checkClick === "function") {
        room.checkClick(mouseX, mouseY); 
      }
    }
  }
}

function mouseWheel(event) {
  if (gameState === "PLAY") {
    phone.handleMouseWheel(event);
  }
  return false;
}

function updateDay5Sequence() {
  if (!dateManager || dateManager.currentDay !== 5 || dateManager.day5SequenceFinished) return;

  if (!dateManager.day5StartFrame) {
    dateManager.day5StartFrame = frameCount;
    dateManager.day5CameraTriggered = true;
    dateManager.day5EndingReady = false;
  }

  let elapsed = frameCount - dateManager.day5StartFrame;

  // 4초 뒤 버튼 표시
  if (elapsed >= 240) {
    dateManager.day5EndingReady = true;
  }
}

  let elapsed = frameCount - dateManager.day5StartFrame;

  // 10초 뒤에 카메라 연출 시작
  if (elapsed >= 600 && !dateManager.day5CameraTriggered) {
    dateManager.day5CameraTriggered = true;
    day5CameraActive = true;
    day5CameraStartFrame = frameCount;
  }
}

function drawDay5NoiseOverlay() {
  if (!dateManager || dateManager.currentDay !== 5 || !dateManager.day5StartFrame) return;

  let elapsed = frameCount - dateManager.day5StartFrame;

  // 카메라 화면은 계속 유지
  if (webcam) {
    push();
    translate(width, 0);
    scale(-1, 1);
    image(webcam, 0, 0, width, height);
    pop();
  }

  // 처음 4초 동안만 노이즈 + 손바닥 연출
  if (elapsed < 240) {
    let intensity = constrain(map(elapsed, 0, 240, 0.25, 1), 0.25, 1);

    noStroke();
    for (let i = 0; i < 300 * intensity; i++) {
      if (random() < 0.5) {
        fill(255, random(10, 90) * intensity);
      } else {
        fill(0, random(10, 80) * intensity);
      }
      rect(random(width), random(height), random(1, 4), random(1, 4));
    }

    for (let i = 0; i < 10 * intensity; i++) {
      fill(random() < 0.5 ? 255 : 0, random(30, 100) * intensity);
      rect(0, random(height), width, random(2, 10));
    }

    if (day5HandImg) {
      let stampCount = 18;
      let stampSize = min(width, height) * 0.33;

      for (let i = 0; i < stampCount; i++) {
        let p = random();
        let x = lerp(-stampSize * 0.2, width + stampSize * 0.2, p);
        let y = lerp(-stampSize * 0.2, height + stampSize * 0.2, random());
        let alpha = random(90, 220);

        push();
        translate(x, y);
        rotate(random(-0.35, 0.35));
        imageMode(CENTER);
        tint(255, alpha);
        image(day5HandImg, 0, 0, stampSize, stampSize);
        noTint();
        pop();
      }
    }
  }
}

function startEndingVideo() {
  endingVideoPlaying = true;
  endingVideo.time(0);
  endingVideo.play();

  if (phone && phone.instagram) {
    phone.instagram.currentScreen = "endingVideo";
  }

  if (dateManager) {
    dateManager.day5EndingReady = false;
    dateManager.day5SequenceFinished = true;
    dateManager.day5CameraTriggered = false;
  }
}
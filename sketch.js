// ======================================================
// sketch.js
// ======================================================
let phone;
let dateManager;
let room;
let storyUploader;
let clueHighlight;

let gameState = "START"; 

let imgProfileMain, imgProfileFriend, imgProfileNpc, imgProfileRival;
let imgProfileAlba, imgProfileCop, imgProfileX, imgProfileShop, imgProfileSystem;

function preload() {
   imgProfileFriend = loadImage('friendProfile.jpg');
}

function setup() {
  createCanvas(900, 800);
  textFont("Arial");

  room = new Room();
  dateManager = new DateManager();
  phone = new PhoneUI(); 
  dateManager.loadDailyData(); 

  //하이라이트 추가하는 곳 
  clueHighlight = new Highlight("결정적 증거",200,150)
  clueHighlight.addHighlight("")

  storyUploader = new StoryUploader(phone.instagram); 

}

function draw() {
  if (gameState === "START") {
    background(20);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(40);
    textStyle(BOLD);
    text("MYSTERY GAME", width/2, height/3 - 30);

    fill(200, 40, 60);
    noStroke();
    rect(width/2 - 100, height/2 - 20, 200, 60, 15);
    
    fill(255);
    textSize(24);
    textStyle(NORMAL);
    text("게임 시작하기", width/2, height/2 + 10);
  } else {
    let currentStories = phone.instagram.stories;
    if (currentStories.length === 0 || currentStories.every(s => s.isRead === true)) {
      room.goNextDay = true;
    } else {
      room.goNextDay = false;
    }


    room.display();
    phone.update();

    //하이라이트
    if (phone.instagram.currentScreen === "profile") {
      clueHighlight.displayIcon; 
    //스토리 대신 하이라이트 틀었던거 --> 정보 복구하는 곳
    if (phone.instagram.backupStories && phone.instagram.currentScreen !== "story") {  //스토리 화면 끝났을 때 
      phone.instagram.stories = phone.instagram.backupStories; // 원본을 사용자한테 보여주는 공간으로 다시 이동시킴 (하이라이트 할당했었음) 
      phone.instagram.backupStories = null; // 금고 비우기
      phone.instagram.currentScreen = "feed"; // 나중에 profile로 바꿔줘야 함 
    }

    phone.display();

    if (!phone.expanded) {
      room.displayNextDayButton();
    }
  }
}

function mousePressed() {
  if (gameState === "START") {
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 && mouseY > height/2 - 20 && mouseY < height/2 + 40) {
      gameState = "PLAY";
    }
    return;
  }

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
}}
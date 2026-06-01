// ======================================================
// sketch.js
// ======================================================
let phone;
let dateManager;
let room;

let gameState = "START"; 

let imgPost1, imgStory1; 

function preload() {
  // imgPost1 = loadImage('assets/post1.png');
  // imgStory1 = loadImage('assets/story1.png');
}

function setup() {
  createCanvas(900, 800);
  textFont("Arial");

  room = new Room();
  dateManager = new DateManager();
  phone = new PhoneUI(); 
  
  dateManager.loadDailyData(); 
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

  // --- 💡 핸드폰 밖의 여백(배경)을 누르면 폰이 엎어집니다 ---
  let phoneClicked = phone.handleMousePressed(); 
  
  if (!phoneClicked) {
    if (phone.expanded) {
      phone.minimize(); // 폰 닫기 (주인공 방 복귀)
    } else {
      room.checkClick(mouseX, mouseY); // 방의 다른 요소(다음날 버튼 등) 클릭
    }
  }
}

function mouseWheel(event) {
  if (gameState === "PLAY") {
    phone.handleMouseWheel(event);
  }
  return false;
}
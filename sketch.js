// ======================================================
// sketch.js
// ======================================================
let phone;
let dateManager;
let room;
let storyUploader;

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
}
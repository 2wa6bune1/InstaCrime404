// ======================================================
// instagramDM.js
// ======================================================
let isChatOpen = false;
let activeChatId = null;


let chats = [
  { id: 0, name: "유저", lastMsg: "메세지", unread: true, color: [255, 100, 100] },
  { id: 1, name: "유저", lastMsg: "메세지", unread: true, color: [100, 200, 100] },
  { id: 2, name: "유저", lastMsg: "메세지", unread: false, color: [100, 100, 255] },
  { id: 3, name: "유저", lastMsg: "메세지", unread: true, color: [255, 200, 100] },
  { id: 4, name: "유저", lastMsg: "메세지", unread: false, color: [150, 100, 200] },
  { id: 5, name: "유저", lastMsg: "메세지", unread: true, color: [200, 150, 100] },
  { id: 6, name: "유저", lastMsg: "메세지", unread: false, color: [100, 180, 200] },
  { id: 7, name: "유저", lastMsg: "메세지", unread: false, color: [220, 120, 150] }
];

let dmImages = [];

function preload() {

}

function setup() {
  createCanvas(400, 700); 
}

function draw() {
  background(255);

  if (!isChatOpen) {
    drawMainUI();
  } else if (activeChatId === null) {
    drawDMList();
  } else {
    drawChatRoom(activeChatId);
  }
}

function drawMainUI() {
  fill(0);
  textSize(24);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text("Instagram", 20, 20);

  noFill();
  stroke(0);
  strokeWeight(1.5);
  rect(350, 15, 30, 30, 5);
  line(355, 20, 375, 25);
  line(375, 25, 355, 30);
  line(355, 30, 362, 25);
  line(362, 25, 355, 20);
}

function drawDMList() {
  fill(0);
  noStroke();
  textSize(18);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("Messages", width / 2, 30);

  textAlign(LEFT, CENTER);
  textSize(22);
  text("←", 20, 30);

  stroke(230);
  fill(245);
  rect(20, 60, width - 40, 35, 10);
  noStroke();
  fill(140);
  textSize(14);
  textStyle(NORMAL);
  text("검색", 35, 77);

  let startY = 120;
  let rowHeight = 75;

  for (let i = 0; i < chats.length; i++) {
    let currentY = startY + (i * rowHeight);

    stroke(245);
    strokeWeight(1);
    line(20, currentY + rowHeight, width - 20, currentY + rowHeight);

    noStroke();
    fill(chats[i].color[0], chats[i].color[1], chats[i].color[2]);
    ellipse(45, currentY + 37, 48, 48);

    fill(0);
    textAlign(LEFT, TOP);
    
    if (chats[i].unread) {
      textStyle(BOLD); 
    } else {
      textStyle(NORMAL);
    }
    textSize(15);
    text(chats[i].name, 85, currentY + 18);

    fill(chats[i].unread ? 0 : 120);
    textStyle(NORMAL);
    textSize(13);
    text(chats[i].lastMsg, 85, currentY + 42);

    if (chats[i].unread) {
      fill(0, 149, 246);
      noStroke();
      ellipse(365, currentY + 37, 8, 8);
    }
  }
}

function drawChatRoom(id) {
  fill(0);
  noStroke();
  textSize(16);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text(chats[id].name, width / 2, 30);

  textAlign(LEFT, CENTER);
  textSize(22);
  text("←", 20, 30);

  stroke(240);
  line(0, 55, width, 55);

  if (dmImages[id]) {
    image(dmImages[id], 0, 56, width, height - 56);
  } else {
    noStroke();
    fill(245);
    rect(20, 80, width - 40, height - 120, 15);
    fill(100);
    textSize(14);
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);
    text("[" + chats[id].name + "] 채팅방\n\n이 영역에 할당된 이미지가 출력됩니다.", width / 2, height / 2);
  }
}

function mousePressed() {
  if (!isChatOpen) {
    if (mouseX > 340 && mouseX < 390 && mouseY > 10 && mouseY < 50) {
      isChatOpen = true;
    }
  } 
  else if (activeChatId === null) {
    if (mouseX > 10 && mouseX < 50 && mouseY > 10 && mouseY < 50) {
      isChatOpen = false;
      return;
    }

    let startY = 120;
    let rowHeight = 75;
    
    for (let i = 0; i < chats.length; i++) {
      let currentY = startY + (i * rowHeight);
      
      if (mouseX > 0 && mouseX < width && mouseY > currentY && mouseY < currentY + rowHeight) {
        activeChatId = i;
        chats[i].unread = false;
        break;
      }
    }
  } 
  else {
    if (mouseX > 10 && mouseX < 50 && mouseY > 10 && mouseY < 50) {
      activeChatId = null;
    }
  }
}
// ======================================================
// DateManager.js
// ======================================================
class DateManager {
  constructor() {
    this.currentDay = 1;
    this.unlockedFeatures = { reels: false, chat: false, search: false };
  }

  loadDailyData() {
    let dailyStories = [];
    let dailyPosts = [];

    if (this.currentDay === 1) {
      // 1. 단짝 친구 (스토리 2개 연속)
      dailyStories.push(new Story("단짝_친구", color(255, 180, 100), color(255, 100, 100), color(255, 200, 150), "너도 그 이상한 소문 들었어?"));
      dailyStories.push(new Story("단짝_친구", color(255, 180, 100), color(255, 100, 100), color(255, 200, 150), "밤에 혼자 골목길 돌아다니지 마!"));
      
      // 2. 퀘스트 NPC
      dailyStories.push(new Story("npc_01", color(180, 80, 255), color(255, 80, 150), color(120, 90, 220), "오늘부터 새로운 단서 탐색 시작."));
      
      // 3. 라이벌
      dailyStories.push(new Story("rival", color(80, 200, 255), color(180, 80, 255), color(80, 160, 220), "이번엔 절대 안 져. 내가 먼저 찾는다."));
      
      // 4. 동네 알바생 (일상적인 느낌)
      dailyStories.push(new Story("편의점_알바", color(100, 200, 100), color(50, 150, 50), color(80, 180, 80), "야간 알바 중... 오늘따라 손님이 없네."));
      
      // 5. 경찰 (사건의 암시)
      dailyStories.push(new Story("김형사", color(100, 100, 255), color(50, 50, 200), color(50, 50, 150), "최근 이 근방에서 실종 신고가 급증하고 있습니다."));
      
      // 6. 의문의 X (공포 분위기 조성)
      dailyStories.push(new Story("의문의_X", color(255, 50, 50), color(150, 0, 0), color(50, 0, 0), "다 지켜보고 있다."));

      // 1일차 게시물
      dailyPosts.push(new Post("단짝_친구", "학교 앞", "오늘 날씨 완전 꿀꿀함 ☁️ 불안하게시리...", 12, color(200, 220, 240)));
      dailyPosts.push(new Post("npc_01", "방구석", "첫 번째 단서를 정리 중입니다.", 10, color(240, 180, 130)));
      dailyPosts.push(new Post("rival", "골목길", "너보다 한 발 앞서있다. 따라올 테면 따라와 봐.", 22, color(170, 130, 220)));
    } 
    else if (this.currentDay === 2) {
      dailyStories.push(new Story("shop", color(255, 220, 80), color(255, 80, 180), color(255, 190, 80), "비밀 상점 오픈했습니다!"));
      dailyStories.push(new Story("단짝_친구", color(255, 180, 100), color(255, 100, 100), color(255, 200, 150), "내 DM 확인 좀 해봐!! 급해!!"));
      dailyStories.push(new Story("npc_01", color(180, 80, 255), color(255, 80, 150), color(120, 90, 220), "아이템 너무 비싼 거 아니야...?"));
      
      dailyPosts.push(new Post("shop_master", "아이템 상점", "신규 탐색 장비 대량 입고되었습니다. 서두르세요.", 34, color(140, 190, 230)));
      dailyPosts.push(new Post("npc_01", "상점 앞", "골드가 부족해... 퀘스트 노가다 뛰어야겠다.", 15, color(120, 90, 220)));
      
      this.unlockedFeatures.chat = true;
    }
    else if (this.currentDay === 3) {
      dailyStories.push(new Story("rival", color(80, 200, 255), color(180, 80, 255), color(80, 160, 220), "이상한 폐건물을 찾았다."));
      dailyStories.push(new Story("rival", color(80, 200, 255), color(180, 80, 255), color(80, 160, 220), "여기 분위기 진짜 묘한데? 나 먼저 들어간다."));
      dailyStories.push(new Story("편의점_알바", color(100, 정글, 100), color(50, 150, 50), color(80, 180, 80), "방금 가게 앞 지나간 사람 누구지... 소름 돋아."));
      
      dailyPosts.push(new Post("rival", "알 수 없는 장소", "들어가지 말았어야 했나... 문이 안 열려.", 4, color(60, 60, 80)));
      dailyPosts.push(new Post("npc_01", "도서관", "과거 기록에서 무언가 의도적으로 지워진 흔적을 발견했다.", 28, color(200, 180, 150)));
      
      this.unlockedFeatures.reels = true;
    }
    else if (this.currentDay === 4) {
      dailyStories.push(new Story("단짝_친구", color(255, 180, 100), color(255, 100, 100), color(255, 200, 150), "제발 내 연락 좀 받아봐ㅠㅠ"));
      dailyStories.push(new Story("npc_01", color(180, 80, 255), color(255, 80, 150), color(120, 90, 220), "라이벌이랑 연락 안 되는 사람? 어제부터 잠수야."));
      dailyStories.push(new Story("김형사", color(100, 100, 255), color(50, 50, 200), color(50, 50, 150), "폐건물 출입을 절대 금지합니다. 폴리스 라인 쳤음."));
      
      dailyPosts.push(new Post("npc_01", "골목길", "어제부터 라이벌이 안 보인다. 장난치는 건가?", 5, color(100, 100, 120)));
      dailyPosts.push(new Post("???", "ERROR", "01010100 01110010 01110101", 0, color(150, 0, 0))); 
    }
    else if (this.currentDay === 5) {
      dailyStories.push(new Story("???", color(255, 0, 0), color(150, 0, 0), color(50, 0, 0), "도망쳐"));
      dailyStories.push(new Story("???", color(255, 0, 0), color(150, 0, 0), color(50, 0, 0), "이미 늦었어"));
      dailyStories.push(new Story("???", color(255, 0, 0), color(150, 0, 0), color(50, 0, 0), "이제 끝이야"));
      
      dailyPosts.push(new Post("???", "너의 등 뒤", "GAME OVER. 아무도 널 구하러 오지 않아.", 666, color(80, 0, 0)));
    }
    else if (this.currentDay === 0) {
      dailyStories.push(new Story("SYSTEM", color(0), color(100), color(0), "처음으로 돌아왔다."));
      dailyStories.push(new Story("SYSTEM", color(0), color(100), color(0), "이번엔 다른 선택을 하길."));
      
      dailyPosts.push(new Post("SYSTEM", "VOID", "루프가 초기화되었습니다. 기억을 잃지 마세요.", 0, color(0)));
    }

    phone.instagram.loadData(dailyStories, dailyPosts);
  }

  advanceDay() {
    this.currentDay++;
    if(this.currentDay > 5) {
      this.currentDay = 0; 
    }
    this.loadDailyData();
  }
}
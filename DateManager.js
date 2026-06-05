// ======================================================
// dateManager.js
// ======================================================
class DateManager {
  constructor() {
    this.currentDay = 1;
    this.unlockedFeatures = { reels: false, chat: false, search: false };

    // --- 💡 채팅에 등장할 인물들 명단 추가 ---
    this.users = {
      "주인공": new User("내 스토리", imgProfileMain),
      "박서아": new User("@seoa.archive", imgProfileFriend),
      "최지안": new User("@its_ji.anni", imgProfileNpc),
      "정수아": new User("@sooah.jung", imgProfileRival),
      "이서준": new User("@seo_jun.lee", imgProfileAlba),
      "강하은": new User("@grace_haeun", imgProfileCop),
      
     
      // 채팅 전용
      "이서준": new User("이서준", imgProfileNpc),
      "엄마": new User("엄마", imgProfileNpc)
    };
  }

  loadDailyData() {
    let dailyStories = [];
    let dailyPosts = [];
    let dailyChats = []; // 💡 날짜별 채팅 데이터를 담을 배열

    // ================= [ 1일차 ] =================
    if (this.currentDay === 1) {
      dailyStories.push(new Story(this.users["내 스토리"], "부계1.JPG"));
      dailyStories.push(new Story(this.users["@its_ji.anni"], "부계1.JPG"));
      dailyStories.push(new Story(this.users["@its_ji.anni"], "부계1.JPG"));
      dailyStories.push(new Story(this.users["@its_ji.anni"], "부계1.JPG"));
      dailyStories.push(new Story(this.users["@its_ji.anni"], "부계1.JPG"));

      dailyStories.push(new Story(this.users["@sooah.jung"], "정수아1.JPG"));
     
      dailyStories.push(new Story(this.users["@grace_haeun"], "강하은1.png"));


      
      dailyStories.push(new Story(this.users["npc_01"], color(255), "오늘부터 새로운 단서 탐색 시작."));
      dailyStories.push(new Story(this.users["rival"], color(255), "이번엔 절대 안 져. 내가 먼저 찾는다."));
      dailyStories.push(new Story(this.users["편의점_알바"], color(255), "야간 알바 중... 오늘따라 손님이 없네."));
      dailyStories.push(new Story(this.users["김형사"], color(255), "최근 이 근방에서 실종 신고가 급증하고 있습니다."));
      dailyStories.push(new Story(this.users["의문의_X"], color(255), "다 지켜보고 있다."));

      dailyPosts.push(new Post(this.users["단짝_친구"], "학교 앞", "오늘 날씨 완전 꿀꿀함 ☁️ 불안하게시리...", 12, color(200, 220, 240)));
      dailyPosts.push(new Post(this.users["npc_01"], "방구석", "첫 번째 단서를 정리 중입니다.", 10, color(240, 180, 130)));
      dailyPosts.push(new Post(this.users["rival"], "골목길", "너보다 한 발 앞서있다. 따라올 테면 따라와 봐.", 22, color(170, 130, 220)));
      
      // 1일차 DM (엄마의 일상적인 메시지)
      dailyChats.push({
        name: "엄마", user: this.users["엄마"], avatarColor: [180, 110, 110], active: false, unread: true, seen: false, time: "방금",
        messages: [{ text: "밥은 챙겨 먹고 다니니?", sent: false }]
      });
    } 
    // ================= [ 2일차 ] =================
    else if (this.currentDay === 2) {
      dailyStories.push(new Story(this.users["내 스토리"], "부계2.JPG"));
      dailyStories.push(new Story(this.users["@its_ji.anni"], color(255), "밤에 혼자 골목길 돌아다니지 마!"));
      dailyStories.push(new Story(this.users["@its_ji.anni"], color(255), "밤에 혼자 골목길 돌아다니지 마!"));
      dailyStories.push(new Story(this.users["@its_ji.anni"], color(255), "밤에 혼자 골목길 돌아다니지 마!"));
      dailyStories.push(new Story(this.users["@its_ji.anni"], color(255), "밤에 혼자 골목길 돌아다니지 마!"));

      dailyStories.push(new Story(this.users["@grace_haeun"], "강하은2.png"));


      dailyPosts.push(new Post(this.users["shop_master"], "아이템 상점", "신규 탐색 장비 대량 입고되었습니다. 서두르세요.", 34, color(140, 190, 230)));
      dailyPosts.push(new Post(this.users["npc_01"], "상점 앞", "골드가 부족해... 퀘스트 노가다 뛰어야겠다.", 15, color(120, 90, 220)));
      
      this.unlockedFeatures.chat = true;

      // 2일차 DM (의문의 인물과 이서준 등장)
      dailyChats.push({
        name: "의문의_X", user: this.users["의문의_X"], avatarColor: [120, 90, 200], active: true, activeText: "활동 중", unread: true, seen: false, time: "1분",
        messages: [
          { text: "자니?", sent: false },
          { text: "네가 올린 스토리 봤어", sent: false },
        ]
      });
      dailyChats.push({
        name: "이서준", user: this.users["이서준"], avatarColor: [70, 140, 230], active: true, unread: true, seen: false, time: "12분",
        messages: [
          { text: "내일 약속 그대로지?", sent: false },
          { text: "ㅇㅇ 7시 강남역", sent: true },
          { text: "오케이 늦지마ㅋㅋ", sent: false },
        ]
      });
      // 엄마 채팅 목록 누적 유지
      dailyChats.push({
        name: "엄마", user: this.users["엄마"], avatarColor: [180, 110, 110], active: false, unread: false, seen: true, time: "어제",
        messages: [{ text: "밥은 챙겨 먹고 다니니?", sent: false }, { text: "네 잘 먹고 있어요", sent: true }]
      });
    }
    // ================= [ 3일차 ] =================
    else if (this.currentDay === 3) {
      dailyStories.push(new Story(this.users["내 스토리"],"부계3.JPG"));
      dailyStories.push(new Story(this.users["@its_ji.anni"], ""));
      dailyStories.push(new Story(this.users["@its_ji.anni"], ""));
      dailyStories.push(new Story(this.users["@its_ji.anni"], ""));

       dailyStories.push(new Story(this.users["@sooah.jung"], "정수아3.JPG"));

      dailyStories.push(new Story(this.users["@grace_haeun"], "강하은3.png"));


      
      dailyPosts.push(new Post(this.users["rival"], "알 수 없는 장소", "들어가지 말았어야 했나... 문이 안 열려.", 4, color(60, 60, 80)));
      dailyPosts.push(new Post(this.users["npc_01"], "도서관", "과거 기록에서 무언가 의도적으로 지워진 흔적을 발견했다.", 28, color(200, 180, 150)));
      this.unlockedFeatures.reels = true;
      
      // 3일차 DM (위급한 친구 연락)
      dailyChats.push({
        name: "단짝_친구", user: this.users["단짝_친구"], avatarColor: [255, 180, 100], active: true, unread: true, seen: false, time: "방금",
        messages: [{ text: "야 빨리 내 스토리 좀 확인해봐!!", sent: false }, { text: "뉴스에 나온 곳 거기 맞지!?", sent: false }]
      });
      dailyChats.push({
        name: "의문의_X", user: this.users["의문의_X"], avatarColor: [120, 90, 200], active: true, unread: false, seen: true, time: "어제",
        messages: [{ text: "곧 알게 될 거야 🙂", sent: false }]
      });
    }
    // ================= [ 4일차 ] =================
    else if (this.currentDay === 4) {
      dailyStories.push(new Story(this.users["내 스토리"], "부계4.JPG"));
      dailyStories.push(new Story(this.users["@its_ji.anni"], color(255), "밤에 혼자 골목길 돌아다니지 마!"));
      dailyStories.push(new Story(this.users["@its_ji.anni"], color(255), "밤에 혼자 골목길 돌아다니지 마!"));
      dailyStories.push(new Story(this.users["@its_ji.anni"], color(255), "밤에 혼자 골목길 돌아다니지 마!"));
      dailyStories.push(new Story(this.users["@its_ji.anni"], color(255), "밤에 혼자 골목길 돌아다니지 마!"));

      dailyStories.push(new Story(this.users["@sooah.jung"], "정수아4.JPG"));
      dailyStories.push(new Story(this.users["@grace_haeun"], "강하은4.png"));


      
      dailyPosts.push(new Post(this.users["npc_01"], "골목길", "어제부터 라이벌이 안 보인다. 장난치는 건가?", 5, color(100, 100, 120)));
      dailyPosts.push(new Post(this.users["???"], "ERROR", "01010100 01110010 01110101", 0, color(150, 0, 0))); 

      // 4일차 DM (형사의 경고)
      dailyChats.push({
        name: "김형사", user: this.users["김형사"], avatarColor: [100, 100, 255], active: false, unread: true, seen: false, time: "5분 전",
        messages: [{ text: "최근 그 폐건물 근처에 간 적 있으십니까?", sent: false }, { text: "연락 확인하시면 바로 답장 바랍니다.", sent: false }]
      });
      dailyChats.push({
        name: "단짝_친구", user: this.users["단짝_친구"], avatarColor: [255, 180, 100], active: true, unread: true, seen: false, time: "2시간 전",
        messages: [{ text: "전화 왜 안 받아!!!", sent: false }]
      });
    }
    // ================= [ 5일차 ] =================
    else if (this.currentDay === 5) {
      dailyStories.push(new Story(this.users["내 스토리"], "부계5.JPG"));

      dailyStories.push(new Story(this.users["@grace_haeun"], "강하은5(수정예정).png"));

      dailyStories.push(new Story(this.users["@its_ji.anni"], color(255), "밤에 혼자 골목길 돌아다니지 마!"));
      dailyStories.push(new Story(this.users["@its_ji.anni"], color(255), "밤에 혼자 골목길 돌아다니지 마!"));
      


      
      dailyPosts.push(new Post(this.users["???"], "너의 등 뒤", "GAME OVER. 아무도 널 구하러 오지 않아.", 666, color(80, 0, 0)));

      // 5일차 DM (마지막 공포)
      dailyChats.push({
        name: "???", user: this.users["???"], avatarColor: [150, 0, 0], active: true, unread: true, seen: false, time: "지금",
        messages: [{ text: "뒤돌아봐", sent: false }]
      });
    }
    // ================= [ 0일차 (루프) ] =================
    else if (this.currentDay === 0) {
      dailyStories.push(new Story(this.users["내스토리"], "부계0.JPG"));
      dailyStories.push(new Story(this.users["@seoa.archive"], color(0), color(100), color(0), "이번엔 다른 선택을 하길."));
      dailyStories.push(new Story(this.users["@seoa.archive"], color(0), color(100), color(0), "이번엔 다른 선택을 하길."));
      dailyStories.push(new Story(this.users["@seoa.archive"], color(0), color(100), color(0), "이번엔 다른 선택을 하길."));
      dailyStories.push(new Story(this.users["@seoa.archive"], color(0), color(100), color(0), "이번엔 다른 선택을 하길."));
      dailyStories.push(new Story(this.users["@seoa.archive"], color(0), color(100), color(0), "이번엔 다른 선택을 하길."));

      dailyStories.push(new Story(this.users["@its_ji.anni"], color(255), "밤에 혼자 골목길 돌아다니지 마!"));


      
      dailyPosts.push(new Post(this.users["SYSTEM"], "VOID", "루프가 초기화되었습니다. 기억을 잃지 마세요.", 0, color(0)));
      dailyChats = []; // 채팅 초기화
    }

    // --- 💡 데이터 넘겨주기 ---
    if (typeof phone !== 'undefined' && phone.instagram) {
      phone.instagram.loadData(dailyStories, dailyPosts);
      phone.instagram.loadChatData(dailyChats); // UI쪽으로 날짜별 채팅 데이터를 전송!
    }
  }

  advanceDay() {
    this.currentDay++;
    if(this.currentDay > 5) {
      this.currentDay = 0; 
    }
    this.loadDailyData();
  }
}


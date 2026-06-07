// ======================================================
// dateManager.js
// ======================================================
class DateManager {
  constructor() {
    this.currentDay = 1;
    this.unlockedFeatures = { reels: false, chat: false, search: false };

    // --- 💡 채팅 및 전역에 등장할 인물들 명단 ---
    this.users = {
      "주인공": new User("내 스토리", imgProfileMain),
      "박서아": new User("@seoa.archive", imgProfileFriend),
      "최지안": new User("@its_ji.anni", imgProfileNpc),
      "정수아": new User("@sooah.jung", imgProfileRival),
      "이서준": new User("@seo_jun.lee", imgProfileAlba),
      "강하은": new User("@grace_haeun", imgProfileCop),
      "부계": new User("@last.frame_", imgProfileX),
      
      // 시스템 및 특수 계정들 (포스트/DM에서 쓰임)
      "의문의_X": new User("의문의_X", imgProfileX),
      "shop_master": new User("shop_master", imgProfileShop),
      "???": new User("???", imgProfileX),
      "SYSTEM": new User("SYSTEM", imgProfileSystem),
      "엄마": new User("엄마", imgProfileNpc),
      "daily_news": new User("@daily_news", imgProfileNews)
    };
  }

  loadDailyData() {
    let dailyStories = [];
    let dailyPosts = [];
    let dailyChats = []; 

    // ================= [ 1일차 ] =================
    if (this.currentDay === 1) {
      dailyStories.push(new Story(this.users["최지안"], jian1-1.png));
      dailyStories.push(new Story(this.users["최지안"], jian1-2.png));
      dailyStories.push(new Story(this.users["최지안"], jian1-3.png));
      dailyStories.push(new Story(this.users["최지안"], jian1-4.png));
      dailyStories.push(new Story(this.users["부계"], X1.png));
      dailyStories.push(new Story(this.users["정수아"], sooah1.JPG));
      dailyStories.push(new Story(this.users["이서준"], seojun1.png));
      

      dailyPosts.push(new Post(this.users["박서아"], "학교 앞", "오늘 날씨 완전 꿀꿀함 ☁️ 불안하게시리...", 12, color(200, 220, 240)));
      dailyPosts.push(new Post(this.users["최지안"], "방구석", "첫 번째 단서를 정리 중입니다.", 10, color(240, 180, 130)));
      dailyPosts.push(new Post(this.users["정수아"], "골목길", "너보다 한 발 앞서있다. 따라올 테면 따라와 봐.", 22, color(170, 130, 220)));
      
      dailyChats.push({
        name: "엄마", user: this.users["엄마"], avatarColor: [180, 110, 110], active: false, unread: true, seen: false, time: "방금",
        messages: [{ text: "밥은 챙겨 먹고 다니니?", sent: false }]
      });
    } 
    // ================= [ 2일차 ] =================
    else if (this.currentDay === 2) {
      dailyStories.push(new Story(this.users["최지안"], jian2-1.png));
      dailyStories.push(new Story(this.users["최지안"], jian2-2.png));
      dailyStories.push(new Story(this.users["최지안"], jian2-3.png));
      dailyStories.push(new Story(this.users["최지안"], jian2-4.png));

      dailyStories.push(new Story(this.users["부계"], X2.png));

      dailyStories.push(new Story(this.users["정수아"], jian2-1.png));
      dailyStories.push(new Story(this.users["정수아"], jian2-2.png));
      dailyStories.push(new Story(this.users["정수아"], jian2-3.png));
      dailyStories.push(new Story(this.users["정수아"], jian2-4.png));

      dailyStories.push(new Story(this.users["이서준"], seojun2-1.png));
      dailyStories.push(new Story(this.users["이서준"], seojun2-2.png, "", "friend"));

  


      dailyPosts.push(new Post(this.users["shop_master"], "아이템 상점", "신규 탐색 장비 대량 입고되었습니다. 서두르세요.", 34, color(140, 190, 230)));
      dailyPosts.push(new Post(this.users["최지안"], "상점 앞", "골드가 부족해... 퀘스트 노가다 뛰어야겠다.", 15, color(120, 90, 220)));
      
      this.unlockedFeatures.chat = true;

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
      dailyChats.push({
        name: "엄마", user: this.users["엄마"], avatarColor: [180, 110, 110], active: false, unread: false, seen: true, time: "어제",
        messages: [{ text: "밥은 챙겨 먹고 다니니?", sent: false }, { text: "네 잘 먹고 있어요", sent: true }]
      });
    }
    // ================= [ 3일차 ] =================
    else if (this.currentDay === 3) {
      dailyStories.push(new Story(this.users["이서준"], seojun3));
      dailyStories.push(new Story(this.users["정수아"], sooah3));
      dailyStories.push(new Story(this.users["부계"], accountX3));
      dailyStories.push(new Story(this.users["강하은"], haeun3));

      dailyStories.push(new Story(this.users["최지안"], jian3_1)); 
      dailyStories.push(new Story(this.users["최지안"], jian3_2));
      dailyStories.push(new Story(this.users["최지안"], jian3_3));
      
      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "부산 20대 대학생 살인사건, 연쇄살인 수사로 전환", 104, color(20), news3));
      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "영화 블루 아크 개봉 첫 주 예매 1위! \n@야 나랑 이거 볼래?", 254, color(20), news7));
      
      dailyChats.push({
        name: "박서아", user: this.users["박서아"], avatarColor: [255, 180, 100], active: true, unread: true, seen: false, time: "방금",
        messages: [{ text: "야 빨리 내 스토리 좀 확인해봐!!", sent: false }, { text: "뉴스에 나온 곳 거기 맞지!?", sent: false }]
      });
      dailyChats.push({
        name: "의문의_X", user: this.users["의문의_X"], avatarColor: [120, 90, 200], active: true, unread: false, seen: true, time: "어제",
        messages: [{ text: "곧 알게 될 거야 🙂", sent: false }]
      });
    }
    // ================= [ 4일차 ] =================
    else if (this.currentDay === 4) {
      dailyStories.push(new Story(this.users["강하은"], haeun4));

      dailyStories.push(new Story(this.users["최지안"], jian4_1));
      dailyStories.push(new Story(this.users["최지안"], jian4_2));
      dailyStories.push(new Story(this.users["최지안"], jian4_3));
      dailyStories.push(new Story(this.users["최지안"], jian4_4, "", "friend"));

      dailyStories.push(new Story(this.users["부계"], accountX4));
      dailyStories.push(new Story(this.users["이서준"], seojun4_1));
      dailyStories.push(new Story(this.users["이서준"], seojun4_2, "", "friend"));
      dailyStories.push(new Story(this.users["정수아"], sooah4));
      
      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "드라마 비밀의 도시 시청률 15% 돌파 ㄷㄷ \n@야 너도 이거 봐??", 75, color(20), news8));
      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "국가대표 축구팀 극적 역전승, 8강 진출 미쳤다...", 739, color(20), news9));

      dailyChats.push({
        name: "강하은", user: this.users["강하은"], avatarColor: [100, 100, 255], active: false, unread: true, seen: false, time: "5분 전",
        messages: [{ text: "최근 그 폐건물 근처에 간 적 있으십니까?", sent: false }, { text: "연락 확인하시면 바로 답장 바랍니다.", sent: false }]
      });
      dailyChats.push({
        name: "박서아", user: this.users["박서아"], avatarColor: [255, 180, 100], active: true, unread: true, seen: false, time: "2시간 전",
        messages: [{ text: "전화 왜 안 받아!!!", sent: false }]
      });
    }
    // // ================= [ 5일차 ] =================
    else if (this.currentDay === 5) {
      dailyStories.push(new Story(this.users["주인공"], "부계5.JPG"));
      dailyStories.push(new Story(this.users["강하은"], "강하은5(수정예정).png"));
      dailyStories.push(new Story(this.users["최지안"], color(255), "밤에 혼자 골목길 돌아다니지 마!"));
      dailyStories.push(new Story(this.users["최지안"], color(255), "밤에 혼자 골목길 돌아다니지 마!"));
      
      dailyPosts.push(new Post(this.users["???"], "너의 등 뒤", "GAME OVER. 아무도 널 구하러 오지 않아.", 666, color(80, 0, 0)));

      dailyChats.push({
        name: "???", user: this.users["???"], avatarColor: [150, 0, 0], active: true, unread: true, seen: false, time: "지금",
        messages: [{ text: "뒤돌아봐", sent: false }]
      });
    }
    // ================= [ 0일차 (루프) ] =================
    else if (this.currentDay === 0) {
      dailyStories.push(new Story(this.users["주인공"], accountX0));
      dailyStories.push(new Story(this.users["박서아"], color(0), "이번엔 다른 선택을 하길."));
      dailyStories.push(new Story(this.users["박서아"], color(0), "이번엔 다른 선택을 하길."));
      dailyStories.push(new Story(this.users["박서아"], color(0), "이번엔 다른 선택을 하길."));
      dailyStories.push(new Story(this.users["박서아"], color(0), "이번엔 다른 선택을 하길."));
      dailyStories.push(new Story(this.users["박서아"], color(0), "이번엔 다른 선택을 하길."));

      dailyStories.push(new Story(this.users["최지안"], color(255), "밤에 혼자 골목길 돌아다니지 마!"));
      
      dailyPosts.push(new Post(this.users["SYSTEM"], "VOID", "루프가 초기화되었습니다. 기억을 잃지 마세요.", 0, color(0)));
      dailyChats = []; 
    }

    // --- 💡 데이터 넘겨주기 ---
    if (typeof phone !== 'undefined' && phone.instagram) {
      phone.instagram.loadData(dailyStories, dailyPosts);
      phone.instagram.loadChatData(dailyChats);
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
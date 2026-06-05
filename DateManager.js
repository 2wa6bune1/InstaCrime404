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
      "단짝_친구": new User("단짝_친구", imgProfileFriend),
      "npc_01": new User("npc_01", imgProfileNpc),
      "rival": new User("rival", imgProfileRival),
      "편의점_알바": new User("편의점_알바", imgProfileAlba),
      "김형사": new User("김형사", imgProfileCop),
      "의문의_X": new User("의문의_X", imgProfileX),
      "shop": new User("shop", imgProfileShop),
      "shop_master": new User("shop_master", imgProfileShop),
      "???": new User("???", imgProfileX),
      "SYSTEM": new User("SYSTEM", imgProfileSystem),
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
      dailyStories.push(new Story(this.users["단짝_친구"], color(255, 180, 100), color(255, 100, 100), color(255, 200, 150), "너도 그 이상한 소문 들었어?"));
      dailyStories.push(new Story(this.users["단짝_친구"], color(255, 180, 100), color(255, 100, 100), color(255, 200, 150), "밤에 혼자 골목길 돌아다니지 마!"));
      dailyStories.push(new Story(this.users["npc_01"], color(180, 80, 255), color(255, 80, 150), color(120, 90, 220), "오늘부터 새로운 단서 탐색 시작."));
      dailyStories.push(new Story(this.users["rival"], color(80, 200, 255), color(180, 80, 255), color(80, 160, 220), "이번엔 절대 안 져. 내가 먼저 찾는다."));
      dailyStories.push(new Story(this.users["편의점_알바"], color(100, 200, 100), color(50, 150, 50), color(80, 180, 80), "야간 알바 중... 오늘따라 손님이 없네."));
      dailyStories.push(new Story(this.users["김형사"], color(100, 100, 255), color(50, 50, 200), color(50, 50, 150), "최근 이 근방에서 실종 신고가 급증하고 있습니다."));
      dailyStories.push(new Story(this.users["의문의_X"], color(255, 50, 50), color(150, 0, 0), color(50, 0, 0), "다 지켜보고 있다."));

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
      dailyStories.push(new Story(this.users["shop"], color(255, 220, 80), color(255, 80, 180), color(255, 190, 80), "비밀 상점 오픈했습니다!"));
      dailyStories.push(new Story(this.users["단짝_친구"], color(255, 180, 100), color(255, 100, 100), color(255, 200, 150), "내 DM 확인 좀 해봐!! 급해!!"));
      dailyStories.push(new Story(this.users["npc_01"], color(180, 80, 255), color(255, 80, 150), color(120, 90, 220), "아이템 너무 비싼 거 아니야...?"));
      
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
      dailyStories.push(new Story(this.users["rival"], color(80, 200, 255), color(180, 80, 255), color(80, 160, 220), "이상한 폐건물을 찾았다."));
      dailyStories.push(new Story(this.users["rival"], color(80, 200, 255), color(180, 80, 255), color(80, 160, 220), "여기 분위기 진짜 묘한데? 나 먼저 들어간다."));
      dailyStories.push(new Story(this.users["편의점_알바"], color(100, 200, 100), color(50, 150, 50), color(80, 180, 80), "방금 가게 앞 지나간 사람 누구지... 소름 돋아."));
      
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
      dailyStories.push(new Story(this.users["단짝_친구"], color(255, 180, 100), color(255, 100, 100), color(255, 200, 150), "제발 내 연락 좀 받아봐ㅠㅠ"));
      dailyStories.push(new Story(this.users["npc_01"], color(180, 80, 255), color(255, 80, 150), color(120, 90, 220), "라이벌이랑 연락 안 되는 사람? 어제부터 잠수야."));
      dailyStories.push(new Story(this.users["김형사"], color(100, 100, 255), color(50, 50, 200), color(50, 50, 150), "폐건물 출입을 절대 금지합니다. 폴리스 라인 쳤음."));
      
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
      dailyStories.push(new Story(this.users["???"], color(255, 0, 0), color(150, 0, 0), color(50, 0, 0), "도망쳐"));
      dailyStories.push(new Story(this.users["???"], color(255, 0, 0), color(150, 0, 0), color(50, 0, 0), "이미 늦었어"));
      dailyStories.push(new Story(this.users["???"], color(255, 0, 0), color(150, 0, 0), color(50, 0, 0), "이제 끝이야"));
      
      dailyPosts.push(new Post(this.users["???"], "너의 등 뒤", "GAME OVER. 아무도 널 구하러 오지 않아.", 666, color(80, 0, 0)));

      // 5일차 DM (마지막 공포)
      dailyChats.push({
        name: "???", user: this.users["???"], avatarColor: [150, 0, 0], active: true, unread: true, seen: false, time: "지금",
        messages: [{ text: "뒤돌아봐", sent: false }]
      });
    }
    // ================= [ 0일차 (루프) ] =================
    else if (this.currentDay === 0) {
      dailyStories.push(new Story(this.users["SYSTEM"], color(0), color(100), color(0), "처음으로 돌아왔다."));
      dailyStories.push(new Story(this.users["SYSTEM"], color(0), color(100), color(0), "이번엔 다른 선택을 하길."));
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
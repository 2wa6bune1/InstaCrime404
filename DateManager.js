// ======================================================
// dateManager.js
// ======================================================
class DateManager {
  constructor() {
    this.currentDay = 1;
    this.unlockedFeatures = { reels: false, chat: false, search: false };

    // 날짜별 독백 출력 여부 추적
    this.startMonologuePlayed = {}; 
    this.endMonologuePlayed = {};
    // 5일차 연출용
    this.day5StartFrame = 0;
    this.day5CameraTriggered = false;
    this.day5StartFrame = 0;
    this.day5CameraTriggered = false;
    this.day5EndingReady = false;

    this.day5SequenceFinished = false;

    // 💡 날짜별 시작/끝 독백 문장
    this.dayMonologues = {
      1: {
        start: "서아가 죽었다는 소식을 듣고 난 뒤 침울함을 이길 수가 없다. 서아와 여행을 갔던 다른 친구들이 어떻게 지내는지 보면 기분이 좀 나아지려나...",
        end: "지안이는 언제 강서구까지 간거야... 그리고 저 의문의 계정... 누군가의 부계정이었던 것 같은데... 기억이 나지 않는다."
      },
      2: {
        start: "부계정의 스토리가 아직도 신경쓰이네... 언제부터 팔로우되어있던거지",
        end: "교살 사건... 서아의 사건인건가? 이어폰... 혹시?"
      },
      3: {
        start: "채팅이 온 것 같다. 그러고보니 서아가 죽고 침울해져서 한동안 우리끼리도 이야기를 나누지 않았었지.",
        end: "수아가 그동안 쓰던 줄 이어폰을 바꾼듯하다."
      },
      4: {
        start: "이게 뭐지...?",
        end: "이제 누가 범인인지 알 것 같다. 더 이상 우리끼리 의심하는 일은 없었으면 해."
      },
      5: {
        start: "(독백을 채워넣으세요)",
        end: "(독백을 채워넣으세요)"
      },
      0: {
        start: "(독백을 채워넣으세요)",
        end: "(독백을 채워넣으세요)"
      }
    };


    // --- 💡 채팅 및 전역에 등장할 인물들 명단 ---
    this.users = {
      "주인공": new User("내 스토리", imgProfileMain),
      "박서아": new User("seoa.archive", imgProfileFriend),
      "최지안": new User("its_ji.anni", imgProfileNpc),
      "정수아": new User("sooah.jung", imgProfileRival),
      "이서준": new User("seo_jun.lee", imgProfileAlba),
      "강하은": new User("grace_haeun", imgProfileCop),
      "부계": new User("last.frame_", imgProfileX),
      
      // 시스템 및 특수 계정들 (포스트/DM에서 쓰임)
      "의문의_X": new User("의문의_X", imgProfileX),
      "shop_master": new User("shop_master", imgProfileShop),
      "???": new User("???", imgProfileX),
      "SYSTEM": new User("SYSTEM", imgProfileSystem),
      "엄마": new User("엄마", imgProfileNpc),
      "daily_news": new User("@daily_news", imgProfileNews)
    };
  }

  getStartMonologue(day = this.currentDay) {
    if (this.dayMonologues[day] && this.dayMonologues[day].start) {
      return this.dayMonologues[day].start;
    }

    return `[Day ${day}] 눈을 떴다. 먼저 핸드폰의 알림부터 확인해보자...`;
  }

  getEndMonologue(day = this.currentDay) {
    if (this.dayMonologues[day] && this.dayMonologues[day].end) {
      return this.dayMonologues[day].end;
    }

    return `[Day ${day}] 모든 알림과 연락을 확인했다. 이제 다음으로 넘어가볼까...`;
  }

  loadDailyData() {
    let dailyStories = [];
    let dailyPosts = [];
    let dailyChats = []; 

    // ================= [ 1일차 ] =================
    if (this.currentDay === 1) {
      // 스토리 (독백이 필요한 경우 마지막 인자로 전달)
      dailyStories.push(new Story(this.users["최지안"], jian1_1));
      dailyStories.push(new Story(this.users["최지안"], jian1_2));
      dailyStories.push(new Story(this.users["최지안"], jian1_3));
      dailyStories.push(new Story(this.users["최지안"], jian1_4));
      
      dailyStories.push(new Story(this.users["부계"], accountX1, "", "default", "이 계정... 왠지 익숙한데, 기분 탓인가?"));
      
      dailyStories.push(new Story(this.users["정수아"], sooah1));
      dailyStories.push(new Story(this.users["이서준"], seojun1));

      
      
      // 포스트
      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "부산에서 20대 여성, 숨진 채 발견", 328, color(20), news1));
      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "배우 한서윤, 새 로맨스 영화 주연 확정", 42, color(20), news4));

      // 채팅 (monoText 속성으로 진입 시 독백 설정)
      dailyChats.push({
        name: "엄마", user: this.users["엄마"], avatarColor: [180, 110, 110], active: false, unread: true, seen: false, time: "방금",
        monoText: "엄마한테서 온 연락이다... 뭐라고 답장해야 할까.",
        messages: [{ text: "밥은 챙겨 먹고 다니니?", sent: false }]
      });
      dailyChats.push({
  name: "여행 멤버들",
  isGroup: true,

  // 단체방 프로필에 합쳐서 보일 유저들
  users: [
    this.users["박서아"],
    this.users["최지안"],
    this.users["정수아"],
    this.users["이서준"]
  ],

  // 상단에 몇 명인지 표시하거나, 이름을 직접 쓰고 싶을 때 사용
  memberNames: ["박서아", "최지안", "정수아", "이서준"],

  active: false,
  unread: true,
  seen: false,
  time: "방금",
  monoText: "단체 채팅방에 오랜만에 메시지가 올라왔다.",

  messages: [
    { separator: "오늘" },

    {
      text: "다들 뉴스 봤어?",
      sender: "최지안",
      user: this.users["최지안"]
    },

    {
      text: "봤어. 그 장소 맞는 것 같던데...",
      sender: "정수아",
      user: this.users["정수아"]
    },

    {
      text: "잠깐만, 그럼 서아가 올린 스토리랑 이어지는 거 아니야?",
      sender: "이서준",
      user: this.users["이서준"]
    },

    // user/sender가 없으므로 플레이어 쪽 채팅
    {
      text: "나도 다시 확인해볼게."
    },

    {
      text: "빨리 확인해줘. 뭔가 이상해.",
      sender: "박서아",
      user: this.users["박서아"]
    }
  ]
});
    } 
    // ================= [ 2일차 ] =================
    else if (this.currentDay === 2) {
      dailyStories.push(new Story(this.users["최지안"], jian2_1));
      dailyStories.push(new Story(this.users["최지안"], jian2_2));
      dailyStories.push(new Story(this.users["최지안"], jian2_3));
      dailyStories.push(new Story(this.users["최지안"], jian2_4));
      dailyStories.push(new Story(this.users["부계"], accountX2));
      dailyStories.push(new Story(this.users["정수아"], jian2_3));
      dailyStories.push(new Story(this.users["정수아"], jian2_4));
      dailyStories.push(new Story(this.users["이서준"], seojun2_1));
      dailyStories.push(new Story(this.users["이서준"], seojun2_2, "", "friend"));

      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "아이돌 그룹 루미에, 정규 2집 컴백 예고", 178, color(20), news6));
      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "부산 20대 대학생 살인사건, 교살 정확 확실. 흉기는 아직 발견되지 않아...", 241, color(20), news3));
      
      this.unlockedFeatures.chat = true;

      dailyChats.push({
        name: "의문의_X", user: this.users["의문의_X"], avatarColor: [120, 90, 200], active: true, activeText: "활동 중", unread: true, seen: false, time: "1분",
        monoText: "모르는 사람한테서 온 디엠... 누구지?",
        messages: [
          { text: "자니?", sent: false },
          { text: "네가 올린 스토리 봤어", sent: false },
        ]
      });
      dailyChats.push({
        name: "이서준", user: this.users["이서준"], avatarColor: [70, 140, 230], active: true, unread: true, seen: false, time: "12분",
        monoText: "내일 약속... 까먹을 뻔했네.",
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
      
      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "부산 20대 대학생 살인사건, 연쇄살인 수사로 전환", 104, color(20), news2));
      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "영화 블루 아크 개봉 첫 주 예매 1위! \n@야 나랑 이거 볼래?", 254, color(20), news7));
      
      dailyChats.push({
        name: "박서아", user: this.users["박서아"], avatarColor: [255, 180, 100], active: true, unread: true, seen: false, time: "방금",
        monoText: "서아다. 엄청 다급해 보이는데...",
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
        monoText: "경찰...? 나한테 왜 연락을 한 거지?",
        messages: [{ text: "최근 그 폐건물 근처에 간 적 있으십니까?", sent: false }, { text: "연락 확인하시면 바로 답장 바랍니다.", sent: false }]
      });
      dailyChats.push({
        name: "박서아", user: this.users["박서아"], avatarColor: [255, 180, 100], active: true, unread: true, seen: false, time: "2시간 전",
        messages: [{ text: "전화 왜 안 받아!!!", sent: false }]
      });
    }
    // ================= [ 5일차 ] =================
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

    // 데이터 전달 (채팅은 instagramDM.js 쪽으로 넘김)
    if (typeof phone !== 'undefined' && phone.instagram) {
      phone.instagram.loadData(dailyStories, dailyPosts);
      phone.instagram.dm.loadChatData(dailyChats);
    }
  }

  advanceDay() {
    this.currentDay++;
    if(this.currentDay > 5) {
      this.currentDay = 0; 
    }
    this.loadDailyData();

    if (this.currentDay === 5) {
      this.day5StartFrame = 0;
      this.day5CameraTriggered = false;
      this.day5EndingReady = false;
      this.day5SequenceFinished = false;
    }
  }
}
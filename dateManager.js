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
    // 4일차 스토리 업로드 루트 상태
this.day4StoryUploadReady = false;
this.day4StoryUploadHintPlayed = false;
this.storyUploadResolved = false;
this.uploadedToday = false;
this.accusedSuspect = null;
this.accuseResult = null;
this.taggedTarget = null;
this.taggedHandle = null;
this.storyUploadResult = null;
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
        end: "그러고보니 지안이가 다녀온 맛집에 간 이유도, 정신을 잃었다가 그 근방에서 깨어나서였어."
      },
      4: {
        start: "하은이한테는 말하지 못했지만... 정신병원에 다녀왔다.",
        end: "이제 누가 범인인지 알 것 같다. 더 이상 우리끼리 의심하는 일은 없었으면 해."
      },

      0: {
        start: "이제 다시 내 시간인가...",
        end: "서아랑 쓴 채팅방을 나가기만 하면... 이제 끝이다"
      }
    };


    // --- 💡 채팅 및 전역에 등장할 인물들 명단 ---
    this.users = {
      "주인공": new User("내 스토리", imgProfileMain),
      "박서아": new User("seoa.archive", imgProfileFriend),
      "최지안": new User("its_ji.anni", imgProfileNpc),
      "정수진": new User("su.zinni_", imgProfileRival),
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
      
      dailyStories.push(new Story(this.users["정수진"], sooah1));
      dailyStories.push(new Story(this.users["이서준"], seojun1));
      
      // 포스트
      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "부산에서 20대 여성, 숨진 채 발견", 328, color(20), news1));
      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "배우 한서윤, 새 로맨스 영화 주연 확정", 42, color(20), news4));

      // 채팅
      dailyChats.push({
        name: "last.frame_", user: this.users["부계"], avatarColor: [120, 90, 200], active: false, unread: true, seen: false, time: "오늘",
        messages: [
          { separator: "오늘" },
          { text: "ㅋㅋㅋ", sent: false }
        ]
      });

      dailyChats.push({
        name: "부산 여행",
        isGroup: true,
        users: [
          this.users["박서아"],
          this.users["최지안"],
          this.users["정수진"],
          this.users["이서준"],
          this.users["강하은"]
        ],
        memberNames: ["박서아", "최지안", "정수진", "이서준", "강하은"],
        active: false,
        unread: true,
        seen: false,
        time: "어제",
        messages: [
          { separator: "어제" },
          { text: "얘들아 미안해 ㅠㅠ 진짜진짜 급한 일이 있다고 부모님이 불러서 바로 집에 가봐야할 것 같아 ㅠㅠ", sender: "박서아", user: this.users["박서아"] },
          { text: "???", sender: "이서준", user: this.users["이서준"] },
          { text: "무슨일인데?", sender: "최지안", user: this.users["최지안"] },
          { text: "너 짐은 어떻게 해?", sender: "최지안", user: this.users["최지안"] },

          { separator: "어제" },
          { text: "혹시 서아랑 연락 되는 사람 없어?", sender: "이서준", user: this.users["이서준"] },
          { text: "어제 이후로 계속 연락을 안받아...", sender: "이서준", user: this.users["이서준"] },
          { text: "원래 서아 연락 잘 안보지 않아?", sender: "강하은", user: this.users["강하은"] },
          { text: "급한 일 있으면 하루 정도는 자주 안보긴 하는데... 불안해서...", sender: "이서준", user: this.users["이서준"] },
          { text: "혹시 저녁에 살인사건 기사 뜬 거 봤어?", sender: "최지안", user: this.users["최지안"] },
          { text: "이거 서아 아니겠지?", sender: "최지안", user: this.users["최지안"] },
          { text: "설마", sender: "이서준", user: this.users["이서준"] },
          { text: "수진아 너 서아 부모님 연락처 알지", sender: "이서준", user: this.users["이서준"] },
          { text: "ㅂ빨리 ㅇ연락드려봐", sender: "이서준", user: this.users["이서준"] },
          { text: "방금 서아 부모님께 연락 드렸는데... 맞대", sender: "정수진", user: this.users["정수진"] }
        ]
      });

      dailyChats.push({
        name: "지안이 깜짝생파 준비",
        isGroup: true,
        users: [
          this.users["박서아"],
          this.users["정수진"],
          this.users["이서준"],
          this.users["강하은"]
        ],
        memberNames: ["박서아", "정수진", "이서준", "강하은"],
        active: false,
        unread: false,
        seen: true,
        time: "어제",
        messages: [
          { separator: "어제" },
          { text: "그러면 각자 흩어져서 준비한대로 ㄱㄱ", sender: "이서준", user: this.users["이서준"] },
          { text: "6시에 시작하면 되는거지 ???" },
          { text: "ㅇㅇㅇ", sender: "이서준", user: this.users["이서준"] },
          { text: "아니 서아 얘는 어디갔어", sender: "이서준", user: this.users["이서준"] }
        ]
      });

      dailyChats.push({
        name: "최지안", user: this.users["최지안"], avatarColor: [90, 180, 180], active: false, unread: false, seen: true, time: "4일전",
        messages: [
          { separator: "4일전" },
          { text: "야 너가 그 때 알려준 거 뭐였지?", sent: false },
          { text: "ㄱㄷ 내가 정리해놓은거 보내줄게", sent: true },
          { text: "게시물을 확인할 수 없습니다", sent: true }
        ]
      });

      dailyChats.push({
        name: "강하은", user: this.users["강하은"], avatarColor: [100, 100, 255], active: false, unread: false, seen: true, time: "5일전",
        messages: [
          { separator: "5일전" },
          { text: "저번에 말했던 건 좀 괜찮아?", sent: false },
          { text: "요즘은 좀 덜한거같은데... 여행 간 동안은 안그러겠지 ???", sent: true },
          { text: "괜찮아", sent: false },
          { text: "혹시 무슨 일 있으면 내가 막아줄게", sent: false }
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
      dailyStories.push(new Story(this.users["정수진"], jian2_3));
      dailyStories.push(new Story(this.users["정수진"], jian2_4));
      dailyStories.push(new Story(this.users["이서준"], seojun2_1));
      dailyStories.push(new Story(this.users["이서준"], seojun2_2, "", "friend"));

      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "부산 20대 대학생 살인사건, 교살 정확 확실. 흉기는 아직 발견되지 않아...", 241, color(20), news3));
      
      this.unlockedFeatures.chat = true;

      dailyChats.push({
        name: "last.frame_", user: this.users["부계"], avatarColor: [120, 90, 200], active: false, unread: true, seen: false, time: "오늘",
        messages: [
          { separator: "어제" },
          { text: "ㅋㅋㅋ", sent: false },
          { text: "너 누구야", sent: true },

          { separator: "오늘" },
          { text: "곧 알게될 걸 ???", sent: false }
        ]
      });

      dailyChats.push({
        name: "강하은", user: this.users["강하은"], avatarColor: [100, 100, 255], active: false, unread: true, seen: false, time: "오늘",
        messages: [
          { separator: "5일전" },
          { text: "저번에 말했던 건 좀 괜찮아?", sent: false },
          { text: "요즘은 좀 덜한거같은데... 여행 간 동안은 안그러겠지 ???", sent: true },
          { text: "괜찮아", sent: false },
          { text: "혹시 무슨 일 있으면 내가 막아줄게", sent: false },

          { separator: "오늘" },
          { text: "서아 죽고 나서 점점 심해지는거같아...", sent: true },
          { text: "한동안 안그러다가 서아 죽은날부터 3일째 자꾸 기절해", sent: true },
          { text: "우리 신부님이 도움 주실 수 있을거야", sent: false },
          { text: "그 전까지는 나가지 말고 있어", sent: false }
        ]
      });

      dailyChats.push({
        name: "부산 여행",
        isGroup: true,
        users: [
          this.users["박서아"],
          this.users["최지안"],
          this.users["정수진"],
          this.users["이서준"],
          this.users["강하은"]
        ],
        memberNames: ["박서아", "최지안", "정수진", "이서준", "강하은"],
        active: false,
        unread: false,
        seen: true,
        time: "어제",
        messages: [
          { separator: "2일 전" },
          { text: "얘들아 미안해 ㅠㅠ 진짜진짜 급한 일이 있다고 부모님이 불러서 바로 집에 가봐야할 것 같아 ㅠㅠ", sender: "박서아", user: this.users["박서아"] },
          { text: "???", sender: "이서준", user: this.users["이서준"] },
          { text: "무슨일인데?", sender: "최지안", user: this.users["최지안"] },
          { text: "너 짐은 어떻게 해?", sender: "최지안", user: this.users["최지안"] },

          { separator: "어제" },
          { text: "혹시 서아랑 연락 되는 사람 없어?", sender: "이서준", user: this.users["이서준"] },
          { text: "어제 이후로 계속 연락을 안받아...", sender: "이서준", user: this.users["이서준"] },
          { text: "원래 서아 연락 잘 안보지 않아?", sender: "강하은", user: this.users["강하은"] },
          { text: "급한 일 있으면 하루 정도는 자주 안보긴 하는데... 불안해서...", sender: "이서준", user: this.users["이서준"] },
          { text: "혹시 저녁에 살인사건 기사 뜬 거 봤어?", sender: "최지안", user: this.users["최지안"] },
          { text: "이거 서아 아니겠지?", sender: "최지안", user: this.users["최지안"] },
          { text: "설마", sender: "이서준", user: this.users["이서준"] },
          { text: "수진아 너 서아 부모님 연락처 알지", sender: "이서준", user: this.users["이서준"] },
          { text: "ㅂ빨리 ㅇ연락드려봐", sender: "이서준", user: this.users["이서준"] },
          { text: "방금 서아 부모님께 연락 드렸는데... 맞대", sender: "정수진", user: this.users["정수진"] }
        ]
      });

      dailyChats.push({
        name: "지안이 깜짝생파 준비",
        isGroup: true,
        users: [
          this.users["박서아"],
          this.users["정수진"],
          this.users["이서준"],
          this.users["강하은"]
        ],
        memberNames: ["박서아", "정수진", "이서준", "강하은"],
        active: false,
        unread: false,
        seen: true,
        time: "2일전",
        messages: [
          { separator: "2일전" },
          { text: "그러면 각자 흩어져서 준비한대로 ㄱㄱ", sender: "이서준", user: this.users["이서준"] },
          { text: "6시에 시작하면 되는거지 ???" },
          { text: "ㅇㅇㅇ", sender: "이서준", user: this.users["이서준"] },
          { text: "아니 서아 얘는 어디갔어", sender: "이서준", user: this.users["이서준"] }
        ]
      });

      dailyChats.push({
        name: "최지안", user: this.users["최지안"], avatarColor: [90, 180, 180], active: false, unread: false, seen: true, time: "4일전",
        messages: [
          { separator: "4일전" },
          { text: "야 너가 그 때 알려준 거 뭐였지?", sent: false },
          { text: "ㄱㄷ 내가 정리해놓은거 보내줄게", sent: true },
          { text: "게시물을 확인할 수 없습니다", sent: true }
        ]
      });

    }
    // ================= [ 3일차 ] =================
    else if (this.currentDay === 3) {
      dailyStories.push(new Story(this.users["이서준"], seojun3_v2));
      dailyStories.push(new Story(this.users["정수진"], sooah3));
      dailyStories.push(new Story(this.users["부계"], accountX3));
      dailyStories.push(new Story(this.users["강하은"], haeun3));
      dailyStories.push(new Story(this.users["최지안"], jian3_1)); 
      dailyStories.push(new Story(this.users["최지안"], jian3_2));
      dailyStories.push(new Story(this.users["최지안"], jian3_3));
      
      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "부산 20대 대학생 살인사건, 연쇄살인 수사로 전환", 104, color(20), news2));
      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "영화 블루 아크 개봉 첫 주 예매 1위! \n@야 나랑 이거 볼래?", 254, color(20), news7));
      
      dailyChats.push({
        name: "강하은", user: this.users["강하은"], avatarColor: [100, 100, 255], active: false, unread: true, seen: false, time: "오늘",
        messages: [
          { separator: "6일전" },
          { text: "저번에 말했던 건 좀 괜찮아?", sent: false },
          { text: "요즘은 좀 덜한거같은데... 여행 간 동안은 안그러겠지 ???", sent: true },
          { text: "괜찮아", sent: false },
          { text: "혹시 무슨 일 있으면 내가 막아줄게", sent: false },

          { separator: "어제" },
          { text: "서아 죽고 나서 점점 심해지는거같아...", sent: true },
          { text: "한동안 안그러다가 서아 죽은날부터 3일 연속으로 기절해.", sent: true },
          { text: "우리 신부님이 도움 주실 수 있을거야", sent: false },
          { text: "그 전까지는 나가지 말고 있어", sent: false },

          { separator: "오늘" },
          { text: "오늘은 좀 어때", sent: false },
          { text: "아직까진 아무 일도 없어.", sent: true },
          { text: "신부님이 자세한 증상 설명해 달라는데", sent: false },
          { text: "한번에 한 두시간? 정도 기절하고.", sent: true },
          { text: "기절할 때랑 다른 장소에서 깨어나는 것 같아.", sent: true },
          { text: "악령이 들린거 아니야?", sent: false }
        ]
      });

      dailyChats.push({
        name: "최지안", user: this.users["최지안"], avatarColor: [90, 180, 180], active: false, unread: true, seen: false, time: "오늘",
        monoText: "내가 언제 이런걸 친거지? 확실히 지안이가 올린건 다 내가 갔던 맛집들이지만... 정말로 기억이 없다...",
        messages: [
          { separator: "5일전" },
          { text: "야 너가 그 때 알려준 거 뭐였지?", sent: false },
          { text: "ㄱㄷ 내가 정리해놓은거 보내줄게", sent: true },
          { text: "게시물을 확인할 수 없습니다", sent: true },

          { separator: "오늘" },
          { text: "아니", sent: false },
          { text: "맛집은 너가 알려준 거잖아", sent: false },
          { text: "서준이한테 뭐라고 해봐", sent: false },
          { text: "뭔소리야", sent: true },
          { text: "내가 언제", sent: true },
          { text: "???", sent: false },
          { text: "위에 채팅 내용 남아있잖아;;", sent: false }
        ]
      });

      dailyChats.push({
        name: "부산 여행",
        isGroup: true,
        users: [
          this.users["박서아"],
          this.users["최지안"],
          this.users["정수진"],
          this.users["이서준"],
          this.users["강하은"]
        ],
        memberNames: ["박서아", "최지안", "정수진", "이서준", "강하은"],
        active: false,
        unread: true,
        seen: false,
        time: "오늘",
        messages: [
          { separator: "3일 전" },
          { text: "얘들아 미안해 ㅠㅠ 진짜진짜 급한 일이 있다고 부모님이 불러서 바로 집에 가봐야할 것 같아 ㅠㅠ", sender: "박서아", user: this.users["박서아"] },
          { text: "???", sender: "이서준", user: this.users["이서준"] },
          { text: "무슨일인데?", sender: "최지안", user: this.users["최지안"] },
          { text: "너 짐은 어떻게 해?", sender: "최지안", user: this.users["최지안"] },

          { separator: "2일 전" },
          { text: "혹시 서아랑 연락 되는 사람 없어?", sender: "이서준", user: this.users["이서준"] },
          { text: "어제 이후로 계속 연락을 안받아...", sender: "이서준", user: this.users["이서준"] },
          { text: "원래 서아 연락 잘 안보지 않아?", sender: "강하은", user: this.users["강하은"] },
          { text: "급한 일 있으면 하루 정도는 자주 안보긴 하는데... 불안해서...", sender: "이서준", user: this.users["이서준"] },
          { text: "혹시 저녁에 살인사건 기사 뜬 거 봤어?", sender: "최지안", user: this.users["최지안"] },
          { text: "이거 서아 아니겠지?", sender: "최지안", user: this.users["최지안"] },
          { text: "설마", sender: "이서준", user: this.users["이서준"] },
          { text: "수진아 너 서아 부모님 연락처 알지", sender: "이서준", user: this.users["이서준"] },
          { text: "ㅂ빨리 ㅇ연락드려봐", sender: "이서준", user: this.users["이서준"] },
          { text: "방금 서아 부모님께 연락 드렸는데... 맞대", sender: "정수진", user: this.users["정수진"] },

          { separator: "오늘" },
          { text: "서준이 너", sender: "최지안", user: this.users["최지안"] },
          { text: "스토리 우리 보라고 올린거야?", sender: "최지안", user: this.users["최지안"] },
          { text: "ㅇ", sender: "이서준", user: this.users["이서준"] },
          { text: "이렇게 공개적으로 하는건 아니지 않아?", sender: "최지안", user: this.users["최지안"] },
          { text: "서아가 그렇게 된지 얼마나 됐다고", sender: "이서준", user: this.users["이서준"] },
          { text: "보란듯이 놀러다는걸 올려?", sender: "이서준", user: this.users["이서준"] },
          { text: "연쇄살인 기사도 봤지?", sender: "이서준", user: this.users["이서준"] },
          { text: "너가 간 동네, 다 거기 나오던데?", sender: "이서준", user: this.users["이서준"] },
          { text: "나 진짜 이상한 생각도 들어.", sender: "이서준", user: this.users["이서준"] },
          { text: "서준아. 진정해", sender: "강하은", user: this.users["강하은"] },
          { text: "서아도 너가 이러길 원하지 않을거야.", sender: "강하은", user: this.users["강하은"] },
          { text: "내일 서아 가는 길인데 편하게 보내줘야지.", sender: "강하은", user: this.users["강하은"] }
        ]
      });

      dailyChats.push({
        name: "last.frame_", user: this.users["부계"], avatarColor: [120, 90, 200], active: false, unread: false, seen: true, time: "어제",
        messages: [
          { separator: "3일전" },
          { text: "ㅋㅋㅋ", sent: false },
          { text: "너 누구야", sent: true },

          { separator: "어제" },
          { text: "곧 알게될 걸 ???", sent: false }
        ]
      });

      dailyChats.push({
        name: "지안이 깜짝생파 준비",
        isGroup: true,
        users: [
          this.users["박서아"],
          this.users["정수진"],
          this.users["이서준"],
          this.users["강하은"]
        ],
        memberNames: ["박서아", "정수진", "이서준", "강하은"],
        active: false,
        unread: false,
        seen: true,
        time: "3일전",
        messages: [
          { separator: "3일전" },
          { text: "그러면 각자 흩어져서 준비한대로 ㄱㄱ", sender: "이서준", user: this.users["이서준"] },
          { text: "6시에 시작하면 되는거지 ???" },
          { text: "ㅇㅇㅇ", sender: "이서준", user: this.users["이서준"] },
          { text: "아니 서아 얘는 어디갔어", sender: "이서준", user: this.users["이서준"] }
        ]
      });

    }
        // ================= [ 4일차 ] =================
    else if (this.currentDay === 4) {
      dailyStories.push(new Story(this.users["강하은"], haeun4, "", "default", "오늘 서아의 장례식이 있었다."));
      dailyStories.push(new Story(this.users["최지안"], jian4_1));
      dailyStories.push(new Story(this.users["최지안"], jian4_2));
      dailyStories.push(new Story(this.users["최지안"], jian4_3));
      dailyStories.push(new Story(this.users["최지안"], jian4_4, "", "friend"));
      dailyStories.push(new Story(this.users["부계"], accountX4));
      dailyStories.push(new Story(this.users["이서준"], seojun4_1));
      dailyStories.push(new Story(this.users["이서준"], seojun4_2, "", "friend"));
      dailyStories.push(new Story(this.users["정수진"], sooah4));
      
      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "드라마 비밀의 도시 시청률 15% 돌파 ㄷㄷ \n@야 너도 이거 봐??", 75, color(20), news8));
      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "국가대표 축구팀 극적 역전승, 8강 진출 미쳤다...", 739, color(20), news9));

      
      dailyChats.push({
        name: "강하은",
        user: this.users["강하은"],
        avatarColor: [100, 100, 255],
        active: false,
        unread: true,
        seen: false,
        time: "어제",
        messages: [
          { separator: "일주일전" },
          { text: "저번에 말했던 건 좀 괜찮아?", sent: false },
          { text: "요즘은 좀 덜한거같은데... 여행 간 동안은 안그러겠지 ???", sent: true },
          { text: "괜찮아", sent: false },
          { text: "혹시 무슨 일 있으면 내가 막아줄게", sent: false },

          { separator: "2일전" },
          { text: "서아 죽고 나서 점점 심해지는거같아...", sent: true },
          { text: "한동안 안그러다가 서아 죽은날부터 3일 연속으로 기절해.", sent: true },
          { text: "우리 신부님이 도움 주실 수 있을거야", sent: false },
          { text: "그 전까지는 나가지 말고 있어", sent: false },

          { separator: "어제" },
          { text: "오늘은 좀 어때", sent: false },
          { text: "아직까진 아무 일도 없어.", sent: true },
          { text: "신부님이 자세한 증상 설명해 달라는데", sent: false },
          { text: "한번에 한 두시간? 정도 기절하고.", sent: true },
          { text: "기절할 때랑 다른 장소에서 깨어나는 것 같아.", sent: true },
          { text: "악령이 들린거 아니야?", sent: false }



        ]
      });

            dailyChats.push({
        name: "정수진", user: this.users["최지안"], avatarColor: [90, 180, 180], active: false, unread: false, seen: true, time: "3일전",
        messages: [
          { separator: "어제" },
          { text: "에어팟 어때?", sent: false },
          { text: "이거 진짜 말 안돼", sent: true },
          { text: "너도 그동안 줄 이어폰 썼잖아. 이김에 바꿔봐", sent: true },
          { text: "그럴까... 나도 쓰던거 부산에서 잃어버린긴 했는데...", sent: false }

        ]
      });
      dailyChats.push({
        name: "부산 여행",
        isGroup: true,
        users: [
          this.users["박서아"],
          this.users["최지안"],
          this.users["정수진"],
          this.users["이서준"],
          this.users["강하은"]
        ],
        memberNames: ["박서아", "최지안", "정수진", "이서준", "강하은"],
        active: false,
        unread: false,
        seen: true,
        time: "오늘",
        messages: [
          { separator: "5일 전" },
          { text: "얘들아 미안해 ㅠㅠ 진짜진짜 급한 일이 있다고 부모님이 불러서 바로 집에 가봐야할 것 같아 ㅠㅠ", sender: "박서아", user: this.users["박서아"] },
          { text: "???", sender: "이서준", user: this.users["이서준"] },
          { text: "무슨일인데?", sender: "최지안", user: this.users["최지안"] },
          { text: "너 짐은 어떻게 해?", sender: "최지안", user: this.users["최지안"] },

          { separator: "3일 전" },
          { text: "혹시 서아랑 연락 되는 사람 없어?", sender: "이서준", user: this.users["이서준"] },
          { text: "어제 이후로 계속 연락을 안받아...", sender: "이서준", user: this.users["이서준"] },
          { text: "원래 서아 연락 잘 안보지 않아?", sender: "강하은", user: this.users["강하은"] },
          { text: "급한 일 있으면 하루 정도는 자주 안보긴 하는데... 불안해서...", sender: "이서준", user: this.users["이서준"] },
          { text: "혹시 저녁에 살인사건 기사 뜬 거 봤어?", sender: "최지안", user: this.users["최지안"] },
          { text: "이거 서아 아니겠지?", sender: "최지안", user: this.users["최지안"] },
          { text: "설마", sender: "이서준", user: this.users["이서준"] },
          { text: "수진아 너 서아 부모님 연락처 알지", sender: "이서준", user: this.users["이서준"] },
          { text: "ㅂ빨리 ㅇ연락드려봐", sender: "이서준", user: this.users["이서준"] },
          { text: "방금 서아 부모님께 연락 드렸는데... 맞대", sender: "정수진", user: this.users["정수진"] },

          { separator: "어제" },
          { text: "서준이 너", sender: "최지안", user: this.users["최지안"] },
          { text: "스토리 우리 보라고 올린거야?", sender: "최지안", user: this.users["최지안"] },
          { text: "ㅇ", sender: "이서준", user: this.users["이서준"] },
          { text: "이렇게 공개적으로 하는건 아니지 않아?", sender: "최지안", user: this.users["최지안"] },
          { text: "서아가 그렇게 된지 얼마나 됐다고", sender: "이서준", user: this.users["이서준"] },
          { text: "보란듯이 놀러다는걸 올려?", sender: "이서준", user: this.users["이서준"] },
          { text: "연쇄살인 기사도 봤지?", sender: "이서준", user: this.users["이서준"] },
          { text: "너가 간 동네, 다 거기 나오던데?", sender: "이서준", user: this.users["이서준"] },
          { text: "나 진짜 이상한 생각 들어", sender: "이서준", user: this.users["이서준"] },
          { text: "서준아. 진정해", sender: "강하은", user: this.users["강하은"] },
          { text: "서아도 너가 이러길 원하지 않을거야.", sender: "강하은", user: this.users["강하은"] },
          { text: "내일 서아 가는 길인데 편하게 보내줘야지.", sender: "강하은", user: this.users["강하은"] },

          { separator: "오늘" }
        ]
      });

      

      dailyChats.push({
        name: "정수진",
        user: this.users["정수진"],
        avatarColor: [255, 140, 180],
        active: false,
        unread: false,
        seen: true,
        time: "오늘",
        messages: [
          { separator: "오늘" },
          { text: "나도 에어팟을 사야하나...", sent: true },
          { text: "너 부산 갔을 때 쓰던 줄 이어폰 있지 않아?", sent: false },
          { text: "깜짝파티 준비하다가 잃어버렸나봐... 어디갔는지를 모르겠어", sent: true }
        ]
      });

      dailyChats.push({
        name: "last.frame_",
        user: this.users["부계"],
        avatarColor: [120, 90, 200],
        active: false,
        unread: false,
        seen: true,
        time: "어제",
        messages: [
          { separator: "4일전" },
          { text: "ㅋㅋㅋ", sent: false },
          { text: "너 누구야", sent: true },

          { separator: "어제" },
          { text: "곧 알게될 걸 ???", sent: false }
        ]
      });



      dailyChats.push({
        name: "최지안",
        user: this.users["최지안"],
        avatarColor: [90, 180, 180],
        active: false,
        unread: false,
        seen: true,
        time: "어제",
        messages: [
          { separator: "6일전" },
          { text: "야 너가 그 때 알려준 거 뭐였지?", sent: false },
          { text: "ㄱㄷ 내가 정리해놓은거 보내줄게", sent: true },
          { text: "게시물을 확인할 수 없습니다", sent: true },

          { separator: "어제" },
          { text: "아니", sent: false },
          { text: "맛집은 너가 알려준 거잖아", sent: false },
          { text: "서준이한테 뭐라고 해봐", sent: false },
          { text: "서준이도 많이 힘들어서 그럴거야", sent: true },
          { text: "어쩔수 없어", sent: true },
          { text: "장례식 가서 위로나 해주자", sent: true }
        ]
      });

      dailyChats.push({
        name: "지안이 깜짝생파 준비",
        isGroup: true,
        users: [
          this.users["박서아"],
          this.users["정수진"],
          this.users["이서준"],
          this.users["강하은"]
        ],
        memberNames: ["박서아", "정수진", "이서준", "강하은"],
        active: false,
        unread: false,
        seen: true,
        time: "5일전",
        messages: [
          { separator: "5일전" },
          { text: "그러면 각자 흩어져서 준비한대로 ㄱㄱ", sender: "이서준", user: this.users["이서준"] },
          { text: "6시에 시작하면 되는거지 ???" },
          { text: "ㅇㅇㅇ", sender: "이서준", user: this.users["이서준"] },
          { text: "아니 서아 얘는 어디갔어", sender: "이서준", user: this.users["이서준"] }
        ]
      });
    }

    // ================= [ 0일차 (루프) ] =================
    else if (this.currentDay === 0) {
      dailyStories.push(new Story(this.users["부계"], accountX0, "", "default", "아까 부계정으로 올린 스토리... 잘 올라갔네"));

            dailyStories.push(new Story(this.users["박서아"], seoah1));
            dailyStories.push(new Story(this.users["박서아"], seoah2));
            dailyStories.push(new Story(this.users["박서아"], seoah3));
            dailyStories.push(new Story(this.users["박서아"], seoah4));
            dailyStories.push(new Story(this.users["박서아"], seoah5));
            dailyStories.push(new Story(this.users["박서아"], seoah6));

      dailyPosts.push(new Post(this.users["daily_news"], "서울특별시", "아이돌 그룹 루미에, 정규 2집 컴백 예고", 178, color(20), news6));


      dailyChats.push({
        name: "박서아", user: this.users["박서아"], avatarColor: [255, 180, 100], active: false, unread: true, seen: false, time: "오늘",
        messages: [
          { separator: "오늘" },
          { text: "서아야. 나 좀만 도와줘", sent: true },
          { text: "이게 잘 안되는데 너가 제일 가까움 ㅠㅠ", sent: true },
          { text: "엉!", sent: false },
          { text: "어딘데?", sent: false },
{ text: "▶영상 보기", sent: true, video: "endingVideo1" }        ]
      });


      dailyChats.push({
        name: "지안이 깜짝생파 준비",
        isGroup: true,
        users: [
          this.users["박서아"],
          this.users["정수진"],
          this.users["이서준"],
          this.users["강하은"]
        ],
        memberNames: ["박서아", "정수진", "이서준", "강하은"],
        active: false,
        unread: false,
        seen: true,
        time: "오늘",
        messages: [
          { separator: "오늘" },
          { text: "그러면 각자 흩어져서 준비한대로 ㄱㄱ", sender: "이서준", user: this.users["이서준"] },
          { text: "6시에 시작하면 되는거지 ???" },
          { text: "ㅇㅇㅇ", sender: "이서준", user: this.users["이서준"] },
          { text: "아니 서아 얘는 어디갔어", sender: "이서준", user: this.users["이서준"] }
        ]
      });

      dailyChats.push({
        name: "최지안", user: this.users["최지안"], avatarColor: [90, 180, 180], active: false, unread: false, seen: true, time: "3일전",
        messages: [
          { separator: "3일전" },
          { text: "야 너가 그 때 알려준 거 뭐였지?", sent: false },
          { text: "ㄱㄷ 내가 정리해놓은거 보내줄게", sent: true },
          { text: "게시물을 확인할 수 없습니다", sent: true }
        ]
      });

      dailyChats.push({
        name: "강하은", user: this.users["강하은"], avatarColor: [100, 100, 255], active: false, unread: false, seen: true, time: "4일전",
        messages: [
          { separator: "4일전" },
          { text: "저번에 말했던 건 좀 괜찮아?", sent: false },
          { text: "요즘은 좀 덜한거같은데... 여행 간 동안은 안그러겠지 ???", sent: true },
          { text: "괜찮아", sent: false },
          { text: "혹시 무슨 일 있으면 내가 막아줄게", sent: false }
        ]
      });
    }

    // 데이터 전달 (채팅은 instagramDM.js 쪽으로 넘김)
    if (typeof phone !== 'undefined' && phone.instagram) {
      phone.instagram.loadData(dailyStories, dailyPosts);
      phone.instagram.dm.loadChatData(dailyChats);
    }
  }

advanceDay() {
  this.currentDay++;

  // 4일차 이후 일반 날짜 전환은 바로 0일차로 이동.
  if (this.currentDay > 4) {
    this.currentDay = 0;
  }

  this.day4StoryUploadUnlocked = false;
  this.day4StoryUploadReady = false;
  this.day4StoryUploadHintPlayed = false;
  this.storyUploadResolved = false;
  this.uploadedToday = false;
  this.accusedSuspect = null;
  this.accuseResult = null;
  this.taggedTarget = null;
  this.taggedHandle = null;
  this.storyUploadResult = null;

  this.loadDailyData();

  if (typeof bgmManager !== "undefined" && bgmManager) {
    bgmManager.playForDay(this.currentDay);
  }

  if (typeof startDayTransition === "function") {
    startDayTransition(this.currentDay);
  }
}
}
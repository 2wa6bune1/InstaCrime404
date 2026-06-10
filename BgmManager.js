// ======================================================
// BgmManager.js
// ======================================================
class BgmManager {
  constructor() {
    this.bgmA = null;
    this.bgmB = null;
    this.currentBgmType = null;
  }

  preload() {
    this.bgmA = loadSound("Don’t_Look_Back- 전체 bgm.mp3");
    this.bgmB = loadSound("Found_you - 0일차.mp3");
  }

  playForDay(day) {
    // 1~4일차: A 음악 유지
    if (day >= 1 && day <= 4) {
      this.playA();
      return;
    }

    // 0일차: B 음악
    if (day === 0) {
      this.playB();
      return;
    }

    // 그 외 날짜는 음악 정지
    this.stopAll();
  }

  playA() {
    // 이미 A가 재생 중이면 다시 시작하지 않음
    if (this.currentBgmType === "A") return;

    this.stopAll();

    if (this.bgmA) {
      this.bgmA.setLoop(true);
      this.bgmA.setVolume(0.5);
      this.bgmA.play();
      this.currentBgmType = "A";
    }
  }

  playB() {
    // 이미 B가 재생 중이면 다시 시작하지 않음
    if (this.currentBgmType === "B") return;

    this.stopAll();

    if (this.bgmB) {
      this.bgmB.setLoop(true);
      this.bgmB.setVolume(0.5);
      this.bgmB.play();
      this.currentBgmType = "B";
    }
  }

  stopAll() {
    if (this.bgmA && this.bgmA.isPlaying()) {
      this.bgmA.stop();
    }

    if (this.bgmB && this.bgmB.isPlaying()) {
      this.bgmB.stop();
    }

    this.currentBgmType = null;
  }
}
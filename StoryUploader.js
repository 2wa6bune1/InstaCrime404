// ======================================================
// StoryUploader.js
// ======================================================
class StoryUploader {
  constructor(instagramUI) {
    this.instagramUI = instagramUI;
    this.fileInput = createFileInput(this.handleFile.bind(this));
    this.fileInput.hide();
    this.isUploading = false;
  }

  open() {
    this.fileInput.elt.click();
  }

  handleFile(file) {
    if (!file) return;

    if (file.type !== "image") {
      console.log("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    this.isUploading = true;

    loadImage(
      file.data,
      img => {
        this.instagramUI.addMyStory(img);
        this.isUploading = false;
        console.log("스토리 업로드 완료");
      },
      err => {
        console.log("이미지 로딩 실패:", err);
        this.isUploading = false;
      }
    );
  }
}
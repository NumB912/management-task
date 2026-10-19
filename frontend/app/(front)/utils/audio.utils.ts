export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;

  constructor(private src: string) {}

  private ensureAudio() {
    if (typeof window === "undefined") return null;
    if (!this.audio) this.audio = new Audio(this.src);
    return this.audio;
  }

  play() {
    const a = this.ensureAudio();
    if (!a) return;
    a.currentTime = 0;
    a.play().catch((err) => console.warn("Không phát được audio:", err));
  }

  stop() {
    if (!this.audio) return;
    this.audio.pause();
    this.audio.currentTime = 0;
  }
}
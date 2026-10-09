// Audio analyser for active speaker detection & microphone level visualization
export class StreamAudioAnalyser {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private animFrameId: number | null = null;
  private isDestroyed = false;

  constructor(
    private stream: MediaStream,
    private onLevelUpdate: (level: number, isSpeaking: boolean) => void
  ) {
    this.init();
  }

  private init() {
    try {
      const audioTracks = this.stream.getAudioTracks();
      if (!audioTracks.length || !audioTracks[0].enabled) {
        return;
      }

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioCtx = new AudioCtx();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.4;

      this.source = this.audioCtx.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (this.isDestroyed || !this.analyser) return;

        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        const isSpeaking = normalized > 12;

        this.onLevelUpdate(normalized, isSpeaking);

        this.animFrameId = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch {
      // AudioContext could fail or be blocked
    }
  }

  destroy() {
    this.isDestroyed = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
  }
}

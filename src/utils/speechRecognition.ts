// Web Speech API wrapper for Google Meet Live Captions (CC)
export class LiveSpeechRecognizer {
  private recognition: any = null;
  private isListening: boolean = false;
  private onTranscriptCallback: (text: string, isFinal: boolean) => void;

  constructor(onTranscript: (text: string, isFinal: boolean) => void) {
    this.onTranscriptCallback = onTranscript;
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser environment.');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript.trim()) {
          this.onTranscriptCallback(finalTranscript.trim(), true);
        } else if (interimTranscript.trim()) {
          this.onTranscriptCallback(interimTranscript.trim(), false);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') return;
        console.warn('Speech recognition error:', event.error);
      };

      this.recognition.onend = () => {
        // Auto-restart if still enabled
        if (this.isListening && this.recognition) {
          try {
            this.recognition.start();
          } catch {
            // ignore
          }
        }
      };
    } catch (e) {
      console.warn('Could not initialize SpeechRecognition', e);
    }
  }

  public start() {
    if (!this.recognition || this.isListening) return;
    try {
      this.isListening = true;
      this.recognition.start();
    } catch (e) {
      console.warn('SpeechRecognition start failed', e);
    }
  }

  public stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' &&
      !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }
}

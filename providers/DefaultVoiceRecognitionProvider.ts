import { VoiceRecognitionProvider } from "../types";

export class DefaultVoiceRecognitionProvider implements VoiceRecognitionProvider {
  private recognition: any = null;
  private isListening: boolean = false;

  private getSpeechRecognitionClass() {
    if (typeof window === "undefined") return null;
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  }

  isSupported(): boolean {
    return this.getSpeechRecognitionClass() !== null;
  }

  start(lang: string, onResult: (text: string) => void, onEnd: () => void, onError: (err: any) => void): void {
    if (this.isListening) return;

    const SpeechRecognition = this.getSpeechRecognitionClass();
    if (!SpeechRecognition) {
      onError(new Error("Speech Recognition API is not supported in this browser."));
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = lang;

      this.recognition.onresult = (event: any) => {
        const lastIndex = event.results.length - 1;
        const command = event.results[lastIndex][0].transcript.trim();
        if (command) {
          onResult(command);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
          this.isListening = false;
        }
        onError(event);
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition?.start();
          } catch (e) {
            onEnd();
          }
        } else {
          onEnd();
        }
      };

      this.isListening = true;
      this.recognition.start();
    } catch (e) {
      this.isListening = false;
      onError(e);
    }
  }

  stop(): void {
    this.isListening = false;
    if (this.recognition) {
      this.recognition.onend = null;
      this.recognition.onerror = null;
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  abort(): void {
    this.isListening = false;
    if (this.recognition) {
      this.recognition.onend = null;
      this.recognition.onerror = null;
      try {
        this.recognition.abort();
      } catch (e) {}
    }
  }
}

import { TTSProvider } from "../types";

export class DefaultTTSProvider implements TTSProvider {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== "undefined") {
      this.synth = window.speechSynthesis;
      if (this.synth) {
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  speak(text: string, lang: string): void {
    if (!this.synth || text.trim() === "") return;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = lang === "auto" ? (document.documentElement.lang || "en-US") : lang;

    let selectedVoice = this.voices.find(v => v.lang.startsWith(langCode));
    if (!selectedVoice) {
      selectedVoice = this.voices.find(v => v.lang.startsWith(langCode.split("-")[0]));
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = langCode;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    this.synth.speak(utterance);
  }

  stop(): void {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
  }
}

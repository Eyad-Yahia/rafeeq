import { useEffect, useMemo, useCallback } from "react";
import { isExcluded } from "../utils/dom";
import { TTSProvider } from "../types";
import { DefaultTTSProvider } from "../providers/DefaultTTSProvider";

export function useScreenReader(
  isEnabled: boolean,
  excludeSelectors: string[],
  voiceLanguage: string,
  ttsProvider?: TTSProvider
) {
  const provider = useMemo(() => {
    return ttsProvider || new DefaultTTSProvider();
  }, [ttsProvider]);

  const speakText = useCallback((text: string) => {
    if (text.trim() === "") return;
    provider.speak(text, voiceLanguage);
  }, [provider, voiceLanguage]);

  const stopSpeaking = useCallback(() => {
    provider.stop();
  }, [provider]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (!isEnabled) return;
      const selectedText = window.getSelection()?.toString();
      if (selectedText) speakText(selectedText);
    };

    const handleClick = (e: MouseEvent) => {
      if (!isEnabled) return;
      const selectedText = window.getSelection()?.toString();
      if (selectedText && selectedText.trim() !== "") return;

      const target = e.target as HTMLElement;
      if (!target || isExcluded(target, excludeSelectors)) return;

      let text = "";
      const textTags = ['P', 'SPAN', 'A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BUTTON', 'LABEL', 'STRONG', 'EM', 'B', 'I'];

      if (textTags.includes(target.tagName)) {
        text = target.innerText || target.getAttribute("aria-label") || "";
      } else if (target.tagName === 'IMG') {
        text = target.getAttribute("alt") || target.getAttribute("aria-label") || "Image without description";
      } else {
        const inner = target.innerText || "";
        if (inner.length < 150) text = inner;
      }

      const cleanedText = text.replace(/\s+/g, ' ').trim();
      if (cleanedText) speakText(cleanedText);
    };

    if (isEnabled) {
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("click", handleClick);
    }
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("click", handleClick);
      stopSpeaking();
    };
  }, [isEnabled, speakText, stopSpeaking, excludeSelectors]);

  return { speakText, stopSpeaking };
}

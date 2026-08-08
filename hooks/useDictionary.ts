import { useState, useEffect, useRef } from "react";
import { DictionaryProvider, Translations } from "../types";

export interface TooltipState {
  text: string;
  x: number;
  y: number;
  loading: boolean;
}

export function useDictionary(
  dictionaryMode: boolean,
  dictionaryProvider: DictionaryProvider | undefined,
  t: Translations,
  aiLanguage: string
) {
  const [dictionaryTooltip, setDictionaryTooltip] = useState<TooltipState | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!dictionaryMode || !dictionaryProvider) {
      setDictionaryTooltip(null);
      return;
    }
    const handleMouseUp = async (e: MouseEvent) => {
      const text = window.getSelection()?.toString().trim();
      if (text && text.length > 2 && text.length < 100) {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setDictionaryTooltip({ text: t.loading, x: e.pageX, y: e.pageY + 20, loading: true });
        try {
          const langCode = aiLanguage === "auto" ? (document.documentElement.lang || "en") : aiLanguage;
          // Notice: Currently the Provider interface `explainText` doesn't take an AbortSignal,
          // but we can at least drop the result if aborted.
          const explanationStr = await dictionaryProvider.explainText(text, langCode);
          if (!abortController.signal.aborted) {
            setDictionaryTooltip({ text: explanationStr, x: e.pageX, y: e.pageY + 20, loading: false });
          }
        } catch {
          if (!abortController.signal.aborted) {
            setDictionaryTooltip({ text: t.dictionaryFailed, x: e.pageX, y: e.pageY + 20, loading: false });
          }
        }
      } else {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        setDictionaryTooltip(null);
      }
    };
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [dictionaryMode, dictionaryProvider, t.loading, t.dictionaryFailed, aiLanguage]);

  return { dictionaryTooltip, setDictionaryTooltip };
}

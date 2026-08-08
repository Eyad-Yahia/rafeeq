import { useEffect, useRef, useMemo } from "react";
import { AIProvider, VoiceRecognitionProvider, Translations } from "../types";
import { getPageContext } from "../utils/dom";
import { DefaultVoiceRecognitionProvider } from "../providers/DefaultVoiceRecognitionProvider";

export function useVoiceControl(
  voiceControl: boolean,
  setVoiceControl: (v: boolean) => void,
  aiProvider: AIProvider | undefined,
  voiceRecognitionProvider: VoiceRecognitionProvider | undefined,
  voiceLanguage: string,
  aiLanguage: string,
  excludeSelectors: string[],
  redactSelectors: string[],
  t: Translations,
  showExplanation: (text: string | null) => void,
  speakText: (text: string) => void,
  executeVoiceAction: (intent: string, target: string) => void
) {
  // Use provided provider or fallback to default
  const provider = useMemo(() => {
    return voiceRecognitionProvider || new DefaultVoiceRecognitionProvider();
  }, [voiceRecognitionProvider]);

  const depsRef = useRef({
    aiProvider,
    voiceLanguage,
    aiLanguage,
    excludeSelectors,
    redactSelectors,
    t,
    showExplanation,
    speakText,
    executeVoiceAction,
    setVoiceControl
  });
  depsRef.current = {
    aiProvider,
    voiceLanguage,
    aiLanguage,
    excludeSelectors,
    redactSelectors,
    t,
    showExplanation,
    speakText,
    executeVoiceAction,
    setVoiceControl
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!provider.isSupported()) {
      if (voiceControl) {
        depsRef.current.setVoiceControl(false);
        depsRef.current.showExplanation(depsRef.current.t.speechNotSupported);
      }
      return;
    }

    // Guard: do not start microphone if no AI provider is configured.
    // Voice control requires an AI provider to parse commands.
    if (!depsRef.current.aiProvider) {
      if (voiceControl) {
        depsRef.current.setVoiceControl(false);
      }
      return;
    }

    if (voiceControl) {
      const bcp47 = depsRef.current.voiceLanguage === "auto" ? (document.documentElement.lang || "en-US") : depsRef.current.voiceLanguage;
      const aiLang = depsRef.current.aiLanguage === "auto" ? (document.documentElement.lang || "en") : depsRef.current.aiLanguage;
      let abortController: AbortController | null = null;

      const handleResult = async (command: string) => {
        const deps = depsRef.current;
        deps.showExplanation(`${deps.t.heardCommand} "${command}"`);

        if (abortController) abortController.abort();
        const currentAbort = new AbortController();
        abortController = currentAbort;

        if (deps.aiProvider) {
          const context = getPageContext(deps.excludeSelectors, deps.redactSelectors);
          try {
            const parsedResponse = await deps.aiProvider.parseCommand(command, context, aiLang);
            if (!currentAbort.signal.aborted && parsedResponse && Array.isArray(parsedResponse.actions)) {
              if (parsedResponse.reply) {
                deps.showExplanation(parsedResponse.reply);
                deps.speakText(parsedResponse.reply);
              }
              
              parsedResponse.actions.forEach(a => {
                if (a && typeof a === 'object' && typeof a.intent === 'string' && typeof a.target === 'string') {
                  deps.executeVoiceAction(a.intent, a.target);
                } else {
                  console.warn("Accessibility Widget: Ignored invalid AI action", a);
                }
              });
            }
          } catch (e) {
            if (!currentAbort.signal.aborted) {
              console.error("AI Provider error:", e);
            }
          }
        }
      };

      const handleEnd = () => {
        // Handled internally by the provider's continuous loop if needed
      };

      const handleError = (e: any) => {
        if (e && (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture')) {
          depsRef.current.setVoiceControl(false);
          depsRef.current.showExplanation("Microphone access denied or unavailable.");
        }
      };

      provider.start(bcp47, handleResult, handleEnd, handleError);
      depsRef.current.showExplanation(depsRef.current.t.voiceCommandsActive);
    } else {
      provider.abort();
    }

    return () => {
      provider.abort();
    };
  }, [voiceControl, provider]);
}

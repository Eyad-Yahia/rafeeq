"use client";
import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from "react";
import { useLatestRef } from "./hooks/useLatestRef";
import { useAutoScroll } from "./hooks/useAutoScroll";
import { useScreenReader } from "./hooks/useScreenReader";
import { useAccessibilitySettings } from "./hooks/useAccessibilitySettings";
import { useThemeSync } from "./hooks/useThemeSync";
import { useDictionary, TooltipState } from "./hooks/useDictionary";
import { useVoiceControl } from "./hooks/useVoiceControl";
import { deepMerge } from "./utils/deepMerge";
import { isSafeRedirect } from "./utils/security";
import { getActiveScrollContainer, getPageContext, normalizeText, isExcluded } from "./utils/dom";
import { AccessibilityWidgetProps, Translations, AIProvider, TTSProvider, DictionaryProvider, AIIntent, AITarget } from "./types";
import { DEFAULT_TRANSLATIONS } from "./constants/translations";
import { defaultPlugins } from "./plugins/defaultPlugins";

import { calculateProfileTransition } from "./profiles/ProfileEngine";
import { AccessibilityProfile } from "./types";

export interface AccessibilityState extends ReturnType<typeof useAccessibilitySettings> {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;

  isDarkMode: boolean;
  toggleTheme: () => void;
  resetAll: () => void;

  dictionaryTooltip: TooltipState | null;
  setDictionaryTooltip: React.Dispatch<React.SetStateAction<TooltipState | null>>;

  explanation: string | null;
  showExplanation: (text: string | null) => void;

  dictionaryMode: boolean;
  setDictionaryMode: React.Dispatch<React.SetStateAction<boolean>>;
  screenReader: boolean;
  setScreenReader: React.Dispatch<React.SetStateAction<boolean>>;
  voiceControl: boolean;
  setVoiceControl: React.Dispatch<React.SetStateAction<boolean>>;
  lineHeight: number;
  setLineHeight: React.Dispatch<React.SetStateAction<number>>;
  letterSpacing: number;
  setLetterSpacing: React.Dispatch<React.SetStateAction<number>>;
  wordSpacing: number;
  setWordSpacing: React.Dispatch<React.SetStateAction<number>>;

  t: Translations;
  isRTL: boolean;
  hasAIProvider: boolean;
  hasDictionaryProvider: boolean;
  setProfile: (profile: AccessibilityProfile | null) => void;
}

/**
 * Context holding the entire state and functions for the Accessibility Widget.
 */
export const AccessibilityContext = createContext<AccessibilityState | null>(null);

/**
 * Hook to access the accessibility state and controls.
 * Must be used within an AccessibilityProvider.
 * @returns The current accessibility state and control functions.
 */
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
};

/**
 * Provides accessibility state to the widget and child components.
 * Manages core logic like theme sync, AI integration, and state persistence.
 * 
 * @param props - Configuration properties including providers and custom settings.
 */
const DEFAULT_SCROLL_SELECTORS = ['div.overflow-y-auto', '[data-lenis-prevent="true"]', '.overflow-y-scroll'];
const DEFAULT_EXCLUDE_SELECTORS = ['.acc-modal'];
const DEFAULT_REDACT_SELECTORS = ['input[type="password"]', '[data-private]', '.private-info'];

export const AccessibilityProvider = ({
  children,
  isDarkMode: externalIsDarkMode,
  onThemeChange,
  scrollContainerSelectors = DEFAULT_SCROLL_SELECTORS,
  excludeSelectors = DEFAULT_EXCLUDE_SELECTORS,
  redactSelectors = DEFAULT_REDACT_SELECTORS,
  voiceLanguage = "auto",
  aiLanguage = "auto",
  direction = "auto",
  translations: customTranslations,
  aiProvider: providedAiProvider,
  ttsProvider,
  dictionaryProvider: providedDictionaryProvider,
  voiceRecognitionProvider,
  plugins,
  confirmNavigation = true,
  onAction,
  persistKey,
}: AccessibilityWidgetProps & { children: ReactNode }) => {
  const aiProvider = providedAiProvider;
  const dictionaryProvider = providedDictionaryProvider;
  const t = useMemo(() => deepMerge(DEFAULT_TRANSLATIONS, customTranslations || {}), [customTranslations]);

  const [isOpen, setIsOpen] = useState(false);
  const [dictionaryMode, setDictionaryMode] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [voiceControl, setVoiceControl] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);

  const [isRTL, setIsRTL] = useState(false);

  const safeOnAction = useCallback((id: string, val?: string | number | boolean | null) => {
    if (!onAction) return;
    try { onAction(id, val); } catch (e) { console.error('Analytics error:', e); }
  }, [onAction]);

  React.useEffect(() => {
    if (direction === "auto") {
      setIsRTL(document.documentElement.dir === "rtl" || document.documentElement.lang.startsWith("ar"));
    } else {
      setIsRTL(direction === "rtl");
    }
  }, [direction]);

  const showExplanation = useCallback((text: string | null) => setExplanation(text), []);

  const settings = useAccessibilitySettings(persistKey);
  const { isDarkMode, toggleTheme, resetTheme } = useThemeSync(externalIsDarkMode, onThemeChange);
  const { dictionaryTooltip, setDictionaryTooltip } = useDictionary(dictionaryMode, dictionaryProvider, t, aiLanguage);

  const { startAutoScroll, stopAutoScroll } = useAutoScroll(scrollContainerSelectors, excludeSelectors);
  const { speakText, stopSpeaking } = useScreenReader(screenReader, excludeSelectors, voiceLanguage, ttsProvider);

  const deps = useLatestRef({
    isDarkMode, stopAutoScroll, startAutoScroll, toggleTheme, resetTheme, showExplanation, settings, t,
    plugins, isOpen, setIsOpen, dictionaryTooltip, setDictionaryTooltip, explanation, dictionaryMode,
    setDictionaryMode, screenReader, setScreenReader, voiceControl, setVoiceControl, isRTL,
    confirmNavigation, speakText, stopSpeaking,
    hasAIProvider: !!aiProvider, hasDictionaryProvider: !!dictionaryProvider, safeOnAction
  });

  const toggleThemeStable = useCallback(() => {
    deps.current.toggleTheme();
  }, [deps]);

  const resetAll = useCallback(() => {
    const currentDeps = deps.current;
    currentDeps.stopAutoScroll();
    currentDeps.settings.setTextSize(100);
    currentDeps.settings.setDyslexiaFont(false);
    currentDeps.settings.setLegibleFont(false);
    currentDeps.settings.setHighlightLinks(false);
    currentDeps.settings.setHighlightHeaders(false);
    currentDeps.settings.setTextMagnifier(false);
    currentDeps.settings.setContrast("default");
    currentDeps.settings.setSaturation("default");
    currentDeps.settings.setReadingRuler(false);
    currentDeps.settings.setReadingMaskType("none");
    currentDeps.settings.setFocusRing(false);
    currentDeps.settings.setPauseAnimations(false);
    currentDeps.settings.setHideImages(false);
    currentDeps.settings.setMuteMedia(false);
    currentDeps.settings.setLineHeight(0);
    currentDeps.settings.setLetterSpacing(0);
    currentDeps.settings.setWordSpacing(0);

    currentDeps.setDictionaryMode(false);
    currentDeps.setScreenReader(false);
    currentDeps.setVoiceControl(false);
    currentDeps.settings.setActiveProfile(null);
    currentDeps.settings.setProfileSnapshot(null);
    currentDeps.resetTheme();
    currentDeps.stopSpeaking();
  }, [deps]);

  const setProfile = useCallback((profile: AccessibilityProfile | null) => {
    const currentDeps = deps.current;

    const fullState = {
      ...currentDeps.settings,
      dictionaryMode: currentDeps.dictionaryMode,
      screenReader: currentDeps.screenReader,
      voiceControl: currentDeps.voiceControl,
    };

    // Read directly from the synchronous ref to avoid stale closures in rapid switching
    const { newState, newSnapshot } = calculateProfileTransition(profile, fullState, currentDeps.settings.profileSnapshotRef.current);

    if (newState.textSize !== undefined) currentDeps.settings.setTextSize(newState.textSize);
    if (newState.dyslexiaFont !== undefined) currentDeps.settings.setDyslexiaFont(newState.dyslexiaFont);
    if (newState.legibleFont !== undefined) currentDeps.settings.setLegibleFont(newState.legibleFont);
    if (newState.highlightLinks !== undefined) currentDeps.settings.setHighlightLinks(newState.highlightLinks);
    if (newState.highlightHeaders !== undefined) currentDeps.settings.setHighlightHeaders(newState.highlightHeaders);
    if (newState.textMagnifier !== undefined) currentDeps.settings.setTextMagnifier(newState.textMagnifier);
    if (newState.contrast !== undefined) currentDeps.settings.setContrast(newState.contrast);
    if (newState.saturation !== undefined) currentDeps.settings.setSaturation(newState.saturation);
    if (newState.readingRuler !== undefined) currentDeps.settings.setReadingRuler(newState.readingRuler);
    if (newState.readingMaskType !== undefined) currentDeps.settings.setReadingMaskType(newState.readingMaskType);
    if (newState.focusRing !== undefined) currentDeps.settings.setFocusRing(newState.focusRing);
    if (newState.pauseAnimations !== undefined) currentDeps.settings.setPauseAnimations(newState.pauseAnimations);
    if (newState.hideImages !== undefined) currentDeps.settings.setHideImages(newState.hideImages);
    if (newState.muteMedia !== undefined) currentDeps.settings.setMuteMedia(newState.muteMedia);
    if (newState.lineHeight !== undefined) currentDeps.settings.setLineHeight(newState.lineHeight);
    if (newState.letterSpacing !== undefined) currentDeps.settings.setLetterSpacing(newState.letterSpacing);
    if (newState.wordSpacing !== undefined) currentDeps.settings.setWordSpacing(newState.wordSpacing);

    if (newState.dictionaryMode !== undefined) currentDeps.setDictionaryMode(newState.dictionaryMode);
    if (newState.screenReader !== undefined) currentDeps.setScreenReader(newState.screenReader);
    if (newState.voiceControl !== undefined) currentDeps.setVoiceControl(newState.voiceControl);

    currentDeps.settings.setProfileSnapshot(newSnapshot);
    currentDeps.settings.setActiveProfile(profile ? profile.id : null);
    currentDeps.safeOnAction('profile_changed', profile ? profile.id : null);
  }, [deps]);

  const executeVoiceAction = useCallback((rawIntent: string, rawTarget: string) => {
    const d = deps.current;
    const intent = rawIntent as AIIntent;
    const target = rawTarget as AITarget;

    d.safeOnAction('voice_executed', `${intent}:${target}`);

    if (intent !== "scroll_down" && intent !== "scroll_up") d.stopAutoScroll();

    if (["scroll_stop", "scroll_down", "scroll_up", "scroll_top", "scroll_bottom"].includes(intent as string)) {
      if (intent === "scroll_stop") d.stopAutoScroll();
      else if (intent === "scroll_down") d.startAutoScroll(2);
      else if (intent === "scroll_up") d.startAutoScroll(-2);
      return;
    }

    if (intent === "navigate") {
      try {
        if (target === "footer") document.querySelector("footer")?.scrollIntoView({ behavior: "smooth" });
        else if (target === "back") window.history.back();
        else if (target === "forward") window.history.forward();
        else if (target === "reload") window.location.reload();
        else if ((target as string).startsWith("#") || (target as string).startsWith(".")) {
          document.querySelector(target as string)?.scrollIntoView({ behavior: "smooth" });
        }
        else {
          if (isSafeRedirect(target as string)) {
            if (d.confirmNavigation) {
              d.speakText(d.t.confirmNavigationTitle);
              if (window.confirm(d.t.confirmNavigationMessage.replace("{{target}}", target as string))) {
                window.location.href = target as string;
              }
            } else {
              window.location.href = target as string;
            }
          }
          else d.showExplanation(d.t.securityBlockRedirect);
        }
      } catch (e) {
        d.showExplanation(d.t.invalidNavigationTarget);
      }
      return;
    }

    const stateSnapshot: AccessibilityState = {
      ...d.settings, isOpen: d.isOpen, setIsOpen: d.setIsOpen, isDarkMode: d.isDarkMode,
      toggleTheme: toggleThemeStable, resetAll,
      dictionaryTooltip: d.dictionaryTooltip, setDictionaryTooltip: d.setDictionaryTooltip,
      explanation: d.explanation, showExplanation: d.showExplanation, dictionaryMode: d.dictionaryMode,
      setDictionaryMode: d.setDictionaryMode, screenReader: d.screenReader, setScreenReader: d.setScreenReader,
      voiceControl: d.voiceControl, setVoiceControl: d.setVoiceControl, t: d.t, isRTL: d.isRTL,
      hasAIProvider: d.hasAIProvider, hasDictionaryProvider: d.hasDictionaryProvider, setProfile
    };

    const currentPlugins = d.plugins ? d.plugins(stateSnapshot) : defaultPlugins;
    const plugin = currentPlugins.find(p => p.aiIntent === intent && p.aiTarget === target);
    if (plugin) {
      plugin.action(stateSnapshot);
      return;
    }

    if (intent === "change_setting") {
      if (target === "reset") { resetAll(); return; }
      if (target === "open_widget") { d.setIsOpen(true); return; }
      if (target === "close_widget") { d.setIsOpen(false); return; }
      if (target === "light_mode" && d.isDarkMode) { toggleThemeStable(); return; }
      if (target === "dark_mode" && !d.isDarkMode) { toggleThemeStable(); return; }
    }

    d.showExplanation("Sorry, I didn't catch that command.");
  }, [deps, toggleThemeStable, resetAll, setProfile]);

  useVoiceControl(voiceControl, setVoiceControl, aiProvider, voiceRecognitionProvider, voiceLanguage, aiLanguage, excludeSelectors, redactSelectors, t, showExplanation, speakText, executeVoiceAction);

  const value: AccessibilityState = useMemo(() => ({
    ...settings,
    isOpen, setIsOpen,
    isDarkMode, toggleTheme: toggleThemeStable, resetAll,
    dictionaryTooltip, setDictionaryTooltip,
    explanation, showExplanation,
    dictionaryMode, setDictionaryMode,
    screenReader, setScreenReader,
    voiceControl, setVoiceControl,
    t, isRTL, hasAIProvider: !!aiProvider, hasDictionaryProvider: !!dictionaryProvider, setProfile
  }), [
    settings, isOpen, setIsOpen, isDarkMode, toggleThemeStable, resetAll,
    dictionaryTooltip, setDictionaryTooltip,
    explanation, showExplanation, dictionaryMode, setDictionaryMode,
    screenReader, setScreenReader, voiceControl, setVoiceControl,
    t, isRTL, aiProvider, dictionaryProvider, setProfile
  ]);

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
};

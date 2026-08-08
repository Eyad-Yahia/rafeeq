"use client";
export { AccessibilityWidget } from "./AccessibilityWidget";
export { AccessibilityProvider, useAccessibility } from "./AccessibilityContext";

// Export Core Types
export type { AccessibilityState } from "./AccessibilityContext";
export type { 
  AccessibilityWidgetProps, 
  Translations, 
  AccessibilityProfile,
  AccessibilityProfileSettings,
  ProfileId,
  Contrast,
  Saturation,
  ReadingMaskType,
  AccessibilityPlugin
} from "./types";

// Export Providers
export type { AIProvider, DictionaryProvider, VoiceRecognitionProvider, TTSProvider, AIIntent, AITarget, AIAction, AIParsedResponse } from "./types";
export { DefaultVoiceRecognitionProvider } from "./providers/DefaultVoiceRecognitionProvider";
export { DefaultTTSProvider } from "./providers/DefaultTTSProvider";

// Export Utilities
export { DEFAULT_TRANSLATIONS } from "./constants/translations";

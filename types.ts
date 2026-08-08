import React from 'react';

// ========================
// AI & VOICE TYPES
// ========================
export type AIIntent = 
  | "scroll_down" | "scroll_up" | "scroll_stop" | "scroll_top" | "scroll_bottom"
  | "navigate" | "change_setting" | "click_element" | "read_text" 
  | "search" | "submit" | "go_back" | "go_forward" | "refresh" 
  | (string & {});

export type AITarget = 
  | "contrast_invert" | "dark_mode" | "light_mode" | "yellow_black" | "monochrome"
  | "text_zoom_in" | "text_zoom_out" | "dyslexia_font" | "legible_font"
  | "reading_ruler_toggle" | "reading_mask_toggle" | "magnifier_toggle"
  | "highlight_links" | "highlight_headers" | "focus_ring" | "keyboard_nav"
  | "dictionary_toggle" | "mute_media" | "pause_animations" | "hide_images"
  | "screen_reader_toggle" | "voice_control_toggle"
  | "reset" | "open_widget" | "close_widget" | "header" | "footer" 
  | "main_content" | "navigation_menu" | (string & {});

export type Contrast = "default" | "invert" | "light" | "yellow-black";
export type Saturation = "default" | "mono";
export type ReadingMaskType = "none" | "tint" | "rect" | "circle";

export interface AIAction {
  intent: AIIntent;
  target: AITarget;
}

export interface AIParsedResponse {
  reply?: string;
  actions: AIAction[];
}

export interface TTSProvider {
  speak: (text: string, lang: string) => void;
  stop: () => void;
}

export interface AIProvider {
  parseCommand: (command: string, context: string, lang: string) => Promise<AIParsedResponse>;
}

export interface DictionaryProvider {
  explainText: (text: string, lang: string) => Promise<string>;
}

export interface VoiceRecognitionProvider {
  start: (lang: string, onResult: (text: string) => void, onEnd: () => void, onError: (err: { error?: string } | Error | Event | unknown) => void) => void;
  stop: () => void;
  abort: () => void;
  isSupported: () => boolean;
}

// ========================
// EXTENSIBILITY TYPES
// ========================
export interface AccessibilityPlugin<T = unknown> {
  id: string;
  icon: React.ReactNode;
  title: (t: Translations) => string;
  
  // Dynamic action execution based on current state
  action: (state: T) => void;
  
  // Dynamic active check based on current state
  isActive: (state: T) => boolean;
  
  // Step indicators for multi-state features
  steps?: (state: T) => number;
  currentStep?: (state: T) => number;
  
  // AI Integration mapping
  aiIntent?: string;
  aiTarget?: string;
  
  // Future-proof badging system
  category?: "Visual" | "Navigation" | "Audio" | "AI" | (string & {});
  badge?: {
    text: string;
    variant?: "info" | "premium" | "new";
  };
  
  // Provider requirement logic to trigger modals cleanly
  requiresProvider?: "ai" | "dictionary";
}

export type DefaultProfileId = "motor" | "blind" | "colorblind" | "dyslexia" | "lowvision" | "cognitive" | "seizure" | "adhd";
export type ProfileId = DefaultProfileId | (string & {});

export interface AccessibilityProfileSettings {
  textSize?: number;
  dyslexiaFont?: boolean;
  legibleFont?: boolean;
  highlightLinks?: boolean;
  highlightHeaders?: boolean;
  textMagnifier?: boolean;
  contrast?: Contrast;
  saturation?: Saturation;
  lineHeight?: number;
  letterSpacing?: number;
  wordSpacing?: number;
  readingRuler?: boolean;
  readingMaskType?: ReadingMaskType;
  focusRing?: boolean;
  pauseAnimations?: boolean;
  hideImages?: boolean;
  muteMedia?: boolean;
  dictionaryMode?: boolean;
  screenReader?: boolean;
  voiceControl?: boolean;
}

export interface AccessibilityProfile {
  id: ProfileId;
  label: (t: Translations) => string;
  icon: React.ReactNode;
  settings: AccessibilityProfileSettings;
}

// ========================
// TRANSLATION TYPES
// ========================
export interface Translations {
  title: string;
  search: string;
  voiceCommand: string;
  voiceActive: string;
  screenReader: string;
  profiles: string;
  blindness: string;
  visuallyImpaired: string;
  dyslexia: string;
  adhd: string;
  motor: string;
  seizure: string;
  colorBlindness: string;
  visuals: string;
  darkMode: string;
  lightMode: string;
  invertColors: string;
  yellowBlack: string;
  monochrome: string;
  hideImages: string;
  textAdjust: string;
  textSize: string;
  dyslexiaFont: string;
  legibleFont: string;
  magnifier: string;
  lineHeight: string;
  letterSpacing: string;
  wordSpacing: string;
  navAdjust: string;
  muteMedia: string;
  dictionary: string;
  readingMask: string;
  readingRuler: string;
  highlightLinks: string;
  highlightHeaders: string;
  pauseAnimations: string;
  reset: string;
  close: string;
  // Previously hardcoded strings:
  loading: string;
  dictionaryFailed: string;
  speechNotSupported: string;
  focusRing: string;
  cognitive: string;
  lowVision: string;
  voiceCommandsActive: string;
  heardCommand: string;
  securityBlockRedirect: string;
  securityBlockClick: string;
  improveBrowsing: string;
  confirmNavigationTitle: string;
  confirmNavigationMessage: string;
  invalidNavigationTarget: string;
}

// ========================
// PROPS API
// ========================
export interface AccessibilityWidgetProps<T = unknown> {
  // Internationalization
  translations?: Partial<Translations>;
  direction?: "ltr" | "rtl" | "auto";
  voiceLanguage?: string;
  aiLanguage?: string;
  
  // Analytics
  onAction?: (actionId: string, value?: string | number | boolean | null) => void;

  // Providers (Dependency Injection)
  ttsProvider?: TTSProvider;
  aiProvider?: AIProvider;
  dictionaryProvider?: DictionaryProvider;
  voiceRecognitionProvider?: VoiceRecognitionProvider;
  confirmNavigation?: boolean;

  // Extensibility
  plugins?: (state: T) => AccessibilityPlugin<T>[];
  profiles?: readonly AccessibilityProfile[];
  
  // Selectors
  scrollContainerSelectors?: string[];
  excludeSelectors?: string[];
  redactSelectors?: string[];
  
  // Trigger Customization
  triggerPosition?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "middle-right" | "middle-left";
  triggerColor?: string;
  triggerSize?: "small" | "medium" | "large";
  triggerIcon?: React.ReactNode;
  
  // Branding
  showBranding?: boolean;
  
  // Theme Sync
  isDarkMode?: boolean;
  onThemeChange?: (isDark: boolean) => void;
  
  // Storage
  persistKey?: string;
}

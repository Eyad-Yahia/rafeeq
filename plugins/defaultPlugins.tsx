import React from "react";
import { AccessibilityPlugin } from "../types";
import { AccessibilityState } from "../AccessibilityContext";
import {
  ZoomIn, Type, Baseline, PauseCircle,
  AlignJustify, Volume2, VolumeX, Highlighter, ImageOff,
  Glasses, Focus, Mic, BookOpen, MoveVertical, MoveHorizontal
} from "lucide-react";

export const defaultPlugins: AccessibilityPlugin<AccessibilityState>[] = [
  {
    id: "contrast_cycle",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2 A10 10 0 0 0 12 22 Z" fill="currentColor" />
      </svg>
    ),
    title: (t) => t.visuals,
    action: (state: AccessibilityState) => {
      if (state.contrast === "default" && state.saturation === "default") {
        state.setContrast("invert");
      } else if (state.contrast === "invert") {
        state.setContrast("yellow-black");
      } else if (state.contrast === "yellow-black") {
        state.setContrast("default");
        state.setSaturation("mono");
      } else if (state.saturation === "mono") {
        state.setSaturation("default");
      }
    },
    isActive: (state: AccessibilityState) => state.contrast !== "default" || state.saturation !== "default",
    steps: () => 3,
    currentStep: (state: AccessibilityState) => {
      if (state.contrast === "invert") return 1;
      if (state.contrast === "yellow-black") return 2;
      if (state.saturation === "mono") return 3;
      return 0;
    },
    aiIntent: "change_setting",
    aiTarget: "contrast_cycle"
  },
  {
    id: "text_cycle",
    icon: <Type className="w-6 h-6" />,
    title: (t) => t.textSize,
    action: (state: AccessibilityState) => {
      if (state.textSize < 125) state.setTextSize(125);
      else if (state.textSize < 150) state.setTextSize(150);
      else if (state.textSize < 175) state.setTextSize(175);
      else if (state.textSize < 200) state.setTextSize(200);
      else state.setTextSize(100);
    },
    isActive: (state: AccessibilityState) => state.textSize > 100,
    steps: () => 4,
    currentStep: (state: AccessibilityState) => {
      if (state.textSize >= 200) return 4;
      if (state.textSize >= 175) return 3;
      if (state.textSize >= 150) return 2;
      if (state.textSize >= 125) return 1;
      return 0;
    },
    aiIntent: "change_setting",
    aiTarget: "text_zoom_in"
  },
  {
    id: "font_cycle",
    icon: <span className="font-bold text-[22px] leading-none" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>Df</span>,
    title: (t) => t.dyslexiaFont,
    action: (state: AccessibilityState) => {
      if (!state.dyslexiaFont && !state.legibleFont) {
        state.setDyslexiaFont(true);
      } else if (state.dyslexiaFont) {
        state.setDyslexiaFont(false);
        state.setLegibleFont(true);
      } else if (state.legibleFont) {
        state.setLegibleFont(false);
      }
    },
    isActive: (state: AccessibilityState) => state.dyslexiaFont || state.legibleFont,
    steps: () => 2,
    currentStep: (state: AccessibilityState) => {
      if (state.dyslexiaFont) return 1;
      if (state.legibleFont) return 2;
      return 0;
    },
    aiIntent: "change_setting",
    aiTarget: "font_cycle"
  },
  {
    id: "magnifier",
    icon: <ZoomIn className="w-6 h-6" />,
    title: (t) => t.magnifier,
    action: (state: AccessibilityState) => state.setTextMagnifier(m => !m),
    isActive: (state: AccessibilityState) => state.textMagnifier,
    aiIntent: "change_setting",
    aiTarget: "magnifier_toggle"
  },
  {
    id: "reading_assist_cycle",
    icon: <Glasses className="w-6 h-6" />,
    title: (t) => t.readingMask,
    action: (state: AccessibilityState) => {
      if (!state.readingRuler && state.readingMaskType === "none") {
        state.setReadingRuler(true);
      } else if (state.readingRuler) {
        state.setReadingRuler(false);
        state.setReadingMaskType("tint");
      } else if (state.readingMaskType === "tint") {
        state.setReadingMaskType("rect");
      } else if (state.readingMaskType === "rect") {
        state.setReadingMaskType("circle");
      } else {
        state.setReadingMaskType("none");
      }
    },
    isActive: (state: AccessibilityState) => state.readingRuler || state.readingMaskType !== "none",
    steps: () => 4,
    currentStep: (state: AccessibilityState) => {
      if (state.readingMaskType === "circle") return 4;
      if (state.readingMaskType === "rect") return 3;
      if (state.readingMaskType === "tint") return 2;
      if (state.readingRuler) return 1;
      return 0;
    },
    aiIntent: "change_setting",
    aiTarget: "reading_mask_toggle"
  },
  {
    id: "highlight_cycle",
    icon: <Highlighter className="w-6 h-6" />,
    title: (t) => t.navAdjust,
    action: (state: AccessibilityState) => {
      if (!state.highlightLinks && !state.highlightHeaders) {
        state.setHighlightLinks(true);
      } else if (state.highlightLinks && !state.highlightHeaders) {
        state.setHighlightLinks(false);
        state.setHighlightHeaders(true);
      } else if (!state.highlightLinks && state.highlightHeaders) {
        state.setHighlightLinks(true);
        state.setHighlightHeaders(true);
      } else {
        state.setHighlightLinks(false);
        state.setHighlightHeaders(false);
      }
    },
    isActive: (state: AccessibilityState) => state.highlightLinks || state.highlightHeaders,
    steps: () => 3,
    currentStep: (state: AccessibilityState) => {
      if (state.highlightLinks && state.highlightHeaders) return 3;
      if (state.highlightHeaders) return 2;
      if (state.highlightLinks) return 1;
      return 0;
    },
    aiIntent: "change_setting",
    aiTarget: "highlight_cycle"
  },
  {
    id: "focus",
    icon: <Focus className="w-6 h-6" />,
    title: (t) => t.focusRing,
    action: (state: AccessibilityState) => state.setFocusRing(f => !f),
    isActive: (state: AccessibilityState) => state.focusRing,
    aiIntent: "change_setting",
    aiTarget: "focus_ring"
  },
  {
    id: "line_height",
    icon: <MoveVertical className="w-6 h-6" />,
    title: (t) => t.lineHeight,
    action: (state: AccessibilityState) => {
      if (state.lineHeight === 0) state.setLineHeight(1);
      else if (state.lineHeight === 1) state.setLineHeight(2);
      else state.setLineHeight(0);
    },
    isActive: (state: AccessibilityState) => state.lineHeight > 0,
    steps: () => 2,
    currentStep: (state: AccessibilityState) => state.lineHeight,
    aiIntent: "change_setting",
    aiTarget: "line_height"
  },
  {
    id: "letter_spacing",
    icon: <MoveHorizontal className="w-6 h-6" />,
    title: (t) => t.letterSpacing,
    action: (state: AccessibilityState) => {
      if (state.letterSpacing === 0) state.setLetterSpacing(1);
      else if (state.letterSpacing === 1) state.setLetterSpacing(2);
      else if (state.letterSpacing === 2) state.setLetterSpacing(3);
      else state.setLetterSpacing(0);
    },
    isActive: (state: AccessibilityState) => state.letterSpacing > 0,
    steps: () => 3,
    currentStep: (state: AccessibilityState) => state.letterSpacing,
    aiIntent: "change_setting",
    aiTarget: "letter_spacing"
  },
  {
    id: "word_spacing",
    icon: <AlignJustify className="w-6 h-6" />,
    title: (t) => t.wordSpacing,
    action: (state: AccessibilityState) => {
      if (state.wordSpacing === 0) state.setWordSpacing(1);
      else if (state.wordSpacing === 1) state.setWordSpacing(2);
      else if (state.wordSpacing === 2) state.setWordSpacing(3);
      else state.setWordSpacing(0);
    },
    isActive: (state: AccessibilityState) => state.wordSpacing > 0,
    steps: () => 3,
    currentStep: (state: AccessibilityState) => state.wordSpacing,
    aiIntent: "change_setting",
    aiTarget: "word_spacing"
  },
  {
    id: "animations",
    icon: <PauseCircle className="w-6 h-6" />,
    title: (t) => t.pauseAnimations,
    action: (state: AccessibilityState) => state.setPauseAnimations(p => !p),
    isActive: (state: AccessibilityState) => state.pauseAnimations,
    aiIntent: "change_setting",
    aiTarget: "pause_animations"
  },
  {
    id: "images",
    icon: <ImageOff className="w-6 h-6" />,
    title: (t) => t.hideImages,
    action: (state: AccessibilityState) => state.setHideImages(h => !h),
    isActive: (state: AccessibilityState) => state.hideImages,
    aiIntent: "change_setting",
    aiTarget: "hide_images"
  },
  {
    id: "muteMedia",
    icon: <VolumeX className="w-6 h-6" />,
    title: (t) => t.muteMedia,
    action: (state: AccessibilityState) => state.setMuteMedia(m => !m),
    isActive: (state: AccessibilityState) => state.muteMedia,
    aiIntent: "change_setting",
    aiTarget: "mute_media"
  },
  {
    id: "dictionary",
    icon: <BookOpen className="w-6 h-6" />,
    title: (t) => t.dictionary,
    action: (state: AccessibilityState) => {
      if (state.hasDictionaryProvider) state.setDictionaryMode(d => !d);
    },
    isActive: (state: AccessibilityState) => state.hasDictionaryProvider && state.dictionaryMode,
    requiresProvider: "dictionary",
    badge: { text: "AI", variant: "premium" },
    aiIntent: "change_setting",
    aiTarget: "dictionary_toggle"
  },
  {
    id: "reader",
    icon: <Volume2 className="w-6 h-6" />,
    title: (t) => t.screenReader,
    action: (state: AccessibilityState) => state.setScreenReader(s => !s),
    isActive: (state: AccessibilityState) => state.screenReader,
    aiIntent: "change_setting",
    aiTarget: "screen_reader_toggle"
  },
  {
    id: "voice_control",
    icon: <Mic className="w-6 h-6" />,
    title: (t) => t.voiceCommand,
    action: (state: AccessibilityState) => {
      if (state.hasAIProvider) state.setVoiceControl(v => !v);
    },
    isActive: (state: AccessibilityState) => state.hasAIProvider && state.voiceControl,
    requiresProvider: "ai",
    badge: { text: "AI", variant: "premium" },
    aiIntent: "change_setting",
    aiTarget: "voice_control_toggle"
  }
];

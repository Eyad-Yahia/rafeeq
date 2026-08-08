import React from "react";
import { Accessibility, Waves, Droplet, Eye, BrainCircuit, Activity, Fingerprint } from "lucide-react";
import { AccessibilityProfile } from "../types";

export const defaultProfiles: ReadonlyArray<AccessibilityProfile> = Object.freeze([
  { 
    id: "motor", 
    label: (t) => t.motor, 
    icon: <Accessibility className="w-4 h-4" />, 
    settings: { focusRing: true, pauseAnimations: true }
  },
  { 
    id: "blind", 
    label: (t) => t.screenReader || t.blindness, 
    icon: <Waves className="w-4 h-4" />, 
    settings: { screenReader: true }
  },
  { 
    id: "colorblind", 
    label: (t) => t.colorBlindness, 
    icon: <Droplet className="w-4 h-4" />, 
    settings: { contrast: "invert" }
  },
  { 
    id: "dyslexia", 
    label: (t) => t.dyslexia, 
    icon: <span className="font-bold text-[16px] leading-none" style={{ fontFamily: "'OpenDyslexic', 'Comic Sans MS', sans-serif" }}>Df</span>, 
    settings: { dyslexiaFont: true, readingRuler: true }
  },
  { 
    id: "lowvision", 
    label: (t) => t.visuallyImpaired, 
    icon: <Eye className="w-4 h-4" />, 
    settings: { textSize: 120, textMagnifier: true }
  },
  { 
    id: "cognitive", 
    label: (t) => t.cognitive, 
    icon: <BrainCircuit className="w-4 h-4" />, 
    settings: { highlightLinks: true, highlightHeaders: true, pauseAnimations: true }
  },
  { 
    id: "seizure", 
    label: (t) => t.seizure, 
    icon: <Activity className="w-4 h-4" />, 
    settings: { pauseAnimations: true, muteMedia: true, saturation: "mono" }
  },
  { 
    id: "adhd", 
    label: (t) => t.adhd, 
    icon: <Fingerprint className="w-4 h-4" />, 
    settings: { readingMaskType: "tint", pauseAnimations: true, muteMedia: true }
  },
]);

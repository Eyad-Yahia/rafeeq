import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Contrast, Saturation, ReadingMaskType, AccessibilityProfileSettings, ProfileId } from "../types";
import { sanitizeProfileSettings } from "../utils/security";

export function useAccessibilitySettings(persistKey?: string) {
  const [textSize, setTextSize] = useState<number>(100);
  const [dyslexiaFont, setDyslexiaFont] = useState<boolean>(false);
  const [legibleFont, setLegibleFont] = useState<boolean>(false);
  const [highlightLinks, setHighlightLinks] = useState<boolean>(false);
  const [highlightHeaders, setHighlightHeaders] = useState<boolean>(false);
  const [textMagnifier, setTextMagnifier] = useState<boolean>(false);
  const [contrast, setContrast] = useState<Contrast>("default");
  const [saturation, setSaturation] = useState<Saturation>("default");
  const [readingRuler, setReadingRuler] = useState<boolean>(false);
  const [readingMaskType, setReadingMaskType] = useState<ReadingMaskType>("none");
  const [focusRing, setFocusRing] = useState<boolean>(false);
  const [pauseAnimations, setPauseAnimations] = useState<boolean>(false);
  const [hideImages, setHideImages] = useState<boolean>(false);
  const [muteMedia, setMuteMedia] = useState<boolean>(false);
  const [lineHeight, setLineHeight] = useState<number>(0);
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [wordSpacing, setWordSpacing] = useState<number>(0);

  // Persistence (Load on mount)
  useEffect(() => {
    if (persistKey && typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(persistKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          const safe = sanitizeProfileSettings(parsed);
          if (safe.textSize !== undefined) setTextSize(safe.textSize);
          if (safe.dyslexiaFont !== undefined) setDyslexiaFont(safe.dyslexiaFont);
          if (safe.legibleFont !== undefined) setLegibleFont(safe.legibleFont);
          if (safe.highlightLinks !== undefined) setHighlightLinks(safe.highlightLinks);
          if (safe.highlightHeaders !== undefined) setHighlightHeaders(safe.highlightHeaders);
          if (safe.textMagnifier !== undefined) setTextMagnifier(safe.textMagnifier);
          if (safe.contrast !== undefined) setContrast(safe.contrast);
          if (safe.saturation !== undefined) setSaturation(safe.saturation);
          if (safe.readingRuler !== undefined) setReadingRuler(safe.readingRuler);
          if (safe.readingMaskType !== undefined) setReadingMaskType(safe.readingMaskType);
          if (safe.focusRing !== undefined) setFocusRing(safe.focusRing);
          if (safe.pauseAnimations !== undefined) setPauseAnimations(safe.pauseAnimations);
          if (safe.hideImages !== undefined) setHideImages(safe.hideImages);
          if (safe.muteMedia !== undefined) setMuteMedia(safe.muteMedia);
          if (safe.lineHeight !== undefined) setLineHeight(safe.lineHeight);
          if (safe.letterSpacing !== undefined) setLetterSpacing(safe.letterSpacing);
          if (safe.wordSpacing !== undefined) setWordSpacing(safe.wordSpacing);
        }
      } catch (e) {
        console.error("Accessibility Widget: Failed to load settings from localStorage", e);
      }
    }
  }, [persistKey]);

  // Persistence (Save on change)
  useEffect(() => {
    if (persistKey && typeof window !== "undefined") {
      try {
        const settings = {
          textSize, dyslexiaFont, legibleFont, highlightLinks, highlightHeaders, textMagnifier,
          contrast, saturation, readingRuler, readingMaskType, focusRing, pauseAnimations,
          hideImages, muteMedia, lineHeight, letterSpacing, wordSpacing
        };
        window.localStorage.setItem(persistKey, JSON.stringify(settings));
      } catch (e) {
        console.error("Accessibility Widget: Failed to save settings to localStorage", e);
      }
    }
  }, [persistKey, textSize, dyslexiaFont, legibleFont, highlightLinks, highlightHeaders, textMagnifier, contrast, saturation, readingRuler, readingMaskType, focusRing, pauseAnimations, hideImages, muteMedia, lineHeight, letterSpacing, wordSpacing]);

  // Profile State
  const [activeProfile, setActiveProfile] = useState<ProfileId | null>(null);
  const [profileSnapshot, setProfileSnapshotState] = useState<AccessibilityProfileSettings | null>(null);
  const profileSnapshotRef = useRef<AccessibilityProfileSettings | null>(null);

  const setProfileSnapshot = useCallback((snapshot: AccessibilityProfileSettings | null) => {
    profileSnapshotRef.current = snapshot;
    setProfileSnapshotState(snapshot);
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${textSize}%`;
  }, [textSize]);

  useEffect(() => {
    const classes = [
      { state: contrast === "invert", className: "acc-invert" },
      { state: contrast === "light", className: "acc-light-mode" },
      { state: contrast === "yellow-black", className: "acc-yellow-black" },
      { state: saturation === "mono", className: "acc-grayscale" },
      { state: dyslexiaFont, className: "acc-dyslexia" },
      { state: legibleFont, className: "acc-legible" },
      { state: highlightLinks, className: "acc-highlight-links" },
      { state: highlightHeaders, className: "acc-highlight-headers" },
      { state: pauseAnimations, className: "acc-pause-animations" },
      { state: hideImages, className: "acc-hide-images" },
      { state: focusRing, className: "acc-focus-ring" },
      { state: lineHeight === 1, className: "acc-line-height-1" },
      { state: lineHeight === 2, className: "acc-line-height-2" },
      { state: letterSpacing === 1, className: "acc-letter-spacing-1" },
      { state: letterSpacing === 2, className: "acc-letter-spacing-2" },
      { state: letterSpacing === 3, className: "acc-letter-spacing-3" },
      { state: wordSpacing === 1, className: "acc-word-spacing-1" },
      { state: wordSpacing === 2, className: "acc-word-spacing-2" },
      { state: wordSpacing === 3, className: "acc-word-spacing-3" },
    ];
    classes.forEach(({ state, className }) => {
      if (state) document.documentElement.classList.add(className);
      else document.documentElement.classList.remove(className);
    });
  }, [contrast, saturation, dyslexiaFont, legibleFont, highlightLinks, highlightHeaders, pauseAnimations, hideImages, focusRing, textMagnifier, lineHeight, letterSpacing, wordSpacing]);

  useEffect(() => {
    if (hideImages) {
      document.querySelectorAll("a").forEach(link => {
        const imgs = link.querySelectorAll("img, picture");
        if (imgs.length > 0 && link.textContent?.trim() === "") {
          link.setAttribute("data-acc-hidden", "true");
          link.setAttribute("aria-hidden", "true");
          link.setAttribute("tabindex", "-1");
        }
      });
    } else {
      document.querySelectorAll('a[data-acc-hidden="true"]').forEach(link => {
        link.removeAttribute("data-acc-hidden");
        link.removeAttribute("aria-hidden");
        link.removeAttribute("tabindex");
      });
    }
  }, [hideImages]);

  useEffect(() => {
    const updateMedia = () => {
      document.querySelectorAll("video, audio").forEach(el => {
        (el as HTMLMediaElement).muted = muteMedia;
      });
    };
    
    updateMedia();

    if (muteMedia) {
      const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
              const node = mutation.addedNodes[i];
              if (node.nodeName === 'VIDEO' || node.nodeName === 'AUDIO') {
                shouldUpdate = true;
              } else if (node.nodeType === 1 && (node as Element).querySelectorAll("video, audio").length > 0) {
                shouldUpdate = true;
              }
            }
          }
        }
        if (shouldUpdate) updateMedia();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, [muteMedia]);

  useEffect(() => {
    if (!textMagnifier) return;

    let magnifiedElement: HTMLElement | null = null;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || target === document.body || target === document.documentElement) return;
      
      if (target.closest('[role="dialog"]') || target.closest('[aria-modal="true"]')) return;

      const validTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'A', 'BUTTON', 'LI', 'LABEL'];
      if (validTags.includes(target.nodeName)) {
        magnifiedElement = target;
        target.classList.add('acc-magnified-element');
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (magnifiedElement) {
        magnifiedElement.classList.remove('acc-magnified-element');
        magnifiedElement = null;
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      if (magnifiedElement) {
        magnifiedElement.classList.remove('acc-magnified-element');
      }
    };
  }, [textMagnifier]);

  return useMemo(() => ({
    textSize, setTextSize,
    dyslexiaFont, setDyslexiaFont,
    legibleFont, setLegibleFont,
    highlightLinks, setHighlightLinks,
    highlightHeaders, setHighlightHeaders,
    textMagnifier, setTextMagnifier,
    contrast, setContrast,
    saturation, setSaturation,
    readingRuler, setReadingRuler,
    readingMaskType, setReadingMaskType,
    focusRing, setFocusRing,
    pauseAnimations, setPauseAnimations,
    hideImages, setHideImages,
    muteMedia, setMuteMedia,
    lineHeight, setLineHeight,
    letterSpacing, setLetterSpacing,
    wordSpacing, setWordSpacing,
    activeProfile, setActiveProfile,
    profileSnapshot, setProfileSnapshot,
    profileSnapshotRef
  }), [
    textSize, dyslexiaFont, legibleFont, highlightLinks, highlightHeaders, 
    textMagnifier, contrast, saturation, readingRuler, readingMaskType, 
    focusRing, pauseAnimations, hideImages, muteMedia, 
    lineHeight, letterSpacing, wordSpacing,
    activeProfile, profileSnapshot, profileSnapshotRef
  ]);
}

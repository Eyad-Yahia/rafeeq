"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AccessibilityWidgetProps, AccessibilityProfile } from "./types";
import { useAccessibility, AccessibilityProvider } from "./AccessibilityContext";
import { useFocusTrap } from "./hooks/useFocusTrap";

import { WidgetHeader } from "./components/WidgetHeader";
import { SearchBar } from "./components/SearchBar";
import { ExplanationBanner } from "./components/ExplanationBanner";
import { ProfilesSection } from "./components/ProfilesSection";
import { FeaturesGrid } from "./components/FeaturesGrid";
import { DictionaryTooltip } from "./components/DictionaryTooltip";
import { AiConfigurationModal } from "./components/AiConfigurationModal";
import { UniversalAccessIcon } from "./components/UniversalAccessIcon";
import { BrandingFooter } from "./components/BrandingFooter";
import { defaultPlugins } from "./plugins/defaultPlugins";
import { defaultProfiles } from "./profiles/defaultProfiles";
import { ErrorBoundary } from "./components/ErrorBoundary";

/**
 * The internal UI component for the accessibility widget.
 * Renders the floating trigger button and the main settings modal.
 * 
 * @param props - Configuration properties for the UI.
 */
export function AccessibilityUI({
  triggerPosition = "bottom-right",
  triggerColor = "#059669",
  triggerSize = "medium",
  triggerIcon,
  showBranding = true,
  plugins: pluginsFactory,
  profiles
}: AccessibilityWidgetProps) {
  const state = useAccessibility();
  const {
    isOpen, setIsOpen,
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
    dictionaryMode, setDictionaryMode,
    screenReader, setScreenReader,
    voiceControl, setVoiceControl,
    isDarkMode, toggleTheme, resetAll,
    isRTL, t,
    activeProfile, setProfile,
    explanation, showExplanation,
    lineHeight, setLineHeight,
    letterSpacing, setLetterSpacing,
    wordSpacing, setWordSpacing,
  } = state;

  const rulerRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const [searchQuery, setSearchQuery] = useState("");
  const [missingProviderFeature, setMissingProviderFeature] = useState<string | null>(null); 
  const pluginsList = React.useMemo(() => pluginsFactory ? pluginsFactory(state) : defaultPlugins, [pluginsFactory, state]);

  /**
   * PERFORMANCE CONTRACT — READ BEFORE ADDING A NEW PLUGIN
   * =========================================================
   * `pluginState` is a deliberately *narrowed* dependency snapshot of the full context
   * state. It exists to prevent `FeaturesGrid` (and the entire feature grid) from
   * re-rendering every time any unrelated context value changes (e.g. `explanation`,
   * `isOpen`, `dictionaryTooltip`).
   *
   * HOW IT WORKS:
   *   Instead of passing the raw `state` object (which changes reference on every
   *   render), we build `pluginState` whose reference only updates when one of the
   *   explicitly listed dependencies below changes. `featuresList` and ultimately
   *   `FeaturesGrid` only re-render when `pluginState` changes.
   *
   * ⚠️  MAINTENANCE RISK — SILENT STALE DATA BUG:
   *   If you write a new plugin whose `isActive()` or `currentStep()` reads a state
   *   field that is NOT listed in the dependency array below, the plugin's active
   *   state will appear FROZEN in the UI — it will stop reacting to changes of that
   *   field — because `pluginState` won't update when that field changes.
   *
   *   This bug is SILENT: React won't warn you, TypeScript won't catch it, and tests
   *   may not cover the new field. The only symptom is a button that appears stuck.
   *
   * ✅  RULE FOR CONTRIBUTORS:
   *   Every field your plugin reads inside `isActive`, `currentStep`, or `action`
   *   MUST appear in the dependency array below. When in doubt, add it — the cost
   *   of an extra dependency is a slightly more frequent re-render, which is far
   *   cheaper than silent stale state.
   *
   * FIELDS DELIBERATELY EXCLUDED (and why):
   *   - `explanation`          → only used by ExplanationBanner, not any plugin
   *   - `dictionaryTooltip`    → only used by DictionaryTooltip, not any plugin
   *   - `isOpen`               → widget open/close state; no plugin reads it
   *   - `setExplanation` / `setDictionaryTooltip` → same reason
   */
  const pluginState = React.useMemo(() => ({
    textSize, contrast, saturation, dyslexiaFont, legibleFont,
    highlightLinks, highlightHeaders, textMagnifier, readingRuler, readingMaskType,
    focusRing, pauseAnimations, hideImages, muteMedia,
    lineHeight, letterSpacing, wordSpacing,
    dictionaryMode, screenReader, voiceControl,
    isDarkMode, isRTL,
    hasAIProvider: state.hasAIProvider, hasDictionaryProvider: state.hasDictionaryProvider,
    setTextSize, setContrast, setSaturation, setDyslexiaFont, setLegibleFont,
    setHighlightLinks, setHighlightHeaders, setTextMagnifier, setReadingRuler,
    setReadingMaskType, setFocusRing, setPauseAnimations, setHideImages, setMuteMedia,
    setLineHeight, setLetterSpacing, setWordSpacing,
    setDictionaryMode, setScreenReader, setVoiceControl,
    toggleTheme, resetAll, setIsOpen, setProfile,
    showExplanation, t,
  } as any), [
    // ── Visible settings read by plugin isActive() / currentStep() ──────────
    // If your plugin reads a new setting here, ADD IT to this list or it will
    // appear frozen in the UI.
    textSize, contrast, saturation, dyslexiaFont, legibleFont,
    highlightLinks, highlightHeaders, textMagnifier, readingRuler, readingMaskType,
    focusRing, pauseAnimations, hideImages, muteMedia,
    lineHeight, letterSpacing, wordSpacing,
    dictionaryMode, screenReader, voiceControl,
    isDarkMode, isRTL,
    // ── Provider availability flags (for requiresProvider gating) ───────────
    state.hasAIProvider, state.hasDictionaryProvider,
    // ── Stable setters & callbacks (stable by design via useLatestRef) ──────
    setTextSize, setContrast, setSaturation, setDyslexiaFont, setLegibleFont,
    setHighlightLinks, setHighlightHeaders, setTextMagnifier, setReadingRuler,
    setReadingMaskType, setFocusRing, setPauseAnimations, setHideImages, setMuteMedia,
    setLineHeight, setLetterSpacing, setWordSpacing,
    setDictionaryMode, setScreenReader, setVoiceControl,
    toggleTheme, resetAll, setIsOpen, setProfile,
    showExplanation, t,
  ]);

  const featuresList = React.useMemo(() => [
    ...pluginsList.map(p => ({
      id: p.id,
      icon: p.icon,
      title: typeof p.title === 'function' ? p.title(t) : p.title,
      action: () => {
        const titleStr = typeof p.title === 'function' ? p.title(t) : p.title;
        if (p.requiresProvider === "ai" && !pluginState.hasAIProvider) {
          setMissingProviderFeature(titleStr);
        } else if (p.requiresProvider === "dictionary" && !pluginState.hasDictionaryProvider) {
          setMissingProviderFeature(titleStr);
        } else {
          p.action(pluginState);
        }
      },
      active: p.isActive(pluginState),
      ...(p.badge && { badge: p.badge }),
      ...(p.requiresProvider && { requiresProvider: p.requiresProvider }),
      ...(p.steps && { steps: p.steps(pluginState) }),
      ...(p.currentStep && { currentStep: p.currentStep(pluginState) }),
      ...(p.category && { category: p.category })
    }))
  ], [pluginsList, pluginState, t]);
  const profilesList = React.useMemo(() => profiles || defaultProfiles, [profiles]);

  const filteredFeatures = React.useMemo(() => featuresList.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase())), [featuresList, searchQuery]);

  const modalRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  useFocusTrap(modalRef, isOpen);

  const isMounted = React.useRef(false);
  React.useEffect(() => {
    if (isMounted.current && !isOpen) {
      triggerRef.current?.focus();
    }
    isMounted.current = true;
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) setIsOpen(false); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  React.useEffect(() => {
    if (!readingRuler && readingMaskType === "none") return;

    let rafId: number;
    const updatePosition = (x: number, y: number) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (readingRuler && rulerRef.current) {
          rulerRef.current.style.top = `${y}px`;
        }
        if (readingMaskType !== "none" && maskRef.current) {
          if (readingMaskType === "circle") {
            maskRef.current.style.background = `radial-gradient(circle 120px at ${x}px ${y}px, transparent 100px, rgba(0, 0, 0, 0.75) 120px)`;
          } else {
            const height = readingMaskType === "tint" ? 120 : 150;
            const opacity = readingMaskType === "tint" ? 0.4 : 0.8;
            maskRef.current.style.background = `linear-gradient(to bottom, rgba(0,0,0,${opacity}) 0%, rgba(0,0,0,${opacity}) ${y - height / 2}px, transparent ${y - height / 2}px, transparent ${y + height / 2}px, rgba(0,0,0,${opacity}) ${y + height / 2}px, rgba(0,0,0,${opacity}) 100%)`;
          }
        }
      });
    };

    const handleMouseMove = (e: MouseEvent) => updatePosition(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updatePosition(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.getBoundingClientRect) {
        const rect = target.getBoundingClientRect();
        updatePosition(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("focusin", handleFocusIn);
      cancelAnimationFrame(rafId);
    };
  }, [readingRuler, readingMaskType, rulerRef, maskRef]);

  const triggerSizeClasses = triggerSize === 'small' ? 'w-14 h-14' : triggerSize === 'large' ? 'w-20 h-20' : 'w-16 h-16';
  const iconSizeClasses = triggerSize === 'small' ? 'w-11 h-11' : triggerSize === 'large' ? 'w-16 h-16' : 'w-14 h-14';

  return (
    <div id="accessibility-widget-root">
      {readingRuler && <div ref={rulerRef as React.RefObject<HTMLDivElement>} className="fixed left-0 right-0 h-1 bg-emerald-600 pointer-events-none z-[9999]" style={{ top: '50%', boxShadow: "0 0 5px #047857" }} />}
      {readingMaskType !== "none" && <div ref={maskRef as React.RefObject<HTMLDivElement>} className="fixed inset-0 pointer-events-none z-[9998]" />}

      <div
        className={`fixed z-[99999] flex flex-col !pointer-events-auto ${triggerPosition.includes('bottom') ? 'bottom-4 sm:bottom-6' : triggerPosition.includes('top') ? 'top-4 sm:top-6' : 'top-1/2 -translate-y-1/2'} ${triggerPosition.includes('left') ? 'left-4 sm:left-6 items-start' : 'right-4 sm:right-6 items-end'}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="accessibility-modal"
              ref={modalRef}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20, scale: shouldReduceMotion ? 1 : 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 20, scale: shouldReduceMotion ? 1 : 0.95 }}
              {...(shouldReduceMotion ? { transition: { duration: 0 } } : {})}
              className="bg-white dark:bg-gray-900 shadow-3xl rounded-3xl border border-gray-100 dark:border-gray-800 w-[calc(100vw-2rem)] sm:w-[420px] mb-4 flex flex-col max-h-[85vh] overflow-hidden"
              style={{ boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.15)" }}
              role="dialog" aria-modal="true" aria-label={t.title}
            >
              <WidgetHeader t={t} resetAll={resetAll} setIsOpen={setIsOpen} />
              <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} t={t} isRTL={isRTL} />
              <ExplanationBanner explanation={explanation} showExplanation={showExplanation} isRTL={isRTL} />
              <div className="flex-1 overflow-y-auto bg-[#f6f8fa] dark:bg-gray-950 flex flex-col">
                <ProfilesSection profiles={profilesList} activeProfile={activeProfile} setProfile={setProfile} t={t} />
                <FeaturesGrid features={filteredFeatures} />
              </div>

              {/* Overlay Modal for missing AI Providers */}
              <AnimatePresence>
                {missingProviderFeature && (
                  <AiConfigurationModal
                    featureTitle={missingProviderFeature}
                    onClose={() => setMissingProviderFeature(null)}
                    isRTL={isRTL}
                  />
                )}
              </AnimatePresence>

              {showBranding && <BrandingFooter />}
            </motion.div>
          ) : (
            <motion.button
              key="accessibility-trigger"
              ref={triggerRef}
              initial={{ scale: shouldReduceMotion ? 1 : 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: shouldReduceMotion ? 1 : 0, opacity: 0 }}
              {...(shouldReduceMotion ? { transition: { duration: 0 } } : {})}
              whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              aria-label={t.title}
              aria-expanded={isOpen}
              className={`relative text-white rounded-full flex flex-col items-center justify-center transition-all duration-300 border border-white/10 group outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 focus-visible:ring-gray-900 dark:focus-visible:ring-gray-100 ${triggerSizeClasses}`}
              style={{ backgroundColor: triggerColor, boxShadow: `0 8px 25px ${triggerColor}50` }}
            >
              {triggerIcon || <UniversalAccessIcon className={`${iconSizeClasses} text-white transition-transform duration-300`} />}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <DictionaryTooltip />
    </div>
  );
}

/**
 * The main Accessibility Widget component.
 * Wraps the UI with the AccessibilityProvider to supply state.
 * 
 * @param props - Configuration properties for the widget and providers.
 */
export function AccessibilityWidget(props: AccessibilityWidgetProps) {
  return (
    <ErrorBoundary>
      <AccessibilityProvider {...props}>
        <AccessibilityUI {...props} />
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

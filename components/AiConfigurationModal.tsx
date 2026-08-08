import React, { useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, BrainCircuit, ExternalLink, Check } from "lucide-react";
import { BRANDING } from "../constants/branding";
import { useFocusTrap } from "../hooks/useFocusTrap";

interface AiConfigurationModalProps {
  featureTitle: string;
  onClose: () => void;
  isRTL: boolean;
}

export function AiConfigurationModal({ featureTitle, onClose, isRTL }: AiConfigurationModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(modalRef, true);

  // Store previously focused element to restore it on close
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    return () => {
      // Restore focus when modal unmounts
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Focus the close button or first interactive element on mount
  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm rounded-3xl" dir={isRTL ? "rtl" : "ltr"}>
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10, scale: shouldReduceMotion ? 1 : 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 10, scale: shouldReduceMotion ? 1 : 0.98 }}
        {...(shouldReduceMotion ? { transition: { duration: 0 } } : {})}
        className="w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <BrainCircuit className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 id="ai-modal-title" className="font-bold text-sm">AI Provider Required</h3>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-[13px] text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
            This feature requires an AI Provider to function.
          </p>
          <p className="text-[13px] text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">{BRANDING.name}</span> is provider-agnostic and works with any implementation that follows the library's AI Provider interface.
          </p>
          <p className="text-[13px] text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Configure your preferred AI Provider to enable this feature.
          </p>
          
          <p className="text-[12px] text-gray-500 dark:text-gray-400 italic text-center mb-5 pb-4 border-b border-gray-100 dark:border-gray-800">
            You are free to integrate your own AI Provider implementation.
          </p>

          <div className="flex flex-col gap-2.5 mb-4">
            {BRANDING.documentation && (
              <a
                href={BRANDING.documentation}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                Documentation
                <ExternalLink className="w-4 h-4 opacity-70" />
              </a>
            )}
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center text-center py-2.5 px-4 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

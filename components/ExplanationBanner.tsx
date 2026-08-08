"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, X } from "lucide-react";
export const ExplanationBanner = React.memo(function ExplanationBanner({ explanation, showExplanation, isRTL }: { explanation: string | null, showExplanation: (text: string | null) => void, isRTL: boolean }) {
  return (
    <AnimatePresence>
      {explanation && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-100 p-4 shrink-0 flex items-start gap-2.5 relative">
          <Info className="w-5 h-5 text-emerald-700 mt-0.5" />
          <div className="flex-1 pr-1" aria-live="polite"><p className="text-xs text-emerald-700 leading-relaxed">{explanation}</p></div>
          <button onClick={() => showExplanation(null)} className={`absolute top-3 ${isRTL ? "right-3" : "left-3"} text-emerald-600 hover:text-emerald-800 p-1`}>
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

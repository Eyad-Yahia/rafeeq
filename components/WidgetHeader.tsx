"use client";
import React from "react";
import { RotateCcw, X } from "lucide-react";
import { Translations } from "../types";

interface WidgetHeaderProps {
  t: Translations;
  resetAll: () => void;
  setIsOpen: (val: boolean) => void;
}

export const WidgetHeader = React.memo(function WidgetHeader({ t, resetAll, setIsOpen }: WidgetHeaderProps) {

  return (
    <div className="bg-emerald-600 dark:bg-emerald-700 text-white p-5 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-3">
        <div>
          <h3 className="font-bold text-lg">{t.title}</h3>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={resetAll}
          aria-label={t.reset}
          aria-live="assertive"
          className="p-2 rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/50 hover:bg-emerald-600/50"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button onClick={() => setIsOpen(false)} aria-label={t.close} className="p-2 hover:bg-emerald-600/50 rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/50">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

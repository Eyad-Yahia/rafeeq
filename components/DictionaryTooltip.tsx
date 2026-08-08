"use client";
import React from "react";
import { BrainCircuit, Loader2 } from "lucide-react";
import { useAccessibility } from "../AccessibilityContext";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export function DictionaryTooltip() {
  const { dictionaryTooltip, t, isRTL } = useAccessibility();
  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });

  useIsomorphicLayoutEffect(() => {
    if (dictionaryTooltip) {
      // Initial rough position
      let x = dictionaryTooltip.x;
      let y = dictionaryTooltip.y;
      
      setPos({ x, y });

      if (tooltipRef.current) {
        const rect = tooltipRef.current.getBoundingClientRect();
        let newX = x;
        let newY = y;

        // Clamp X
        if (x + rect.width > window.innerWidth) {
          newX = Math.max(10, window.innerWidth - rect.width - 20);
        }
        // Clamp Y
        if (y + rect.height > window.innerHeight) {
          newY = Math.max(10, window.innerHeight - rect.height - 20);
        }

        if (newX !== x || newY !== y) {
          setPos({ x: newX, y: newY });
        }
      }
    }
  }, [dictionaryTooltip]);

  if (!dictionaryTooltip) return null;

  return (
    <div 
      ref={tooltipRef}
      className="fixed z-[999999] bg-gray-900 text-white p-4 rounded-xl shadow-2xl max-w-sm pointer-events-none text-sm transition-all duration-200" 
      style={{ top: pos.y, left: pos.x }} 
      dir={isRTL ? "rtl" : "ltr"}
      aria-live="polite"
    >
      {dictionaryTooltip.loading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>{t.loading}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 mb-1 text-emerald-400">
            <BrainCircuit className="w-4 h-4" />
            <span className="font-bold text-xs uppercase">{t.dictionary}</span>
          </div>
          <p>{dictionaryTooltip.text}</p>
        </div>
      )}
    </div>
  );
}

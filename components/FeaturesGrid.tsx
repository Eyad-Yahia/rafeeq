import React from "react";

export type GridFeature = {
  id: string;
  icon: React.ReactNode;
  title: string;
  action: () => void;
  active: boolean;
  badge?: {
    text: string;
    variant?: "info" | "premium" | "new";
  };
  requiresProvider?: "ai" | "dictionary";
  steps?: number | undefined;
  currentStep?: number | undefined;
  category?: string;
};

export const FeaturesGrid = React.memo(function FeaturesGrid({ features }: { features: GridFeature[] }) {
  return (
    <div className="w-full bg-[#f6f8fa] dark:bg-gray-950" style={{ direction: "ltr" }}>
      <div className="p-4 grid grid-cols-2 gap-3">
        {features.map(feat => (
          <button 
            key={feat.id} 
            onClick={feat.action}
            aria-pressed={feat.steps ? undefined : feat.active} 
            aria-label={`${feat.title}${feat.steps && feat.currentStep ? `, step ${feat.currentStep} of ${feat.steps}` : ''}`}
            className={`relative flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 rounded-2xl border transition-all hover:shadow-md hover:border-emerald-300 ${feat.active ? 'border-emerald-600 ring-2 ring-emerald-100 dark:ring-emerald-900' : 'border-gray-100 dark:border-gray-800'}`}
          >
            {feat.badge && (
              <span className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                feat.badge.variant === 'premium' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                feat.badge.variant === 'new' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              }`}>
                {feat.badge.text}
              </span>
            )}
            <div className={`p-3 rounded-full mb-3 ${feat.active ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
              {feat.icon}
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 text-center mb-1">{feat.title}</span>
            
            {/* Multi-step indicator */}
            {feat.steps && feat.steps > 1 && feat.currentStep !== undefined ? (
              (function() {
                const current = feat.currentStep;
                return (
                  <div className="flex items-center justify-center gap-1 mt-2 w-full px-2">
                    {Array.from({ length: feat.steps }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 rounded-full flex-1 transition-colors ${
                          i + 1 === current 
                            ? 'bg-emerald-600 dark:bg-emerald-500' 
                            : (i + 1 < current! ? 'bg-emerald-200 dark:bg-emerald-800' : 'bg-gray-200 dark:bg-gray-700')
                        }`}
                      />
                    ))}
                  </div>
                );
              })()
            ) : (
              // Standard active indicator
              feat.active && <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}, (prev, next) => {
  if (prev.features.length !== next.features.length) return false;
  return prev.features.every((f, i) => {
    const n = next.features[i];
    return (
      f.id === n.id &&
      f.active === n.active &&
      f.currentStep === n.currentStep &&
      f.badge?.text === n.badge?.text
    );
  });
});

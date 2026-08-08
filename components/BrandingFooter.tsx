import React from "react";
import { BRANDING } from "../constants/branding";

export function BrandingFooter() {
  const hasLink = Boolean(BRANDING.github);

  const content = (
    <span className="flex items-center justify-center gap-1 opacity-70 hover:opacity-100 transition-opacity duration-300">
      <span className="text-[11px] sm:text-[12px] font-medium text-gray-500 dark:text-gray-400">
        Powered by {BRANDING.name}
      </span>
    </span>
  );

  return (
    <div className="w-full py-3 px-4 flex justify-center items-center border-t border-gray-100 dark:border-gray-800/50 mt-auto bg-gray-50/50 dark:bg-gray-900/50 shrink-0" dir="ltr">
      {hasLink ? (
        <a
          href={BRANDING.github}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-full flex justify-center items-center relative z-50 pointer-events-auto outline-none rounded focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-emerald-400 cursor-pointer block"
          aria-label={`Powered by ${BRANDING.name}, opens in new tab`}
        >
          {content}
        </a>
      ) : (
        <div className="block cursor-default">
          {content}
        </div>
      )}
    </div>
  );
}

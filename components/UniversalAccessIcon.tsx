import React from "react";

export function UniversalAccessIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      {...props}
    >
      {/* Broken outer circle (Expanded to edges) */}
      <circle 
        cx="12" cy="12" r="11" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeDasharray="29.5 5" 
        strokeLinecap="round" 
        transform="rotate(-40 12 12)"
      />
      
      {/* Solid Head */}
      <circle cx="12" cy="7.1" r="1.5" fill="currentColor" />
      
      {/* Stick-figure Body */}
      <path 
        d="M 8 9.9 L 12 10.6 L 16 9.9 M 12 10.4 L 12 13.9 M 9.2 18.4 L 12 13.9 L 14.8 18.4" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}


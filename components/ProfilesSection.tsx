"use client";
import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Settings, ChevronUp, ChevronDown } from "lucide-react";
import { AccessibilityProfile, Translations } from "../types";

interface ProfilesSectionProps {
  profiles: readonly AccessibilityProfile[];
  activeProfile: string | null;
  setProfile: (profile: AccessibilityProfile | null) => void;
  t: Translations;
}

export const ProfilesSection = React.memo(function ProfilesSection({ profiles, activeProfile, setProfile, t }: ProfilesSectionProps) {
  const [showProfiles, setShowProfiles] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="border-b border-gray-100 dark:border-gray-800">
      <button 
        onClick={() => setShowProfiles(!showProfiles)} 
        aria-expanded={showProfiles} 
        aria-controls="profiles-content"
        className="w-full p-4 flex justify-between items-center bg-white dark:bg-gray-900 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-colors group"
      >
        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 flex items-center gap-2 transition-colors">
          <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> {t.profiles}
        </span>
        {showProfiles ? <ChevronUp className="w-4 h-4 text-emerald-600/70 group-hover:text-emerald-600 transition-colors" /> : <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />}
      </button>
      <motion.div 
        id="profiles-content"
        initial={false}
        animate={{ 
          height: showProfiles ? "auto" : 0, 
          opacity: showProfiles ? 1 : 0,
          visibility: showProfiles ? "visible" : "hidden"
        }} 
        transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: "easeInOut" }} 
        className="overflow-hidden bg-white dark:bg-gray-900"
        aria-hidden={!showProfiles}
      >
        <div className="p-4 grid grid-cols-2 gap-2">
          {profiles.map(prof => {
            const isActive = activeProfile === prof.id;
            return (
              <button
                key={prof.id}
                onClick={() => setProfile(isActive ? null : prof)}
                className={`flex items-center justify-between p-2 border rounded-xl text-left transition-colors ${isActive
                    ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/20 dark:border-emerald-400'
                    : 'bg-gray-50 border-gray-100 hover:border-emerald-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-emerald-500'
                  }`}
              >
                <span className={`text-xs font-semibold ${isActive ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-200'}`}>
                  {typeof prof.label === "function" ? prof.label(t) : prof.label}
                </span>
                <div className={`p-1.5 rounded-full shadow-sm ${isActive ? 'bg-emerald-500 text-white' : 'bg-white text-emerald-700 dark:bg-gray-700 dark:text-emerald-400'}`}>
                  {prof.icon}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
});

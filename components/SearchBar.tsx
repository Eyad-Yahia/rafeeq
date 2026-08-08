"use client";
import React from "react";
import { Search } from "lucide-react";
import { Translations } from "../types";

export const SearchBar = React.memo(function SearchBar({ searchQuery, setSearchQuery, t, isRTL }: { searchQuery: string, setSearchQuery: (q: string) => void, t: Translations, isRTL: boolean }) {
  return (
    <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
      <div className="relative">
        <input 
          type="text" 
          placeholder={t.search} 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
          aria-label={t.search} 
          className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600`} 
        />
        <Search className={`w-4 h-4 text-gray-400 absolute ${isRTL ? "right-3" : "left-3"} top-3`} />
      </div>
    </div>
  );
});

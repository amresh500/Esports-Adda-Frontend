"use client";

import { useLanguage } from "@/lib/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1 border border-white/10">
      <button
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 rounded-md text-sm font-semibold transition-all ${
          language === "en"
            ? "bg-white text-black"
            : "text-gray-300 hover:text-white"
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("ne")}
        className={`px-2.5 py-1 rounded-md text-sm font-semibold transition-all ${
          language === "ne"
            ? "bg-white text-black"
            : "text-gray-300 hover:text-white"
        }`}
        aria-label="नेपालीमा स्विच गर्नुस्"
      >
        ने
      </button>
    </div>
  );
}

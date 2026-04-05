"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-gray-700 mt-16">
      {/* Navigation Links */}
      <div className="px-6 py-8">
        <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          <Link href="/tournaments" className="text-gray-300 hover:text-white transition-colors text-base">
            {t.footer.links.tournaments}
          </Link>
          <Link href="/esports-data" className="text-gray-300 hover:text-white transition-colors text-base">
            {t.footer.links.esportsData}
          </Link>
          <Link href="/games" className="text-gray-300 hover:text-white transition-colors text-base">
            {t.footer.links.games}
          </Link>
          <Link href="/watch-now" className="text-gray-300 hover:text-white transition-colors text-base">
            {t.footer.links.watchNow}
          </Link>
          <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-base">
            {t.footer.links.about}
          </Link>
        </nav>
      </div>

      {/* Copyright */}
      <div className="px-6 py-4 text-center text-gray-400 text-sm border-t border-gray-700">
        © 2025 Esports Adda. {t.footer.rights}
      </div>
    </footer>
  );
}

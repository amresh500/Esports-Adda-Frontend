import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-700 mt-16">
      {/* Navigation Links */}
      <div className="px-6 py-8">
        <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
          <Link href="/tournaments" className="text-gray-300 hover:text-white transition-colors text-base">
            Tournaments
          </Link>
          <Link href="/esports-data" className="text-gray-300 hover:text-white transition-colors text-base">
            Esports Data
          </Link>
          <Link href="/games" className="text-gray-300 hover:text-white transition-colors text-base">
            Games
          </Link>
          <Link href="/watch-now" className="text-gray-300 hover:text-white transition-colors text-base">
            Watch Now
          </Link>
          <Link href="/news" className="text-gray-300 hover:text-white transition-colors text-base">
            News
          </Link>
          <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-base">
            About
          </Link>
        </nav>
      </div>

      {/* Copyright */}
      <div className="px-6 py-4 text-center text-gray-400 text-sm border-t border-gray-700">
        © 2025 Esports Adda. All rights reserved.
      </div>
    </footer>
  );
}

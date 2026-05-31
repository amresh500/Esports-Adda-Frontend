"use client";

import Link from "next/link";
import Logo from "@/components/icons/logo";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";

export default function Footer() {
  const { t } = useLanguage();
  const { accountType, isLoggedIn, mounted } = useAuth();

  const navLinks = [
    { href: "/tournaments", label: t.footer.links.tournaments },
    { href: "/esports-data", label: t.footer.links.esportsData },
    { href: "/games",       label: t.footer.links.games },
    { href: "/watch-now",   label: t.footer.links.watchNow },
    { href: "/about",       label: t.footer.links.about },
  ];

  const legalLinks = [
    { href: "/about",    label: "About" },
    { href: "/privacy",  label: "Privacy" },
    { href: "/terms",    label: "Terms" },
  ];

  return (
    <footer className="relative mt-20 border-t border-white/[0.07]">
      {/* Top accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#e85d5d]/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Main footer content ── */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">

          {/* Brand column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Logo width={36} height={32} />
              <span className="font-['Russo_One'] text-white text-lg tracking-wide group-hover:text-[#e85d5d] transition-colors duration-200">
                Esports Adda
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Nepal's premier esports platform — connecting players, teams, and organizations.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              <SocialLink href="#" aria-label="Discord">
                {/* Discord icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.035.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </SocialLink>
              <SocialLink href="#" aria-label="Twitter / X">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </SocialLink>
              <SocialLink href="#" aria-label="Facebook">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </SocialLink>
              <SocialLink href="#" aria-label="YouTube">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </SocialLink>
            </div>
          </div>

          {/* Navigation column */}
          <div>
            <h3 className="font-['Russo_One'] text-white/90 text-sm uppercase tracking-widest mb-5">
              Platform
            </h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/50 text-sm hover:text-white transition-colors duration-200 hover:translate-x-0.5 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community column */}
          <div>
            <h3 className="font-['Russo_One'] text-white/90 text-sm uppercase tracking-widest mb-5">
              {mounted && accountType === "organization" ? "Organization" : "For Teams"}
            </h3>
            <ul className="space-y-3">
              {(!mounted || !isLoggedIn) && (
                <>
                  <li>
                    <Link href="/signup" className="text-white/50 text-sm hover:text-white transition-colors duration-200 inline-block">
                      Create Account
                    </Link>
                  </li>
                  <li>
                    <Link href="/team" className="text-white/50 text-sm hover:text-white transition-colors duration-200 inline-block">
                      Team Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/org-signup" className="text-white/50 text-sm hover:text-white transition-colors duration-200 inline-block">
                      Register Organization
                    </Link>
                  </li>
                </>
              )}
              {mounted && isLoggedIn && accountType === "player" && (
                <>
                  <li>
                    <Link href="/profile" className="text-white/50 text-sm hover:text-white transition-colors duration-200 inline-block">
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/team" className="text-white/50 text-sm hover:text-white transition-colors duration-200 inline-block">
                      Team Dashboard
                    </Link>
                  </li>
                </>
              )}
              {mounted && isLoggedIn && accountType === "organization" && (
                <>
                  <li>
                    <Link href="/org-profile" className="text-white/50 text-sm hover:text-white transition-colors duration-200 inline-block">
                      Org Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/org-profile?tab=teams" className="text-white/50 text-sm hover:text-white transition-colors duration-200 inline-block">
                      Manage Teams
                    </Link>
                  </li>
                  <li>
                    <Link href="/organizer/dashboard" className="text-white/50 text-sm hover:text-white transition-colors duration-200 inline-block">
                      Stream Dashboard
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link href="/tournaments" className="text-white/50 text-sm hover:text-white transition-colors duration-200 inline-block">
                  Browse Tournaments
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/[0.07] py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs">
            © 2026 Esports Adda. {t.footer.rights}
          </p>
          <div className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-white/30 hover:text-white/60 text-xs transition-colors duration-200">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, children, "aria-label": ariaLabel }: { href: string; children: React.ReactNode; "aria-label": string }) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.09] hover:border-white/20 transition-all duration-200 cursor-pointer"
    >
      {children}
    </a>
  );
}

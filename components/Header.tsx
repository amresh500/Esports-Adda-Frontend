"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/icons/logo";
import NotificationBell from "@/components/NotificationBell";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { useConfirm } from "@/hooks/useConfirm";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function Header() {
  const { user, accountType, isOrgAdmin, isSiteAdmin, isLoggedIn, mounted, logout } = useAuth();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  const [showDropdown, setShowDropdown]     = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled]             = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router   = useRouter();
  const pathname = usePathname();
  const { t }    = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setShowDropdown(false);
    const ok = await confirm({
      title: "Sign out?",
      message: "Are you sure you want to sign out?",
      confirmText: "Sign Out",
      cancelText: "Cancel",
      confirmButtonClass: "bg-[#e85d5d] hover:bg-[#d94f4f]",
    });
    if (!ok) return;
    await logout();
    router.push("/");
  };

  const navLinks = [
    { href: "/tournaments", label: t.nav.tournaments },
    { href: "/esports-data", label: t.nav.esportsData },
    { href: "/games",        label: t.nav.games },
    { href: "/watch-now",    label: t.nav.watchNow },
    { href: "/about",        label: t.nav.about },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const displayName = accountType === "organization"
    ? (user?.tag || user?.organizationName || user?.name || "Org")
    : (user?.username || "…");

  return (
    <>
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#111111]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_1px_0_rgba(255,255,255,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <Logo width={36} height={32} />
          <span
            className="font-['Russo_One'] text-white text-lg leading-tight tracking-wide group-hover:text-[#e85d5d] transition-colors duration-200"
          >
            Esports<br />Adda
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-1" suppressHydrationWarning>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(link.href)
                  ? "text-white bg-white/[0.08]"
                  : "text-white/60 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#e85d5d] rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* ── Right Side ── */}
        {mounted ? (
          <div className="flex items-center gap-2">
            <LanguageToggle />

            {isLoggedIn ? (
              <>
                <NotificationBell />

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    aria-expanded={showDropdown}
                    aria-haspopup="true"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/15 bg-white/[0.05] hover:bg-white/[0.09] hover:border-white/25 transition-all duration-200 cursor-pointer"
                  >
                    {/* Avatar */}
                    <span className="w-6 h-6 rounded-full bg-[#e85d5d]/20 border border-[#e85d5d]/40 flex items-center justify-center text-[#e85d5d] text-xs font-bold flex-shrink-0">
                      {displayName?.[0]?.toUpperCase() ?? "?"}
                    </span>
                    <span className="hidden sm:block text-white text-sm font-medium max-w-[110px] truncate">
                      {displayName}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-white/50 flex-shrink-0 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* Account label */}
                      <div className="px-3 py-2.5 border-b border-white/[0.07]">
                        <p className="text-[11px] text-white/40 uppercase tracking-widest font-semibold">
                          {accountType === "organization" ? "Organization" : "Player"}
                        </p>
                        <p className="text-white text-sm font-medium truncate mt-0.5">{displayName}</p>
                      </div>

                      <div className="py-1">
                        {accountType === "player" && (
                          <>
                            <DropdownLink href="/profile"          label={t.nav.myProfile}    onClick={() => setShowDropdown(false)} />
                            <DropdownLink href="/team"             label={t.nav.teamDashboard} onClick={() => setShowDropdown(false)} />
                            {isOrgAdmin && (
                              <DropdownLink href="/admin-dashboard" label={t.nav.orgDashboard}  onClick={() => setShowDropdown(false)} accent="amber" />
                            )}
                            {isSiteAdmin && (
                              <DropdownLink href="/admin"           label={t.nav.adminPanel}    onClick={() => setShowDropdown(false)} accent="red" />
                            )}
                          </>
                        )}
                        {accountType === "organization" && (
                          <>
                            <DropdownLink href="/org-profile"            label={t.nav.orgProfile}      onClick={() => setShowDropdown(false)} />
                            <DropdownLink href="/org-profile?tab=teams"  label={t.nav.teamManagement}  onClick={() => setShowDropdown(false)} />
                            <DropdownLink href="/organizer/dashboard"    label={t.nav.streamDashboard} onClick={() => setShowDropdown(false)} />
                          </>
                        )}
                        <DropdownLink href="/settings" label="Settings" onClick={() => setShowDropdown(false)} />
                      </div>

                      <div className="border-t border-white/[0.07] py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#e85d5d] hover:bg-white/[0.06] transition-colors duration-150 cursor-pointer"
                        >
                          {t.nav.signOut}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="btn-ghost hidden sm:inline-flex items-center px-4 py-2 text-sm"
                >
                  {t.nav.signIn}
                </Link>
                <Link
                  href="/signup"
                  className="btn-brand inline-flex items-center px-4 py-2 text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.07] transition-all duration-200 cursor-pointer"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        ) : (
          <div className="w-24 h-8 skeleton" />
        )}
      </div>

      {/* ── Mobile Menu ── */}
      {mounted && mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.08] bg-[#111111]/95 backdrop-blur-xl">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-white bg-white/[0.08] font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                {isActive(link.href) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e85d5d] flex-shrink-0" />
                )}
                {link.label}
              </Link>
            ))}

            {!isLoggedIn && (
              <div className="flex gap-2 pt-3 mt-1 border-t border-white/[0.07]">
                <Link href="/login"  onClick={() => setMobileMenuOpen(false)} className="btn-ghost flex-1 text-center py-2.5 text-sm">
                  {t.nav.signIn}
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="btn-brand flex-1 text-center py-2.5 text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>

    {confirmState && (
      <ConfirmDialog
        title={confirmState.options.title}
        message={confirmState.options.message}
        confirmText={confirmState.options.confirmText}
        cancelText={confirmState.options.cancelText}
        confirmButtonClass={confirmState.options.confirmButtonClass}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    )}
  </>
  );
}

/* ── Dropdown Link Helper ── */
function DropdownLink({
  href, label, onClick, accent,
}: {
  href: string; label: string; onClick: () => void; accent?: "amber" | "red";
}) {
  const colorClass =
    accent === "amber" ? "text-yellow-400" :
    accent === "red"   ? "text-[#e85d5d]"  : "text-white";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-2.5 text-sm ${colorClass} hover:bg-white/[0.06] transition-colors duration-150`}
    >
      {label}
    </Link>
  );
}

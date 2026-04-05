"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/icons/logo";
import { authAPI } from "@/lib/api";
import NotificationBell from "@/components/NotificationBell";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/LanguageContext";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [accountType, setAccountType] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [isSiteAdmin, setIsSiteAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedAccountType = localStorage.getItem("accountType");
      setAccountType(storedAccountType || "player");

      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      if (storedAccountType === "organization") {
        const response = await fetch(`${API_URL}/api/org-auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.data.organization);
        }
      } else {
        const response = await authAPI.getCurrentUser();
        setUser(response.data.user);
        setIsSiteAdmin(response.data.user.isAdmin === true);

        try {
          const adminRes = await fetch(`${API_URL}/api/org-auth/admin-org`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const adminData = await adminRes.json();
          if (adminData.success) {
            setIsOrgAdmin(true);
            localStorage.setItem("isOrgAdmin", "true");
            localStorage.setItem("adminOrgId", adminData.data.organization._id);
            localStorage.setItem("adminOrgName", adminData.data.organization.organizationName);
          } else {
            setIsOrgAdmin(false);
            localStorage.removeItem("isOrgAdmin");
            localStorage.removeItem("adminOrgId");
            localStorage.removeItem("adminOrgName");
          }
        } catch {
          setIsOrgAdmin(false);
          localStorage.removeItem("isOrgAdmin");
          localStorage.removeItem("adminOrgId");
          localStorage.removeItem("adminOrgName");
        }
      }
    } catch {
      setUser(null);
      setAccountType("");
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setAccountType("");
    setIsOrgAdmin(false);
    setIsSiteAdmin(false);
    setShowDropdown(false);
    router.push("/");
  };

  const closeMobile = () => setMobileMenuOpen(false);

  const navLinks = [
    { href: "/tournaments", label: t.nav.tournaments },
    { href: "/esports-data", label: t.nav.esportsData },
    { href: "/games", label: t.nav.games },
    { href: "/watch-now", label: t.nav.watchNow },
    { href: "/about", label: t.nav.about },
  ];

  return (
    <header className="w-full px-4 sm:px-6 py-4 flex items-center justify-between relative z-50">
      {/* Logo and Brand */}
      <Link href="/" className="flex items-center gap-2 sm:gap-3">
        <Logo width={40} height={35} />
        <div className="font-plus-jakarta text-white text-base sm:text-lg font-medium leading-tight">
          Esports<br />Adda
        </div>
      </Link>

      {/* Desktop Navigation Links */}
      <nav className="hidden lg:flex items-center gap-8" suppressHydrationWarning>
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="text-gray-300 hover:text-white transition-colors text-base">
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Right side: Language toggle + Auth + Hamburger */}
      {mounted ? (
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <LanguageToggle />

          {/* Auth Section */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-transparent border-2 border-white rounded-lg px-3 sm:px-6 py-2 text-white font-plus-jakarta text-sm sm:text-base font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <span className="max-w-[100px] sm:max-w-none truncate">
                  {accountType === "organization" ? (user.tag || user.name) : user.username}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform flex-shrink-0 ${showDropdown ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-white/20 rounded-lg shadow-lg overflow-hidden z-50">
                  {accountType === "player" && (
                    <>
                      <Link href="/profile" onClick={() => setShowDropdown(false)} className="block px-4 py-3 text-white hover:bg-white/10 transition-colors">
                        {t.nav.myProfile}
                      </Link>
                      <Link href="/team" onClick={() => setShowDropdown(false)} className="block px-4 py-3 text-white hover:bg-white/10 transition-colors">
                        {t.nav.teamDashboard}
                      </Link>
                      {isOrgAdmin && (
                        <Link href="/admin-dashboard" onClick={() => setShowDropdown(false)} className="block px-4 py-3 text-yellow-400 hover:bg-white/10 transition-colors">
                          {t.nav.orgDashboard}
                        </Link>
                      )}
                      {isSiteAdmin && (
                        <Link href="/admin" onClick={() => setShowDropdown(false)} className="block px-4 py-3 text-red-400 hover:bg-white/10 transition-colors">
                          {t.nav.adminPanel}
                        </Link>
                      )}
                    </>
                  )}
                  {accountType === "organization" && (
                    <>
                      <Link href="/org-profile" onClick={() => setShowDropdown(false)} className="block px-4 py-3 text-white hover:bg-white/10 transition-colors">
                        {t.nav.orgProfile}
                      </Link>
                      <Link href="/org-profile?tab=teams" onClick={() => setShowDropdown(false)} className="block px-4 py-3 text-white hover:bg-white/10 transition-colors">
                        {t.nav.teamManagement}
                      </Link>
                      <Link href="/organizer/dashboard" onClick={() => setShowDropdown(false)} className="block px-4 py-3 text-white hover:bg-white/10 transition-colors">
                        {t.nav.streamDashboard}
                      </Link>
                    </>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/10 transition-colors border-t border-white/10">
                    {t.nav.signOut}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-transparent border-2 border-white rounded-lg px-4 sm:px-6 py-2 text-white font-plus-jakarta text-sm sm:text-base font-semibold hover:bg-white/10 transition-all"
            >
              {t.nav.signIn}
            </Link>
          )}

          {/* Notification Bell — only shown when logged in */}
          {user && <NotificationBell />}

          {/* Hamburger button — visible on mobile/tablet */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="bg-transparent border-2 border-white rounded-lg px-4 sm:px-6 py-2 text-white font-plus-jakarta text-sm sm:text-base font-semibold opacity-0">
            Sign In
          </div>
        </div>
      )}

      {/* Mobile slide-down menu */}
      {mounted && mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#111111]/95 backdrop-blur-md border-b border-white/10 lg:hidden z-50">
          <nav className="flex flex-col px-6 py-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-base py-3 px-3 rounded-lg"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/icons/logo";
import { authAPI } from "@/lib/api";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [accountType, setAccountType] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Get account type from localStorage first
      const storedAccountType = localStorage.getItem("accountType");
      setAccountType(storedAccountType || "player");

      const token = localStorage.getItem("token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      // Call appropriate endpoint based on account type
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

        // Live check if player is admin staff of any org
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
    } catch (error) {
      setUser(null);
      setAccountType("");
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setAccountType("");
    setIsOrgAdmin(false);
    setShowDropdown(false);
    router.push("/");
  };

  return (
    <header className="w-full px-6 py-4 flex items-center justify-between">
      {/* Logo and Brand */}
      <Link href="/" className="flex items-center gap-3">
        <Logo width={50} height={44} />
        <div className="font-plus-jakarta text-white text-lg font-medium leading-tight">
          Esports<br />Adda
        </div>
      </Link>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-8">
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

      {/* Auth Section */}
      {user ? (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-transparent border-2 border-white rounded-lg px-6 py-2 text-white font-plus-jakarta text-base font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
          >
            {accountType === "organization" ? (user.tag || user.name) : user.username}
            <svg
              className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-white/20 rounded-lg shadow-lg overflow-hidden z-50">
              {/* Player Account Menu Items */}
              {accountType === "player" && (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-3 text-white hover:bg-white/10 transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/team"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-3 text-white hover:bg-white/10 transition-colors"
                  >
                    Team Dashboard
                  </Link>
                  {isOrgAdmin && (
                    <Link
                      href="/admin-dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-3 text-yellow-400 hover:bg-white/10 transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </>
              )}

              {/* Organization Account Menu Items */}
              {accountType === "organization" && (
                <>
                  <Link
                    href="/org-profile"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-3 text-white hover:bg-white/10 transition-colors"
                  >
                    Organization Profile
                  </Link>
                  <Link
                    href="/organization"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-3 text-white hover:bg-white/10 transition-colors"
                  >
                    Team Management
                  </Link>
                  <Link
                    href="/organizer/dashboard"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-3 text-white hover:bg-white/10 transition-colors"
                  >
                    Stream Dashboard
                  </Link>
                </>
              )}

              {/* Logout (for both account types) */}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/10 transition-colors border-t border-white/10"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="bg-transparent border-2 border-white rounded-lg px-6 py-2 text-white font-plus-jakarta text-base font-semibold hover:bg-white/10 transition-all"
        >
          Sign In
        </Link>
      )}
    </header>
  );
}

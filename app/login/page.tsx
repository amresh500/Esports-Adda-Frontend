'use client';

import { useState } from "react";
import Link from "next/link";
import { authAPI } from "@/lib/api";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import Logo from "@/components/icons/logo";

/* ── Eye icons ──────────────────────────────────────────────────── */
function EyeOpen() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  );
}
function EyeClosed() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
    </svg>
  );
}

/* ── Input Field ────────────────────────────────────────────────── */
function InputField({
  type, placeholder, value, onChange, children,
}: {
  type: string; placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full px-4 py-3.5 bg-white/[0.06] border border-white/[0.12] rounded-[var(--radius-md)] text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#e85d5d]/60 focus:bg-white/[0.08] transition-all duration-200 pr-12"
      />
      {children && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
          {children}
        </div>
      )}
    </div>
  );
}

const LoginPage = () => {
  const { t }     = useLanguage();
  const { refresh } = useAuth();
  const router    = useRouter();
  const [accountType, setAccountType] = useState<"player" | "organization">("player");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword]       = useState("");
  const [rememberMe, setRememberMe]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!emailOrUsername || !password) { setError("Please fill in all fields"); return; }

    setLoading(true);
    try {
      if (accountType === "player") {
        const response = await authAPI.login({ email: emailOrUsername, password, rememberMe });
        if (response.success) {
          // Cookie is set by server — only store non-sensitive metadata in localStorage
          localStorage.setItem("accountType", "player");
          localStorage.setItem("userId", response.data.user.id);
          await refresh();
          router.push("/tournaments");
        } else {
          setError(response.message || "Login failed");
        }
      } else {
        const response = await api.post('/org-auth/login', { email: emailOrUsername, password, rememberMe });
        // Cookie is set by server — only store non-sensitive metadata in localStorage
        localStorage.setItem("accountType",      "organization");
        localStorage.setItem("userId",           response.data.data.organization.id);
        localStorage.setItem("organizationData", JSON.stringify(response.data.data.organization));
        if (response.data?.data?.token) sessionStorage.setItem('socketToken', response.data.data.token);
        await refresh();
        router.push("/org-profile");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel (brand) — hidden on mobile ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] xl:w-[480px] flex-shrink-0 relative overflow-hidden p-10 border-r border-white/[0.07]">
        {/* Subtle bg treatment */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#110a0a]/60 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-[#e85d5d]/[0.07] blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-[#441415]/40 blur-[60px] pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <Logo width={42} height={38} />
          <span className="font-['Russo_One'] text-white text-xl tracking-wide">Esports Adda</span>
        </div>

        {/* Middle copy */}
        <div className="relative space-y-6">
          <h2 className="font-['Russo_One'] text-3xl xl:text-4xl text-white leading-tight">
            Compete at the<br />
            <span className="text-[#e85d5d]">highest level</span>
          </h2>
          <p className="text-white/45 text-sm leading-relaxed max-w-xs">
            Nepal's premier esports platform. Find tournaments, build your team, and make your mark in the competitive scene.
          </p>

        </div>

        {/* Bottom tagline */}
        <p className="relative text-white/25 text-xs">© 2025 Esports Adda</p>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">

        {/* Mobile logo */}
        <div className="lg:hidden absolute top-5 left-5 flex items-center gap-2.5">
          <Logo width={32} height={28} />
          <span className="font-['Russo_One'] text-white text-base">Esports Adda</span>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="font-['Russo_One'] text-3xl text-white mb-2">
              {t.auth.login}
            </h1>
            <p className="text-white/45 text-sm">
              {t.auth.noAccount}{" "}
              <Link href="/signup" className="text-[#e85d5d] hover:underline font-medium">
                {t.auth.signUpLink}
              </Link>
            </p>
          </div>

          {/* Account type toggle */}
          <div className="flex gap-1 p-1 bg-white/[0.06] rounded-[var(--radius-md)] border border-white/[0.08] mb-6">
            {(["player", "organization"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setAccountType(type)}
                className={`flex-1 py-2.5 rounded-[var(--radius-sm)] text-sm font-semibold transition-all duration-200 cursor-pointer capitalize ${
                  accountType === type
                    ? "bg-[#e85d5d] text-white shadow-sm"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {type === "player" ? "Player" : "Organization"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-[#e85d5d]/10 border border-[#e85d5d]/25 rounded-[var(--radius-md)]" role="alert">
                <svg className="w-4 h-4 text-[#e85d5d] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-[#e85d5d] text-sm leading-snug">{error}</p>
              </div>
            )}

            {/* Email / Username */}
            <div>
              <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {accountType === "player" ? "Email or Username" : "Email"}
              </label>
              <InputField
                type="text"
                placeholder={accountType === "player" ? "your@email.com or username" : "your@email.com"}
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-1.5">
                {t.auth.passwordLabel}
              </label>
              <InputField
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              >
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="cursor-pointer"
                >
                  {showPassword ? <EyeClosed /> : <EyeOpen />}
                </button>
              </InputField>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-all duration-150 ${
                    rememberMe ? "bg-[#e85d5d] border-[#e85d5d]" : "border-white/25 bg-transparent"
                  }`}
                >
                  {rememberMe && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                </div>
                <span className="text-white/55 text-sm">{t.auth.rememberMe}</span>
              </label>
              <Link href="/forgot-password" className="text-white/55 text-sm hover:text-white transition-colors duration-200">
                {t.auth.forgotPassword}
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-brand w-full py-3.5 text-base font-semibold mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {t.common.loading}
                </>
              ) : t.auth.login}
            </button>

            {/* Org login shortcut */}
            {accountType === "player" && (
              <p className="text-center text-white/35 text-xs pt-1">
                Are you an organization?{" "}
                <button
                  type="button"
                  onClick={() => setAccountType("organization")}
                  className="text-white/55 hover:text-white underline transition-colors cursor-pointer"
                >
                  Switch account type
                </button>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

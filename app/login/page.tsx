'use client';

import Google from "@/components/icons/google";
import Logo from "@/components/icons/logo";

import { useState } from "react";
import Link from "next/link";
import { authAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useLanguage } from "@/lib/LanguageContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const LoginPage = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [accountType, setAccountType] = useState<"player" | "organization">("player");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailOrUsername || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (accountType === "player") {
        // Player login
        const response = await authAPI.login({ email: emailOrUsername, password, rememberMe });

        if (response.success) {
          // Store account type, user ID, and admin flag for player
          localStorage.setItem("accountType", "player");
          localStorage.setItem("userId", response.data.user.id);
          if (response.data.user.isAdmin) {
            localStorage.setItem("isAdmin", "true");
          } else {
            localStorage.removeItem("isAdmin");
          }

          // Check if player is an Admin staff member of any organization
          try {
            const adminCheck = await axios.get(`${API_URL}/api/org-auth/admin-org`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (adminCheck.data.success) {
              localStorage.setItem("isOrgAdmin", "true");
              localStorage.setItem("adminOrgId", adminCheck.data.data.organization._id);
              localStorage.setItem("adminOrgName", adminCheck.data.data.organization.organizationName);
            }
          } catch {
            // Not an admin staff — that's fine
            localStorage.removeItem("isOrgAdmin");
            localStorage.removeItem("adminOrgId");
            localStorage.removeItem("adminOrgName");
          }

          router.push('/tournaments');
        } else {
          setError(response.message || "Login failed");
        }
      } else {
        // Organization login
        const response = await axios.post(`${API_URL}/api/org-auth/login`, {
          email: emailOrUsername,
          password,
          rememberMe
        });

        // Store token, account type, and user ID
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("accountType", "organization");
        localStorage.setItem("userId", response.data.data.organization.id);
        localStorage.setItem("organizationData", JSON.stringify(response.data.data.organization));

        // Redirect to organization profile
        router.push("/org-profile");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log("Sign in with Google");
  };

  return (
    <div className="min-h-screen w-full bg-primary-gradient flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Logo */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-3">
        <Logo width={69} height={60} />
        <div className="font-plus-jakarta text-white text-lg sm:text-[20px] font-medium leading-tight">
          Esports<br />Adda
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-[550px] mx-auto">
        <div className="bg-white/5 backdrop-blur-[3.1px] rounded-[20px] shadow-[4px_4px_21.2px_rgba(0,0,0,0.25)] p-6 sm:p-8 md:p-10">
          {/* Sign In Heading */}
          <h1 className="text-white text-center font-inter text-3xl sm:text-4xl lg:text-[36px] font-bold tracking-[-0.72px] mb-4">
            {t.auth.login}
          </h1>

          {/* Account Type Toggle */}
          <div className="flex gap-2 p-1 bg-white/10 rounded-lg mb-6">
            <button
              onClick={() => setAccountType("player")}
              className={`flex-1 py-2.5 rounded-md font-inter text-sm font-semibold transition-all ${
                accountType === "player"
                  ? "bg-white text-black"
                  : "text-white hover:bg-white/10"
              }`}
            >
              🎮 Player
            </button>
            <button
              onClick={() => setAccountType("organization")}
              className={`flex-1 py-2.5 rounded-md font-inter text-sm font-semibold transition-all ${
                accountType === "organization"
                  ? "bg-white text-black"
                  : "text-white hover:bg-white/10"
              }`}
            >
              🏢 Organization
            </button>
          </div>

          {/* Google Sign In Button - Only for players */}
          {accountType === "player" && (
            <>
              <button
                onClick={handleGoogleSignIn}
                type="button"
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 mb-5"
              >
                <Google height={24} width={24}/>
                <span className="font-plus-jakarta text-gray-800 text-base font-semibold">
                  {t.auth.loginWithGoogle}
                </span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 h-[1px] bg-[#D9D9D9]"></div>
                <span className="text-[#D1D6E2] font-inter text-sm">or with credentials</span>
                <div className="flex-1 h-[1px] bg-[#D9D9D9]"></div>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4 sm:space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
                <p className="text-red-500 text-sm font-inter">{error}</p>
              </div>
            )}

            {/* Email or Username Input */}
            <div>
              <input
                type="text"
                placeholder={accountType === "player" ? "Email or Username" : "Email"}
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full px-3.5 py-4 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t.auth.passwordLabel}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-4 pr-12 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-6 h-6 rounded border-2 border-white flex items-center justify-center transition-colors ${
                      rememberMe ? "bg-white/10" : "bg-transparent"
                    }`}
                  >
                    {rememberMe && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-white font-plus-jakarta text-base sm:text-lg">
                  {t.auth.rememberMe}
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-white font-plus-jakarta text-base sm:text-lg hover:underline"
              >
                {t.auth.forgotPassword}
              </Link>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-2">
              <span className="text-white font-plus-jakarta text-base">
                {t.auth.noAccount}{" "}
              </span>
              <Link
                href="/signup"
                className="text-white font-plus-jakarta text-base font-bold hover:underline transition-all"
              >
                {t.auth.signUpLink}
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-transparent border-2 border-white rounded-lg py-4 text-white font-plus-jakarta text-lg font-semibold hover:bg-white/10 active:scale-[0.98] transition-all duration-200 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.common.loading : t.auth.login}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

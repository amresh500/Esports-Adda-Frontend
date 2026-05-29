'use client';

import Logo from "@/components/icons/logo";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";

// Strict password policy — keep in sync with backend src/utils/passwordPolicy.js
const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function isPasswordStrong(password: string) {
  return PASSWORD_RULES.every((r) => r.test(password));
}

function PasswordChecklist({ password }: { password: string }) {
  if (!password) return null;
  return (
    <ul className="space-y-1">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li
            key={rule.label}
            className={`text-sm ${ok ? "text-green-400" : "text-white/50"}`}
          >
            {ok ? "✓" : "•"} {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for OTP resend
  useEffect(() => {
    if (step !== 2) return;
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [step, timer]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(email.trim());
      setInfo(res.message || "If an account exists, a reset code has been sent.");
      setStep(2);
      setTimer(60);
      setCanResend(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^[0-9]$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    setLoading(true);
    try {
      await authAPI.verifyResetOTP(email.trim(), otpValue);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setInfo("");
    try {
      await authAPI.forgotPassword(email.trim());
      setInfo("A new code has been sent.");
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend code");
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!isPasswordStrong(newPassword)) {
      setError("Password must be 8+ characters with uppercase, lowercase, a number, and a special character");
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(email.trim(), otp.join(""), newPassword);
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
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

      {/* Main Card */}
      <div className="w-full max-w-[550px] mx-auto">
        <div className="bg-white/5 backdrop-blur-[3.1px] rounded-[20px] shadow-[4px_4px_21.2px_rgba(0,0,0,0.25)] p-6 sm:p-8 md:p-10">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg mb-4">
              <p className="text-red-400 text-sm font-inter">{error}</p>
            </div>
          )}
          {info && !error && (
            <div className="p-3 bg-green-500/10 border border-green-500 rounded-lg mb-4">
              <p className="text-green-400 text-sm font-inter">{info}</p>
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 1 && (
            <>
              <h1 className="text-white text-center font-inter text-3xl sm:text-4xl font-bold mb-2">
                Forgot Password?
              </h1>
              <p className="text-white/70 text-center mb-8">
                Enter your email and we&apos;ll send you a code to reset your password
              </p>
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-4 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-transparent border-2 border-white rounded-lg py-4 text-white font-plus-jakarta text-lg font-semibold hover:bg-white/10 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Code"}
                </button>
                <div className="text-center">
                  <Link href="/login" className="text-white/70 hover:text-white hover:underline text-sm">
                    Back to login
                  </Link>
                </div>
              </form>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              <h1 className="text-white text-center font-inter text-3xl sm:text-4xl font-bold mb-2">
                Enter Code
              </h1>
              <p className="text-white/70 text-center mb-8">
                We&apos;ve sent a 6-digit code to {email}
              </p>
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-transparent border-2 border-white rounded-lg py-4 text-white font-plus-jakarta text-lg font-semibold hover:bg-white/10 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>
                <div className="text-center">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-white font-semibold hover:underline"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <p className="text-white/50">
                      Resend code in {timer}s
                    </p>
                  )}
                </div>
              </form>
            </>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <>
              <h1 className="text-white text-center font-inter text-3xl sm:text-4xl font-bold mb-2">
                Reset Password
              </h1>
              <p className="text-white/70 text-center mb-8">
                Enter your new password below
              </p>
              <form onSubmit={handlePasswordReset} className="space-y-5">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-4 pr-12 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <PasswordChecklist password={newPassword} />

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-4 pr-12 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-transparent border-2 border-white rounded-lg py-4 text-white font-plus-jakarta text-lg font-semibold hover:bg-white/10 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

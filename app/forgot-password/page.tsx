'use client';

import Logo from "@/components/icons/logo";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const ForgotPassword = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for OTP resend
  useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email");
      return;
    }
    console.log("Sending OTP to:", email);
    setStep('otp');
    setTimer(60);
    setCanResend(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);
    
    const nextEmptyIndex = newOtp.findIndex(val => !val);
    if (nextEmptyIndex !== -1) {
      otpRefs.current[nextEmptyIndex]?.focus();
    } else {
      otpRefs.current[5]?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      alert("Please enter the complete OTP");
      return;
    }
    console.log("Verifying OTP:", otpValue);
    setStep('reset');
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    console.log("Resending OTP to:", email);
    setTimer(60);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    otpRefs.current[0]?.focus();
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }
    console.log("Password reset successful");
    // Redirect to login
    window.location.href = '/login';
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
          
          {/* Step 1: Email Input */}
          {step === 'email' && (
            <>
              <h1 className="text-white text-center font-inter text-3xl sm:text-4xl lg:text-[36px] font-bold tracking-[-0.72px] mb-3">
                Forgot Password?
              </h1>
              <p className="text-white/70 text-center font-plus-jakarta text-sm sm:text-base mb-6 sm:mb-8">
                Enter your email address and we'll send you an OTP to reset your password.
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <label className="text-white font-plus-jakarta text-sm mb-2 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-4 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-transparent border-2 border-white rounded-lg py-4 text-white font-plus-jakarta text-lg font-semibold hover:bg-white/10 active:scale-[0.98] transition-all duration-200"
                >
                  Send OTP
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="text-white font-plus-jakarta text-base hover:underline transition-all inline-flex items-center gap-2"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back to Sign In
                  </Link>
                </div>
              </form>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <>
              <h1 className="text-white text-center font-inter text-3xl sm:text-4xl lg:text-[36px] font-bold tracking-[-0.72px] mb-3">
                Verify OTP
              </h1>
              <p className="text-white/70 text-center font-plus-jakarta text-sm sm:text-base mb-2">
                We've sent a 6-digit code to
              </p>
              <p className="text-white text-center font-plus-jakarta text-base font-semibold mb-6 sm:mb-8">
                {email}
              </p>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                {/* OTP Input Fields */}
                <div className="flex justify-center gap-2 sm:gap-3">
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
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className="w-12 h-12 sm:w-14 sm:h-14 bg-white border border-gray-300 rounded-lg text-center text-xl sm:text-2xl font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all"
                    />
                  ))}
                </div>

                {/* Timer and Resend */}
                <div className="text-center">
                  {!canResend ? (
                    <p className="text-white/70 font-plus-jakarta text-sm">
                      Resend OTP in <span className="font-bold text-white">{timer}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-white font-plus-jakarta text-base font-semibold hover:underline transition-all"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-transparent border-2 border-white rounded-lg py-4 text-white font-plus-jakarta text-lg font-semibold hover:bg-white/10 active:scale-[0.98] transition-all duration-200"
                >
                  Verify OTP
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-white font-plus-jakarta text-base hover:underline transition-all inline-flex items-center gap-2"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Change Email
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: Reset Password */}
          {step === 'reset' && (
            <>
              <h1 className="text-white text-center font-inter text-3xl sm:text-4xl lg:text-[36px] font-bold tracking-[-0.72px] mb-3">
                Reset Password
              </h1>
              <p className="text-white/70 text-center font-plus-jakarta text-sm sm:text-base mb-6 sm:mb-8">
                Enter your new password below
              </p>

              <form onSubmit={handlePasswordReset} className="space-y-4 sm:space-y-5">
                {/* New Password */}
                <div>
                  <label className="text-white font-plus-jakarta text-sm mb-2 block">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-4 pr-12 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showNewPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-white font-plus-jakarta text-sm mb-2 block">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-4 pr-12 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-white/5 rounded-lg p-3 sm:p-4">
                  <p className="text-white/90 font-plus-jakarta text-xs sm:text-sm mb-2">
                    Password must contain:
                  </p>
                  <ul className="space-y-1 text-white/70 font-plus-jakarta text-xs sm:text-sm">
                    <li className="flex items-center gap-2">
                      <span className={newPassword.length >= 8 ? "text-green-400" : ""}>
                        {newPassword.length >= 8 ? "✓" : "•"}
                      </span>
                      At least 8 characters
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={/[A-Z]/.test(newPassword) ? "text-green-400" : ""}>
                        {/[A-Z]/.test(newPassword) ? "✓" : "•"}
                      </span>
                      One uppercase letter
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={/[0-9]/.test(newPassword) ? "text-green-400" : ""}>
                        {/[0-9]/.test(newPassword) ? "✓" : "•"}
                      </span>
                      One number
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  className="w-full bg-transparent border-2 border-white rounded-lg py-4 text-white font-plus-jakarta text-lg font-semibold hover:bg-white/10 active:scale-[0.98] transition-all duration-200 mt-4"
                >
                  Reset Password
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
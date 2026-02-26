'use client';

import Logo from "@/components/icons/logo";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const VerifyEmailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${API_URL}/api/auth/verify-email/${token}`);

        if (response.status === 200) {
          setStatus('success');
          setMessage(response.data.message || 'Email verified successfully! You can now log in.');

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
          'Verification failed. The link may be invalid or expired.'
        );
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen w-full bg-primary-gradient flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Logo */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-3">
        <Logo width={69} height={60} />
        <div className="font-plus-jakarta text-white text-lg sm:text-[20px] font-medium leading-tight">
          Esports<br />Adda
        </div>
      </div>

      {/* Verification Card */}
      <div className="w-full max-w-[550px] mx-auto">
        <div className="bg-white/5 backdrop-blur-[3.1px] rounded-[20px] shadow-[4px_4px_21.2px_rgba(0,0,0,0.25)] p-6 sm:p-8 md:p-10">
          <h1 className="text-white text-center font-inter text-3xl sm:text-4xl lg:text-[36px] font-bold tracking-[-0.72px] mb-6 sm:mb-8">
            Email Verification
          </h1>

          <div className="flex flex-col items-center justify-center space-y-6">
            {status === 'loading' && (
              <>
                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                <p className="text-white font-inter text-lg text-center">
                  Verifying your email...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-white font-inter text-lg text-center">
                  {message}
                </p>
                <p className="text-white/70 font-inter text-sm text-center">
                  Redirecting to login page...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <p className="text-white font-inter text-lg text-center">
                  {message}
                </p>
                <Link
                  href="/login"
                  className="bg-transparent border-2 border-white rounded-lg px-8 py-3 text-white font-plus-jakarta text-base font-semibold hover:bg-white/10 active:scale-[0.98] transition-all duration-200"
                >
                  Go to Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default VerifyEmailPage;

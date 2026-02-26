"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function VerifyOrganization() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/org-auth/verify/${token}`);
      setStatus("success");
      setMessage(response.data.message || "Email verified successfully!");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/org-login");
      }, 3000);
    } catch (error: any) {
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          "Verification failed. The link may be invalid or expired."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415]">
      <Header />
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <h1 className="text-3xl font-bold text-white mb-6">
            Organization Email Verification
          </h1>

          {status === "loading" && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
              <p className="text-gray-300">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="text-6xl mb-4">✓</div>
              <div className="bg-green-500/20 border border-green-500 text-green-200 px-6 py-4 rounded-lg">
                {message}
              </div>
              <p className="text-gray-300">Redirecting to login page...</p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="text-6xl mb-4">✗</div>
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg">
                {message}
              </div>
              <button
                onClick={() => router.push("/org-signup")}
                className="mt-4 px-6 py-3 bg-white/10 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/20 hover:border-white/50 transition-all"
              >
                Back to Signup
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

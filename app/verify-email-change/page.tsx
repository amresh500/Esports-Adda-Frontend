'use client';

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/icons/logo";
import { authAPI } from "@/lib/api";

export default function VerifyEmailChangePage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No token provided.");
      return;
    }
    (async () => {
      try {
        const res = await authAPI.verifyEmailChange(token);
        setStatus("success");
        setMessage(res.message || "Email updated. Please log in with your new email.");
        // After 3s, send them to login since their session is still tied to the old email
        setTimeout(() => router.push("/login"), 3000);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Failed to verify email change.");
      }
    })();
  }, [token, router]);

  return (
    <div className="min-h-screen w-full bg-primary-gradient flex items-center justify-center p-4">
      <div className="absolute top-4 left-4 flex items-center gap-3">
        <Logo width={56} height={48} />
        <div className="font-plus-jakarta text-white text-base font-medium leading-tight">
          Esports<br />Adda
        </div>
      </div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center space-y-4">
        <h1 className="text-white text-2xl font-bold">
          {status === "loading" && "Confirming your new email..."}
          {status === "success" && "Email updated"}
          {status === "error" && "Couldn't update email"}
        </h1>
        {status !== "loading" && (
          <p
            className={`text-sm ${
              status === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
        {status === "error" && (
          <Link
            href="/settings"
            className="inline-block mt-4 text-white/80 hover:text-white underline text-sm"
          >
            Back to settings
          </Link>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/LanguageContext";

export default function OrganizationLogin() {
  const { t } = useLanguage();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post('/org-auth/login', formData);

      // Store token and account type
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("accountType", "organization");
      localStorage.setItem("organizationData", JSON.stringify(response.data.data.organization));

      // Redirect to organization profile
      router.push("/org-profile");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415]">
      <Header />
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-2 text-center">
            {t.auth.orgLogin}
          </h1>
          <p className="text-gray-300 text-center mb-8">
            {t.auth.loginSubtitle}
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-white mb-2">{t.auth.emailLabel}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                placeholder="organization@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white mb-2">{t.auth.passwordLabel}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                placeholder="Enter password"
                required
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <label htmlFor="rememberMe" className="text-white">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/10 border border-white/30 text-white py-4 rounded-lg font-bold text-lg hover:bg-white/20 hover:border-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.common.loading : t.auth.login}
            </button>
          </form>

          <p className="text-gray-300 text-center mt-6">
            {t.auth.noAccount}{" "}
            <Link href="/org-signup" className="text-white font-semibold hover:underline">
              {t.auth.signUpLink}
            </Link>
          </p>

          <p className="text-gray-300 text-center mt-4">
            Are you a player?{" "}
            <Link href="/login" className="text-white font-semibold hover:underline">
              Player login
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

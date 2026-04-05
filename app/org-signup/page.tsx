"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/LanguageContext";

export default function OrganizationSignup() {
  const { t } = useLanguage();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    tag: "",
    country: "",
    isNepal: false,
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (formData.organizationName.length < 3) {
      setError("Organization name must be at least 3 characters");
      return;
    }

    if (formData.tag.length < 2 || formData.tag.length > 10) {
      setError("Tag must be between 2 and 10 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/org-auth/signup', formData);

      setSuccess(response.data.message || "Organization registered successfully! Please check your email to verify your account.");

      // Reset form
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        organizationName: "",
        tag: "",
        country: "",
        isNepal: false,
        description: "",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/org-login");
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415]">
      <Header />
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-2 text-center">
            {t.auth.orgSignup}
          </h1>
          <p className="text-gray-300 text-center mb-8">
            {t.auth.signupSubtitle}
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 px-6 py-4 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-white mb-2">{t.auth.emailLabel} *</label>
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

            {/* Organization Name */}
            <div>
              <label className="block text-white mb-2">{t.auth.orgName} *</label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                placeholder="Enter organization name"
                minLength={3}
                maxLength={100}
                required
              />
            </div>

            {/* Tag */}
            <div>
              <label className="block text-white mb-2">{t.auth.orgTag} *</label>
              <input
                type="text"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 uppercase"
                placeholder="TAG"
                minLength={2}
                maxLength={10}
                required
              />
              <p className="text-gray-400 text-sm mt-1">
                Short tag for your organization (2-10 characters)
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-white mb-2">{t.auth.passwordLabel} *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                placeholder="Enter password"
                minLength={8}
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-white mb-2">{t.auth.confirmPasswordLabel} *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                placeholder="Confirm password"
                minLength={8}
                required
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-white mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                placeholder="Enter country"
              />
            </div>

            {/* Is Nepal Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isNepal"
                name="isNepal"
                checked={formData.isNepal}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <label htmlFor="isNepal" className="text-white">
                Organization based in Nepal
              </label>
            </div>

            {/* Description */}
            <div>
              <label className="block text-white mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                placeholder="Tell us about your organization..."
                maxLength={2000}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/10 border border-white/30 text-white py-4 rounded-lg font-bold text-lg hover:bg-white/20 hover:border-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.common.loading : t.auth.orgSignup}
            </button>
          </form>

          <p className="text-gray-300 text-center mt-6">
            {t.auth.hasAccount}{" "}
            <Link href="/org-login" className="text-white font-semibold hover:underline">
              {t.auth.signInLink}
            </Link>
          </p>

          <p className="text-gray-300 text-center mt-4">
            Are you a player?{" "}
            <Link href="/signup" className="text-white font-semibold hover:underline">
              Create player account
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

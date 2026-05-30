'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/icons/logo";
import { authAPI } from "@/lib/api";

// Strict password policy — keep in sync with backend src/utils/passwordPolicy.js
const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];
const isPasswordStrong = (p: string) => PASSWORD_RULES.every((r) => r.test(p));

function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-2 space-y-1">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li
            key={rule.label}
            className={`text-sm transition-colors ${ok ? "text-green-400" : "text-white/50"}`}
          >
            {ok ? "✓" : "•"} {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

type TabKey = "account" | "profile" | "notifications" | "privacy" | "sessions";

const TABS: { key: TabKey; label: string; enabled: boolean }[] = [
  { key: "account", label: "Account", enabled: true },
  { key: "profile", label: "Profile", enabled: false },
  { key: "notifications", label: "Notifications", enabled: false },
  { key: "privacy", label: "Privacy", enabled: false },
  { key: "sessions", label: "Sessions", enabled: false },
];

const inputClass =
  "w-full px-3.5 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-inter text-sm focus:outline-none focus:ring-2 focus:ring-white/30";

const sectionCardClass =
  "bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6 space-y-4";

const labelClass = "block text-white/80 text-sm font-medium";

function Banner({
  kind,
  text,
}: {
  kind: "error" | "success";
  text: string;
}) {
  const tone =
    kind === "error"
      ? "bg-red-500/10 border-red-500 text-red-300"
      : "bg-green-500/10 border-green-500 text-green-300";
  return (
    <div className={`p-3 border rounded-lg text-sm ${tone}`}>{text}</div>
  );
}

function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    if (!isPasswordStrong(newPassword)) {
      setError("New password doesn't meet the requirements below");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.changePassword(currentPassword, newPassword);
      setSuccess(res.message || "Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Force re-login since the password changed
      setTimeout(async () => {
        await authAPI.logout();
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={sectionCardClass}>
      <h2 className="text-white text-lg font-semibold">Change password</h2>
      <p className="text-white/60 text-sm">
        You&apos;ll be logged out and need to sign in again with the new password.
      </p>
      {error && <Banner kind="error" text={error} />}
      {success && <Banner kind="success" text={success} />}
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className={labelClass}>Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className={labelClass}>New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
          />
          <PasswordChecklist password={newPassword} />
        </div>
        <div>
          <label className={labelClass}>Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}

function ChangeEmailCard() {
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!newEmail || !currentPassword) {
      setError("Both fields are required");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.changeEmail(newEmail.trim(), currentPassword);
      setSuccess(res.message || "Confirmation email sent.");
      setNewEmail("");
      setCurrentPassword("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to request email change");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={sectionCardClass}>
      <h2 className="text-white text-lg font-semibold">Change email</h2>
      <p className="text-white/60 text-sm">
        We&apos;ll send a confirmation link to your new address. Your current email
        stays active until you click that link.
      </p>
      {error && <Banner kind="error" text={error} />}
      {success && <Banner kind="success" text={success} />}
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className={labelClass}>New email</label>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className={inputClass}
            placeholder="new@example.com"
          />
        </div>
        <div>
          <label className={labelClass}>Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Sending..." : "Send confirmation"}
        </button>
      </form>
    </div>
  );
}

function DeleteAccountCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const REQUIRED_CONFIRM = "DELETE";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (confirmText !== REQUIRED_CONFIRM) {
      setError(`Type ${REQUIRED_CONFIRM} to confirm`);
      return;
    }
    if (!currentPassword) {
      setError("Current password is required");
      return;
    }
    if (!confirm("Are you sure? You can restore within 30 days, but this will log you out.")) {
      return;
    }
    setLoading(true);
    try {
      await authAPI.deleteAccount(currentPassword);
      await authAPI.logout();
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete account");
      setLoading(false);
    }
  };

  return (
    <div className="bg-red-500/5 border border-red-500/30 rounded-xl p-5 sm:p-6 space-y-4">
      <h2 className="text-red-300 text-lg font-semibold">Delete account</h2>
      <p className="text-white/60 text-sm">
        Your account will be scheduled for deletion. You can restore it within
        30 days by logging back in. After 30 days, it&apos;s gone for good.
      </p>
      {error && <Banner kind="error" text={error} />}
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className={labelClass}>Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className={labelClass}>
            Type <span className="font-mono text-red-300">{REQUIRED_CONFIRM}</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Deleting..." : "Delete my account"}
        </button>
      </form>
    </div>
  );
}

function ComingSoonPanel({ title }: { title: string }) {
  return (
    <div className={sectionCardClass}>
      <h2 className="text-white text-lg font-semibold">{title}</h2>
      <p className="text-white/60 text-sm">Coming soon.</p>
    </div>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState<TabKey>("account");

  return (
    <div className="min-h-screen w-full bg-primary-gradient p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3 text-white">
          <Logo width={40} height={36} />
          <span className="font-plus-jakarta text-base font-medium leading-tight">
            Esports<br />Adda
          </span>
        </Link>
        <h1 className="text-white text-2xl sm:text-3xl font-bold ml-4">Settings</h1>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="bg-white/5 border border-white/10 rounded-xl p-3 h-fit">
          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {TABS.map((tab) => {
              const isActive = active === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActive(tab.key)}
                  disabled={!tab.enabled}
                  className={`text-left px-4 py-2.5 rounded-lg text-sm whitespace-nowrap transition ${
                    isActive
                      ? "bg-white text-black font-semibold"
                      : tab.enabled
                      ? "text-white/80 hover:bg-white/10"
                      : "text-white/30 cursor-not-allowed"
                  }`}
                >
                  {tab.label}
                  {!tab.enabled && (
                    <span className="ml-2 text-xs">(soon)</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Panel */}
        <main className="space-y-5">
          {active === "account" && (
            <>
              <ChangePasswordCard />
              <ChangeEmailCard />
              <DeleteAccountCard />
            </>
          )}
          {active === "profile" && <ComingSoonPanel title="Profile" />}
          {active === "notifications" && <ComingSoonPanel title="Notifications" />}
          {active === "privacy" && <ComingSoonPanel title="Privacy" />}
          {active === "sessions" && <ComingSoonPanel title="Sessions" />}
        </main>
      </div>
    </div>
  );
}

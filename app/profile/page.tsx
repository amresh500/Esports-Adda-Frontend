"use client";

import { useState, useEffect } from "react";
import api from '@/lib/api';
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/ToastContainer";
import ConfirmDialog from "@/components/ConfirmDialog";
import SaveButton from "@/components/SaveButton";
import PlayerStatsTab from "@/components/PlayerStatsTab";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";


const GAMES = [
  "Valorant", "CS2", "PUBG Mobile", "Dota 2", "League of Legends",
  "Free Fire", "Mobile Legends", "Apex Legends", "Call of Duty",
  "Rainbow Six Siege", "Other",
];

const GAME_COLORS: Record<string, { accent: string; bg: string; border: string; text: string }> = {
  "Valorant":           { accent: "#FF4655", bg: "rgba(255,70,85,0.08)",   border: "rgba(255,70,85,0.25)",  text: "#FF6B77" },
  "CS2":                { accent: "#F0A030", bg: "rgba(240,160,48,0.08)",  border: "rgba(240,160,48,0.25)", text: "#F0B050" },
  "PUBG Mobile":        { accent: "#F5A623", bg: "rgba(245,166,35,0.08)",  border: "rgba(245,166,35,0.25)", text: "#F5B843" },
  "Dota 2":             { accent: "#C23C2A", bg: "rgba(194,60,42,0.08)",   border: "rgba(194,60,42,0.25)",  text: "#D85A44" },
  "League of Legends":  { accent: "#0BC4E4", bg: "rgba(11,196,228,0.08)",  border: "rgba(11,196,228,0.25)", text: "#2BD4F4" },
  "Free Fire":          { accent: "#FF6600", bg: "rgba(255,102,0,0.08)",   border: "rgba(255,102,0,0.25)",  text: "#FF7720" },
  "Mobile Legends":     { accent: "#1E90FF", bg: "rgba(30,144,255,0.08)",  border: "rgba(30,144,255,0.25)", text: "#3EA8FF" },
  "Apex Legends":       { accent: "#DA292A", bg: "rgba(218,41,42,0.08)",   border: "rgba(218,41,42,0.25)",  text: "#EA4545" },
  "Call of Duty":       { accent: "#7CFC00", bg: "rgba(124,252,0,0.08)",   border: "rgba(124,252,0,0.25)",  text: "#90FF20" },
  "Rainbow Six Siege":  { accent: "#1C9BE6", bg: "rgba(28,155,230,0.08)",  border: "rgba(28,155,230,0.25)", text: "#3AB0F0" },
};
const defaultColor = { accent: "#e85d5d", bg: "rgba(232,93,93,0.08)", border: "rgba(232,93,93,0.25)", text: "#e85d5d" };

function gameColor(game: string) { return GAME_COLORS[game] ?? defaultColor; }

/* ─── tiny social icon SVGs ─── */
function TwitterIcon()   { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>; }
function TwitchIcon()    { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>; }
function YoutubeIcon()   { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>; }
function DiscordIcon()   { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.035.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>; }
function InstagramIcon() { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>; }

const socialConfig = [
  { key: "twitter",   label: "Twitter",   icon: <TwitterIcon />,   color: "text-sky-400   border-sky-500/25   bg-sky-500/8",     placeholder: "https://x.com/username" },
  { key: "twitch",    label: "Twitch",    icon: <TwitchIcon />,    color: "text-purple-400 border-purple-500/25 bg-purple-500/8", placeholder: "https://twitch.tv/username" },
  { key: "youtube",   label: "YouTube",   icon: <YoutubeIcon />,   color: "text-[#e85d5d]  border-[#e85d5d]/25  bg-[#e85d5d]/8",  placeholder: "https://youtube.com/@username" },
  { key: "discord",   label: "Discord",   icon: <DiscordIcon />,   color: "text-indigo-400 border-indigo-500/25 bg-indigo-500/8", placeholder: "username or invite link" },
  { key: "instagram", label: "Instagram", icon: <InstagramIcon />, color: "text-pink-400   border-pink-500/25   bg-pink-500/8",   placeholder: "https://instagram.com/username" },
] as const;

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
export default function PlayerProfilePage() {
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

  const [profile, setProfile]               = useState<any>(null);
  const [loading, setLoading]               = useState(true);
  const [activeTab, setActiveTab]           = useState<"profile" | "stats" | "games" | "achievements">("profile");
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [editingGame, setEditingGame]       = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [adminOrg, setAdminOrg]             = useState<any>(null);
  const [savingProfile, setSavingProfile]   = useState(false);
  const [savingGame, setSavingGame]         = useState(false);

  const [profileForm, setProfileForm] = useState({
    realName: "", bio: "", country: "", city: "", isNepal: false, dateOfBirth: "",
    socialLinks: { twitter: "", twitch: "", youtube: "", discord: "", instagram: "" },
  });
  const [gameForm, setGameForm] = useState({
    game: "Valorant", rank: "", role: "", inGameName: "", isPrimary: false,
  });
  useEffect(() => { fetchProfile(); checkAdminStatus(); }, []);

  useEffect(() => {
    if (!isEditingProfile) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setIsEditingProfile(false); fetchProfile(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isEditingProfile]);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/profile/my`);
      const p = response.data.data.profile;
      setProfile(p);
      setProfileForm({
        realName: p.realName || "", bio: p.bio || "", country: p.country || "",
        city: p.city || "", isNepal: p.isNepal || false,
        dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split("T")[0] : "",
        socialLinks: p.socialLinks || { twitter: "", twitch: "", youtube: "", discord: "", instagram: "" },
      });
      setLoading(false);
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to fetch profile");
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const r = await api.get(`/org-auth/admin-org`);
      if (r.data.success) {
        setAdminOrg(r.data.data.organization);
        localStorage.setItem("isOrgAdmin",   "true");
        localStorage.setItem("adminOrgId",   r.data.data.organization._id);
        localStorage.setItem("adminOrgName", r.data.data.organization.organizationName);
      }
    } catch {
      setAdminOrg(null);
      localStorage.removeItem("isOrgAdmin");
      localStorage.removeItem("adminOrgId");
      localStorage.removeItem("adminOrgName");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await confirm({
      title: "Save changes?",
      message: "Are you sure you want to update your profile?",
      confirmText: "Yes, Save",
      cancelText: "Cancel",
      confirmButtonClass: "bg-[#e85d5d] hover:bg-[#d94f4f]",
    });
    if (!ok) return;
    setSavingProfile(true);
    try {
      await api.put(`/profile`, profileForm);
      showSuccess("Profile updated!");
      setIsEditingProfile(false);
      fetchProfile();
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameForm.rank) { showError("Please enter your rank"); return; }
    setSavingGame(true);
    try {
      await api.post(`/profile/games`, gameForm);
      showSuccess(editingGame ? "Game updated!" : "Game added!");
      setGameForm({ game: "Valorant", rank: "", role: "", inGameName: "", isPrimary: false });
      setShowAddGameModal(false);
      setEditingGame(null);
      fetchProfile();
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to add/update game");
    } finally {
      setSavingGame(false);
    }
  };

  const handleEditGame = (game: any) => {
    setGameForm({ game: game.game, rank: game.rank, role: game.role || "",
      inGameName: game.inGameName || "", isPrimary: game.isPrimary });
    setEditingGame(game.game);
    setShowAddGameModal(true);
  };

  const handleRemoveGame = async (game: string) => {
    const confirmed = await confirm({
      title: "Remove Game", message: `Remove ${game} from your profile?`,
      confirmText: "Remove", cancelText: "Cancel", confirmButtonClass: "bg-red-500 hover:bg-red-600",
    });
    if (!confirmed) return;
    try {
      await api.delete(`/profile/games/${game}`);
      showSuccess("Game removed!");
      fetchProfile();
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to remove game");
    }
  };

  const fieldCls  = "w-full px-3.5 py-3 bg-white/[0.05] border border-white/[0.10] rounded-lg text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#e85d5d]/50 focus:bg-white/[0.07] transition-all duration-200";
  const labelCls  = "block text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-1.5";
  const primaryGame = profile?.games?.find((g: any) => g.isPrimary) ?? profile?.games?.[0];
  const bannerColor = primaryGame ? gameColor(primaryGame.game).accent : "#e85d5d";

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #111111 0%, #110a0a 100%)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#e85d5d]/30 border-t-[#e85d5d] animate-spin" />
        <p className="text-white/35 text-sm">Loading profile…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #111111 0%, #110a0a 100%)' }}>
      <Header />

      {/* ════════════════════════════════════════════════════════════
          PROFILE BANNER
      ════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, #0d0d0d 0%, #111111 60%, ${bannerColor}18 100%)` }}>
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-[500px] h-[300px] rounded-full blur-[120px] pointer-events-none" style={{ background: `${bannerColor}12` }} />
        {/* Bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.05]" />
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${bannerColor}60, transparent)` }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pt-12 sm:pb-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">

            {/* ── Avatar ── */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-['Russo_One'] text-white/90 shadow-2xl border-2"
                style={{ background: `linear-gradient(135deg, ${bannerColor}30, ${bannerColor}10)`, borderColor: `${bannerColor}40` }}>
                {profile?.user?.username?.charAt(0).toUpperCase()}
              </div>
              {/* Online dot */}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0d0d0d]" title="Online" />
              {profile?.isNepal && (
                <span className="absolute -top-2 -right-2 text-lg leading-none">🇳🇵</span>
              )}
            </div>

            {/* ── Identity ── */}
            <div className="flex-1 text-center sm:text-left min-w-0 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className="font-['Russo_One'] text-3xl sm:text-4xl text-white leading-tight">
                  {profile?.user?.username}
                </h1>
                {primaryGame && (
                  <span className="self-center sm:self-auto px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border"
                    style={{ color: gameColor(primaryGame.game).text, background: gameColor(primaryGame.game).bg, borderColor: gameColor(primaryGame.game).border }}>
                    {primaryGame.game}
                  </span>
                )}
              </div>

              {profile?.realName && (
                <p className="text-white/45 text-sm mb-2">{profile.realName}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                {profile?.currentTeam && (
                  <span className="flex items-center gap-1.5 text-white/50 text-xs">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197" />
                    </svg>
                    {profile.currentTeam.name}
                    {profile.currentTeam.tag && <span className="opacity-50">[{profile.currentTeam.tag}]</span>}
                  </span>
                )}
                {(profile?.city || profile?.country) && (
                  <span className="flex items-center gap-1 text-white/35 text-xs">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {[profile.city, profile.country].filter(Boolean).join(", ")}
                  </span>
                )}
                {profile?.organizations?.length > 0 && profile.organizations.map((org: any, i: number) => (
                  <span key={i} className="flex items-center gap-1 text-amber-400/70 text-xs">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
                    </svg>
                    {org.organization?.name} · {org.role}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Stats ── */}
            <div className="flex gap-px rounded-xl overflow-hidden border border-white/[0.07] flex-shrink-0">
              {[
                { v: profile?.stats?.tournamentsPlayed || 0, l: "Events" },
                { v: profile?.stats?.wins || 0,              l: "Wins" },
                { v: profile?.stats?.mvps || 0,              l: "MVPs" },
              ].map(({ v, l }, i) => (
                <div key={i} className="px-5 py-3 bg-black/40 hover:bg-white/[0.04] transition-colors duration-200 text-center min-w-[68px]">
                  <p className="font-['Russo_One'] text-2xl leading-none mb-1" style={{ color: bannerColor }}>{v}</p>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          CONTENT
      ════════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-16">

        {/* Admin org banner */}
        {adminOrg && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.04] px-5 py-4 mb-5">
            <div>
              <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Organization Admin</p>
              <p className="text-white font-['Russo_One'] text-sm">
                {adminOrg.organizationName}
                {adminOrg.tag && <span className="text-white/35 font-sans font-normal ml-2 text-xs">[{adminOrg.tag}]</span>}
              </p>
            </div>
            <button onClick={() => router.push("/admin-dashboard")}
              className="text-amber-400 text-xs border border-amber-400/25 px-4 py-2 rounded-lg hover:bg-amber-400/10 transition-colors cursor-pointer flex-shrink-0">
              Open Dashboard
            </button>
          </div>
        )}

        {/* Bio strip */}
        {profile?.bio && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3.5 mb-5">
            <p className="text-white/50 text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Social links */}
        {profile?.socialLinks && Object.values(profile.socialLinks).some((l: any) => l) && (
          <div className="flex flex-wrap gap-2 mb-5">
            {socialConfig.map(({ key, label, icon, color }) =>
              profile.socialLinks[key] ? (
                <a key={key} href={profile.socialLinks[key]} target="_blank" rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 hover:-translate-y-0.5 ${color}`}>
                  {icon} {label}
                </a>
              ) : null
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0.5 p-1 bg-white/[0.03] border border-white/[0.07] rounded-xl mb-5 overflow-x-auto">
          {([
            { id: "profile",      label: "Profile" },
            { id: "stats",        label: "Stats" },
            { id: "games",        label: "Games & Ranks" },
            { id: "achievements", label: "Achievements" },
          ] as const).map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[100px] px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#e85d5d] text-white shadow-sm"
                  : "text-white/40 hover:text-white/70"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB — VIEW ── */}
        {activeTab === "profile" && !isEditingProfile && (
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="font-['Russo_One'] text-base text-white">Player Info</h2>
              <button onClick={() => setIsEditingProfile(true)}
                className="text-white/50 hover:text-white text-xs border border-white/[0.10] px-3.5 py-1.5 rounded-lg hover:bg-white/[0.05] transition-all cursor-pointer">
                Edit Profile
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
              {[
                { label: "Username",     value: profile?.user?.username },
                { label: "Real Name",    value: profile?.realName },
                { label: "Date of Birth",value: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null },
                { label: "Country",      value: profile?.country },
                { label: "City",         value: profile?.city },
                { label: "Nepal Player", value: profile?.isNepal ? "Yes 🇳🇵" : null },
              ].map(({ label, value }) => value ? (
                <div key={label}>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-white/80 text-sm">{value}</p>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        {/* ── STATS TAB ── */}
        {activeTab === "stats" && profile?.user?._id && (
          <PlayerStatsTab playerId={profile.user._id} />
        )}

        {/* ── GAMES TAB ── */}
        {activeTab === "games" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Russo_One'] text-base text-white/80">Games &amp; Ranks</h2>
              <button onClick={() => { setGameForm({ game: "Valorant", rank: "", role: "", inGameName: "", isPrimary: false }); setEditingGame(null); setShowAddGameModal(true); }}
                className="btn-brand px-4 py-2 text-sm cursor-pointer">+ Add Game</button>
            </div>

            {profile?.games?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.games.map((game: any, i: number) => {
                  const c = gameColor(game.game);
                  return (
                    <div key={i} className="relative rounded-xl border overflow-hidden transition-all duration-200 hover:translate-y-[-1px] hover:shadow-lg"
                      style={{ borderColor: c.border, background: `linear-gradient(135deg, ${c.bg}, rgba(255,255,255,0.02))` }}>
                      {/* Top accent */}
                      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${c.accent}80, transparent)` }} />

                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-['Russo_One'] text-white text-base leading-tight">{game.game}</h3>
                            {game.isPrimary && (
                              <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                                style={{ color: c.text, background: `${c.accent}20`, border: `1px solid ${c.border}` }}>
                                Primary
                              </span>
                            )}
                          </div>
                          {/* Rank badge */}
                          <span className="px-3 py-1.5 rounded-lg text-xs font-bold border"
                            style={{ color: c.text, background: `${c.accent}15`, borderColor: c.border }}>
                            {game.rank}
                          </span>
                        </div>

                        <div className="space-y-1.5 mb-4">
                          {game.role && (
                            <div className="flex items-center gap-2">
                              <span className="text-white/25 text-[10px] w-8 uppercase tracking-wider flex-shrink-0">Role</span>
                              <span className="text-white/65 text-sm">{game.role}</span>
                            </div>
                          )}
                          {game.inGameName && (
                            <div className="flex items-center gap-2">
                              <span className="text-white/25 text-[10px] w-8 uppercase tracking-wider flex-shrink-0">IGN</span>
                              <span className="text-sm font-medium" style={{ color: c.text }}>{game.inGameName}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 pt-3 border-t" style={{ borderColor: `${c.accent}20` }}>
                          <button onClick={() => handleEditGame(game)}
                            className="flex-1 py-1.5 rounded-lg text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
                            style={{ border: `1px solid ${c.border}`, background: "transparent" }}>
                            Edit
                          </button>
                          <button onClick={() => handleRemoveGame(game.game)}
                            className="flex-1 py-1.5 rounded-lg text-xs text-red-400/60 hover:text-red-400 border border-red-500/15 hover:bg-red-500/[0.08] transition-all cursor-pointer">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-white/15">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
                  </svg>
                </div>
                <p className="text-white/30 text-sm">No games added yet</p>
                <button onClick={() => setShowAddGameModal(true)} className="btn-brand px-5 py-2.5 text-sm cursor-pointer">
                  Add Your First Game
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── ACHIEVEMENTS TAB ── */}
        {activeTab === "achievements" && (
          <div className="space-y-4">
            {/* List */}
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.06]">
                <h2 className="font-['Russo_One'] text-base text-white">Your Achievements</h2>
              </div>
              <div className="p-6">
                {profile?.achievements?.length > 0 ? (
                  <div>
                    {profile.achievements.map((a: any, i: number) => {
                      const isAuto = !!a.auto;
                      const isWinner = a.placement === 1;
                      const isRunnerUp = a.placement === 2;
                      const dotCls = isWinner
                        ? "bg-amber-400 ring-2 ring-amber-400/30"
                        : isRunnerUp
                          ? "bg-slate-300 ring-2 ring-slate-300/30"
                          : "bg-[#e85d5d]/70";
                      return (
                        <div key={i} className="flex gap-4 py-4 border-b border-white/[0.05] last:border-0">
                          <div className="flex flex-col items-center flex-shrink-0 pt-1">
                            <div className={`w-2 h-2 rounded-full ${dotCls}`} />
                            {i < profile.achievements.length - 1 && <div className="w-px flex-1 bg-white/[0.05] mt-1.5" />}
                          </div>
                          <div className="pb-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <p className="text-white/85 font-semibold text-sm">{a.title}</p>
                              {isAuto && isWinner && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                  🏆 Tournament Win
                                </span>
                              )}
                              {isAuto && isRunnerUp && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-500/15 text-slate-300 border border-slate-400/30">
                                  🥈 Runner-Up
                                </span>
                              )}
                              {isAuto && a.game && !isWinner && !isRunnerUp && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#e85d5d]/15 text-[#e85d5d] border border-[#e85d5d]/30">
                                  Auto
                                </span>
                              )}
                            </div>
                            {a.description && <p className="text-white/40 text-xs leading-relaxed mb-1">{a.description}</p>}
                            {a.date && <p className="text-white/25 text-[11px]">{new Date(a.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-10 gap-3 text-white/20">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                    </svg>
                    <p className="text-sm">No achievements yet</p>
                    <p className="text-white/15 text-xs text-center max-w-xs">Win or place runner-up in a tournament — your achievement will appear here automatically.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── ADD / EDIT GAME MODAL ── */}
      {showAddGameModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => { setShowAddGameModal(false); setEditingGame(null); }}>
          <div className="bg-[#161618] border border-white/[0.10] rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Russo_One'] text-white text-lg">{editingGame ? "Edit Game" : "Add Game"}</h2>
              <button onClick={() => { setShowAddGameModal(false); setEditingGame(null); }}
                className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.09] transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleAddGame} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelCls}>Game</label>
                  <select value={gameForm.game} disabled={!!editingGame}
                    onChange={(e) => setGameForm({ ...gameForm, game: e.target.value })}
                    className={`${fieldCls} [&>option]:bg-[#161618] disabled:opacity-40 disabled:cursor-not-allowed`}>
                    {GAMES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select></div>
                <div><label className={labelCls}>Rank <span className="text-[#e85d5d]">*</span></label>
                  <input type="text" value={gameForm.rank} required className={fieldCls} placeholder="Immortal 3, Global Elite…"
                    onChange={(e) => setGameForm({ ...gameForm, rank: e.target.value })} /></div>
                <div><label className={labelCls}>Role</label>
                  <input type="text" value={gameForm.role} className={fieldCls} placeholder="Duelist, AWPer, IGL…"
                    onChange={(e) => setGameForm({ ...gameForm, role: e.target.value })} /></div>
                <div><label className={labelCls}>In-Game Name</label>
                  <input type="text" value={gameForm.inGameName} className={fieldCls} placeholder="Your IGN"
                    onChange={(e) => setGameForm({ ...gameForm, inGameName: e.target.value })} /></div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer pt-1">
                <div onClick={() => setGameForm({ ...gameForm, isPrimary: !gameForm.isPrimary })}
                  className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${gameForm.isPrimary ? "bg-[#e85d5d] border-[#e85d5d]" : "border-white/20"}`}>
                  {gameForm.isPrimary && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
                  <input type="checkbox" checked={gameForm.isPrimary} className="sr-only" readOnly />
                </div>
                <span className="text-white/50 text-sm">Set as primary game</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddGameModal(false); setEditingGame(null); }}
                  className="btn-ghost flex-1 py-3 text-sm cursor-pointer">Cancel</button>
                <SaveButton type="submit" saving={savingGame}
                  label={editingGame ? "Update Game" : "Add Game"}
                  savingLabel={editingGame ? "Updating…" : "Adding…"}
                  className="flex-1 py-3 text-sm" />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EDIT PROFILE DRAWER ── */}
      {isEditingProfile && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => { setIsEditingProfile(false); fetchProfile(); }} />
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-[#161618] border-l border-white/[0.08] z-50 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] flex-shrink-0">
              <h2 className="font-['Russo_One'] text-white text-lg">Edit Profile</h2>
              <button onClick={() => { setIsEditingProfile(false); fetchProfile(); }}
                className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.09] transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            {/* Scrollable form */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Real Name</label>
                    <input type="text" value={profileForm.realName} className={fieldCls} placeholder="Your real name"
                      onChange={(e) => setProfileForm({ ...profileForm, realName: e.target.value })} /></div>
                  <div><label className={labelCls}>Date of Birth</label>
                    <input type="date" value={profileForm.dateOfBirth} className={fieldCls}
                      onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })} /></div>
                  <div><label className={labelCls}>Country</label>
                    <input type="text" value={profileForm.country} className={fieldCls} placeholder="Nepal"
                      onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })} /></div>
                  <div><label className={labelCls}>City</label>
                    <input type="text" value={profileForm.city} className={fieldCls} placeholder="Kathmandu"
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} /></div>
                </div>
                <div>
                  <label className={labelCls}>Bio</label>
                  <textarea value={profileForm.bio} rows={3} maxLength={500} className={`${fieldCls} resize-none`}
                    placeholder="Tell the scene who you are…"
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} />
                  <p className="text-right text-white/20 text-xs mt-1">{profileForm.bio.length}/500</p>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setProfileForm({ ...profileForm, isNepal: !profileForm.isNepal })}
                    className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${profileForm.isNepal ? "bg-[#e85d5d] border-[#e85d5d]" : "border-white/20"}`}>
                    {profileForm.isNepal && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
                    <input type="checkbox" checked={profileForm.isNepal} className="sr-only" readOnly />
                  </div>
                  <span className="text-white/55 text-sm">I am from Nepal 🇳🇵</span>
                </label>
                <div className="pt-4 border-t border-white/[0.06]">
                  <p className={labelCls}>Social Links</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {socialConfig.map(({ key, placeholder }) => (
                      <div key={key}>
                        <label className="block text-white/25 text-[10px] uppercase tracking-widest mb-1 capitalize">{key}</label>
                        <input type="text" value={profileForm.socialLinks[key]} className={fieldCls} placeholder={placeholder}
                          onChange={(e) => setProfileForm({ ...profileForm, socialLinks: { ...profileForm.socialLinks, [key]: e.target.value } })} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2 pb-4">
                  <button type="button" onClick={() => { setIsEditingProfile(false); fetchProfile(); }}
                    className="btn-ghost flex-1 py-3 text-sm cursor-pointer">Cancel</button>
                  <SaveButton type="submit" saving={savingProfile} label="Save Profile" className="flex-1 py-3 text-sm" />
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {confirmState && (
        <ConfirmDialog
          title={confirmState.options.title} message={confirmState.options.message}
          confirmText={confirmState.options.confirmText} cancelText={confirmState.options.cancelText}
          confirmButtonClass={confirmState.options.confirmButtonClass}
          onConfirm={handleConfirm} onCancel={handleCancel}
        />
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Footer />
    </div>
  );
}

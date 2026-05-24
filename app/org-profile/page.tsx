"use client";

import { useState, useEffect, Suspense } from "react";
import api from '@/lib/api';
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConfirmDialog from "@/components/ConfirmDialog";
import AddStaffModal from "@/components/AddStaffModal";
import SaveButton from "@/components/SaveButton";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";


const GAMES = [
  "Valorant", "CS2", "PUBG Mobile", "Dota 2", "League of Legends",
  "Free Fire", "Mobile Legends", "Apex Legends", "Call of Duty",
  "Rainbow Six Siege", "Other",
];

/* ─── social icon SVGs ─── */
function TwitterIcon()   { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>; }
function FacebookIcon()  { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>; }
function InstagramIcon() { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>; }
function DiscordIcon()   { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.035.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>; }
function YoutubeIcon()   { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>; }
function GlobeIcon()     { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/></svg>; }

const socialConfig = [
  { key: "twitter",   label: "Twitter",   icon: <TwitterIcon />,   color: "text-sky-400   border-sky-500/25   bg-sky-500/8"     },
  { key: "facebook",  label: "Facebook",  icon: <FacebookIcon />,  color: "text-blue-400  border-blue-500/25  bg-blue-500/8"    },
  { key: "instagram", label: "Instagram", icon: <InstagramIcon />, color: "text-pink-400  border-pink-500/25  bg-pink-500/8"    },
  { key: "discord",   label: "Discord",   icon: <DiscordIcon />,   color: "text-indigo-400 border-indigo-500/25 bg-indigo-500/8"},
  { key: "youtube",   label: "YouTube",   icon: <YoutubeIcon />,   color: "text-[#e85d5d]  border-[#e85d5d]/25  bg-[#e85d5d]/8" },
  { key: "website",   label: "Website",   icon: <GlobeIcon />,     color: "text-emerald-400 border-emerald-500/25 bg-emerald-500/8"},
] as const;

const ACCENT = "#e85d5d"; // org red accent

const fieldCls = "w-full px-3.5 py-3 bg-white/[0.05] border border-white/[0.10] rounded-lg text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#e85d5d]/50 focus:bg-white/[0.07] transition-all duration-200";
const labelCls = "block text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-1.5";

/* ══════════════════════════════════════════════════════════════
   STATUS BADGE
══════════════════════════════════════════════════════════════ */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft:             "bg-white/[0.06]   text-white/40   border-white/[0.10]",
    registration_open: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    ongoing:           "bg-amber-500/10   text-amber-400   border-amber-500/25",
    completed:         "bg-sky-500/10     text-sky-400     border-sky-500/25",
    cancelled:         "bg-red-500/10     text-red-400     border-red-500/25",
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${map[status] ?? map.draft}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════ */
function OrganizationProfileInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();

  const initialTab = (searchParams.get("tab") as "profile" | "teams" | "staff" | "achievements" | "tournaments") || "profile";
  const [organization, setOrganization]         = useState<any>(null);
  const [loading, setLoading]                   = useState(true);
  const [activeTab, setActiveTab]               = useState<"profile" | "teams" | "staff" | "achievements" | "tournaments">(initialTab);
  const [tournaments, setTournaments]           = useState<any[]>([]);
  const [savingProfile, setSavingProfile]       = useState(false);
  const [savingTournament, setSavingTournament] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showCreateTournamentForm, setShowCreateTournamentForm] = useState(false);

  const [profileForm, setProfileForm] = useState({
    organizationName: "", tag: "", description: "", country: "",
    isNepal: false, foundedDate: "", contactEmail: "", contactPhone: "",
    socialLinks: { twitter: "", facebook: "", instagram: "", website: "", discord: "", youtube: "" },
  });

  const [showAddStaffModal, setShowAddStaffModal]           = useState(false);
  const [addingStaff, setAddingStaff]                       = useState(false);
  const [showRemoveStaffModal, setShowRemoveStaffModal]     = useState(false);
  const [staffToRemove, setStaffToRemove]                   = useState<string | null>(null);
  const [showDeleteTournamentModal, setShowDeleteTournamentModal] = useState(false);
  const [tournamentToDelete, setTournamentToDelete]         = useState<any>(null);
  const [showDeleteTeamModal, setShowDeleteTeamModal]       = useState(false);
  const [teamToDelete, setTeamToDelete]                     = useState<any>(null);

  const [tournamentForm, setTournamentForm] = useState({
    name: "", description: "", game: "Valorant", customGame: "",
    matchmakingType: "single_elimination", totalSlots: 8, teamSize: 5,
    registrationStartDate: "", registrationEndDate: "",
    tournamentStartDate: "", tournamentEndDate: "",
    prizePool: { amount: 0, currency: "NPR" },
    entryFee: { amount: 0, currency: "NPR", paymentInstructions: "" },
    requirements: { isNepalOnly: false, minRank: "" },
    streamUrl: "", discordUrl: "",
  });

  useEffect(() => {
    const accountType = localStorage.getItem("accountType");
    if (accountType !== "organization") { router.push("/profile"); return; }
    fetchOrganization();
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (!isEditingProfile) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setIsEditingProfile(false); fetchOrganization(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isEditingProfile]);

  // Lock body scroll + Escape-to-close while create-tournament modal is open
  useEffect(() => {
    if (!showCreateTournamentForm) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowCreateTournamentForm(false); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [showCreateTournamentForm]);

  const fetchOrganization = async () => {
    try {
      const response = await api.get(`/org-auth/me`);
      const orgData = response.data.data.organization;
      setOrganization(orgData);
      setProfileForm({
        organizationName: orgData.organizationName || "",
        tag: orgData.tag || "",
        description: orgData.description || "",
        country: orgData.country || "",
        isNepal: orgData.isNepal || false,
        foundedDate: orgData.foundedDate ? new Date(orgData.foundedDate).toISOString().split("T")[0] : "",
        contactEmail: orgData.contactEmail || "",
        contactPhone: orgData.contactPhone || "",
        socialLinks: orgData.socialLinks || { twitter: "", facebook: "", instagram: "", website: "", discord: "", youtube: "" },
      });
      setLoading(false);
    } catch (error: any) {
      if (error.response?.status === 401) {
        localStorage.removeItem("accountType");
        router.push("/org-login");
      } else {
        showError(error.response?.data?.message || "Failed to fetch organization profile");
      }
      setLoading(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      const response = await api.get(`/tournaments/my/tournaments`);
      setTournaments(response.data.data.tournaments || []);
    } catch { /* silently ignore */ }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await confirm({
      title: "Save changes?",
      message: "Are you sure you want to update your organization profile?",
      confirmText: "Yes, Save",
      cancelText: "Cancel",
      confirmButtonClass: "bg-[#e85d5d] hover:bg-[#d94f4f]",
    });
    if (!ok) return;
    setSavingProfile(true);
    try {
      await api.put(`/org-auth/profile`, profileForm);
      showSuccess("Profile updated!");
      setIsEditingProfile(false);
      fetchOrganization();
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to update profile");
    } finally { setSavingProfile(false); }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTournament(true);
    try {
      await api.post(`/tournaments`, tournamentForm);
      showSuccess("Tournament created!");
      setShowCreateTournamentForm(false);
      setTournamentForm({
        name: "", description: "", game: "Valorant", customGame: "",
        matchmakingType: "single_elimination", totalSlots: 8, teamSize: 5,
        registrationStartDate: "", registrationEndDate: "",
        tournamentStartDate: "", tournamentEndDate: "",
        prizePool: { amount: 0, currency: "NPR" },
        entryFee: { amount: 0, currency: "NPR", paymentInstructions: "" },
        requirements: { isNepalOnly: false, minRank: "" },
        streamUrl: "", discordUrl: "",
      });
      fetchTournaments();
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to create tournament");
    } finally { setSavingTournament(false); }
  };

  const handleAddStaff = async ({ username, role, department }: { username: string; role: string; department: string }) => {
    setAddingStaff(true);
    try {
      await api.post(`/org-auth/my/staff`, { username, role, department });
      showSuccess(`Staff member ${username} added!`);
      setShowAddStaffModal(false);
      fetchOrganization();
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to add staff member");
    } finally { setAddingStaff(false); }
  };

  const handleRemoveStaff = async () => {
    if (!staffToRemove) return;
    try {
      await api.delete(`/org-auth/my/staff/${staffToRemove}`);
      showSuccess("Staff member removed!");
      setShowRemoveStaffModal(false);
      setStaffToRemove(null);
      fetchOrganization();
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to remove staff member");
    }
  };

  const handleDeleteTournament = async () => {
    if (!tournamentToDelete) return;
    try {
      await api.delete(`/tournaments/${tournamentToDelete._id}`);
      showSuccess("Tournament deleted!");
      setShowDeleteTournamentModal(false);
      setTournamentToDelete(null);
      fetchTournaments();
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to delete tournament");
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;
    try {
      await api.delete(`/teams/${teamToDelete._id}`);
      showSuccess(`Team "${teamToDelete.name}" deleted!`);
      setShowDeleteTeamModal(false);
      setTeamToDelete(null);
      fetchOrganization();
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to delete team");
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg,#111111 0%,#0d0a11 100%)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#e85d5d]/30 border-t-[#a855f7] animate-spin" />
        <p className="text-white/35 text-sm">Loading profile…</p>
      </div>
    </div>
  );

  const hasSocials = organization?.socialLinks && Object.values(organization.socialLinks).some((l: any) => l);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#111111 0%,#0d0a11 100%)" }}>
      <Header />

      {/* ══════════════════════════════════════════════════════════
          BANNER
      ══════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg,#0d0d0d 0%,#111111 60%,${ACCENT}18 100%)` }}>
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-[500px] h-[300px] rounded-full blur-[120px] pointer-events-none" style={{ background: `${ACCENT}12` }} />
        {/* Bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.05]" />
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${ACCENT}60,transparent)` }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pt-12 sm:pb-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-['Russo_One'] text-white/90 shadow-2xl border-2"
                style={{ background: `linear-gradient(135deg,${ACCENT}30,${ACCENT}10)`, borderColor: `${ACCENT}40` }}>
                {organization?.organizationName?.charAt(0).toUpperCase()}
              </div>
              {organization?.isNepal && (
                <span className="absolute -top-2 -right-2 text-lg leading-none">🇳🇵</span>
              )}
              {organization?.isVerified && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0d0d0d] flex items-center justify-center" title="Verified">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                </span>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 text-center sm:text-left min-w-0 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h1 className="font-['Russo_One'] text-3xl sm:text-4xl text-white leading-tight">
                  {organization?.organizationName}
                </h1>
                {organization?.tag && (
                  <span className="self-center sm:self-auto px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border"
                    style={{ color: `${ACCENT}`, background: `${ACCENT}15`, borderColor: `${ACCENT}40` }}>
                    {organization.tag}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start mt-1">
                {(organization?.city || organization?.country) && (
                  <span className="flex items-center gap-1 text-white/35 text-xs">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                    </svg>
                    {[organization.city, organization.country].filter(Boolean).join(", ")}
                  </span>
                )}
                {organization?.foundedDate && (
                  <span className="flex items-center gap-1 text-white/35 text-xs">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
                    </svg>
                    Est. {new Date(organization.foundedDate).getFullYear()}
                  </span>
                )}
                {organization?.contactEmail && (
                  <span className="flex items-center gap-1 text-white/35 text-xs">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                    </svg>
                    {organization.contactEmail}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-px rounded-xl overflow-hidden border border-white/[0.07] flex-shrink-0">
              {[
                { v: organization?.stats?.totalTeams    || 0, l: "Teams" },
                { v: organization?.stats?.totalPlayers  || 0, l: "Players" },
                { v: organization?.stats?.championships || 0, l: "Titles" },
              ].map(({ v, l }, i) => (
                <div key={i} className="px-5 py-3 bg-black/40 hover:bg-white/[0.04] transition-colors duration-200 text-center min-w-[68px]">
                  <p className="font-['Russo_One'] text-2xl leading-none mb-1" style={{ color: ACCENT }}>{v}</p>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════════════════════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-16">

        {/* Description strip */}
        {organization?.description && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3.5 mb-5">
            <p className="text-white/50 text-sm leading-relaxed">{organization.description}</p>
          </div>
        )}

        {/* Social links */}
        {hasSocials && (
          <div className="flex flex-wrap gap-2 mb-5">
            {socialConfig.map(({ key, label, icon, color }) =>
              organization.socialLinks[key] ? (
                <a key={key} href={organization.socialLinks[key]} target="_blank" rel="noopener noreferrer"
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
            { id: "teams",        label: "Teams" },
            { id: "staff",        label: "Staff" },
            { id: "achievements", label: "Achievements" },
            { id: "tournaments",  label: "Tournaments" },
          ] as const).map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[90px] px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? "text-white shadow-sm"
                  : "text-white/40 hover:text-white/70"
              }`}
              style={activeTab === tab.id ? { background: ACCENT } : {}}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══ PROFILE TAB — VIEW ══ */}
        {activeTab === "profile" && !isEditingProfile && (
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="font-['Russo_One'] text-base text-white">Organization Info</h2>
              <button onClick={() => setIsEditingProfile(true)}
                className="text-white/50 hover:text-white text-xs border border-white/[0.10] px-3.5 py-1.5 rounded-lg hover:bg-white/[0.05] transition-all cursor-pointer">
                Edit Profile
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
              {[
                { label: "Organization Name", value: organization?.organizationName },
                { label: "Tag",               value: organization?.tag ? `[${organization.tag}]` : null },
                { label: "Country",           value: organization?.country },
                { label: "Founded",           value: organization?.foundedDate ? new Date(organization.foundedDate).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : null },
                { label: "Contact Email",     value: organization?.contactEmail },
                { label: "Contact Phone",     value: organization?.contactPhone },
                { label: "Nepal Based",       value: organization?.isNepal ? "Yes 🇳🇵" : null },
              ].map(({ label, value }) => value ? (
                <div key={label}>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-white/80 text-sm">{value}</p>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        {/* ══ TEAMS TAB ══ */}
        {activeTab === "teams" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Russo_One'] text-base text-white/80">Your Teams</h2>
              <button onClick={() => router.push("/organization")}
                className="text-white/50 hover:text-white text-xs border border-white/[0.10] px-3.5 py-2 rounded-lg hover:bg-white/[0.05] transition-all cursor-pointer">
                Manage Teams
              </button>
            </div>

            {organization?.teams?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {organization.teams.map((team: any) => (
                  <div key={team._id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden hover:bg-white/[0.04] hover:-translate-y-0.5 transition-all duration-200">
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-['Russo_One'] text-white text-base leading-tight">{team.name}</h3>
                          {team.tag && <p className="text-white/30 text-xs mt-0.5">[{team.tag}]</p>}
                        </div>
                        {team.game && (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border"
                            style={{ color: ACCENT, background: `${ACCENT}15`, borderColor: `${ACCENT}30` }}>
                            {team.game}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1 mb-4 text-xs text-white/35">
                        {team.games?.[0]?.roster && <p>{team.games[0].roster.length} players</p>}
                        {team.country && <p>{team.country}</p>}
                        {team.createdAt && <p>Created {new Date(team.createdAt).toLocaleDateString()}</p>}
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => router.push(`/team/${team._id}?from=org-profile`)}
                          className="flex-1 py-1.5 rounded-lg text-xs text-white/50 hover:text-white border border-white/[0.10] hover:bg-white/[0.05] transition-all cursor-pointer">
                          View
                        </button>
                        <button onClick={() => router.push(`/team-management/${team._id}?from=org-profile`)}
                          className="flex-1 py-1.5 rounded-lg text-xs transition-all cursor-pointer border"
                          style={{ color: ACCENT, borderColor: `${ACCENT}30`, background: `${ACCENT}10` }}>
                          Manage
                        </button>
                        <button onClick={() => { setTeamToDelete(team); setShowDeleteTeamModal(true); }}
                          className="flex-1 py-1.5 rounded-lg text-xs text-red-400/60 hover:text-red-400 border border-red-500/15 hover:bg-red-500/[0.08] transition-all cursor-pointer">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-white/15">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197"/>
                  </svg>
                </div>
                <p className="text-white/30 text-sm">No teams yet</p>
                <button onClick={() => router.push("/organization")}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all"
                  style={{ background: ACCENT }}>
                  Create Your First Team
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ STAFF TAB ══ */}
        {activeTab === "staff" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Russo_One'] text-base text-white/80">Staff Management</h2>
              <button onClick={() => setShowAddStaffModal(true)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all"
                style={{ background: ACCENT }}>
                + Add Staff
              </button>
            </div>

            {organization?.staff?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {organization.staff.map((member: any, index: number) => (
                  <div key={index} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-['Russo_One'] text-white text-sm">{member.username}</h3>
                        <p className="text-xs mt-0.5" style={{ color: ACCENT }}>{member.role}</p>
                        {member.role === "Admin" && (
                          <p className="text-amber-400/70 text-[10px] mt-0.5">Has management access</p>
                        )}
                        {member.department && (
                          <p className="text-white/30 text-xs mt-0.5">{member.department}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        member.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                          : "bg-red-500/10 text-red-400 border-red-500/25"
                      }`}>
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-white/25 text-[11px] mb-3">
                      Joined {new Date(member.joinedDate).toLocaleDateString()}
                    </p>
                    <button onClick={() => { setStaffToRemove(member.user); setShowRemoveStaffModal(true); }}
                      className="w-full py-1.5 rounded-lg text-xs text-red-400/60 hover:text-red-400 border border-red-500/15 hover:bg-red-500/[0.08] transition-all cursor-pointer">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-20 gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-white/15">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                  </svg>
                </div>
                <p className="text-white/30 text-sm">No staff members yet</p>
                <button onClick={() => setShowAddStaffModal(true)}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer"
                  style={{ background: ACCENT }}>
                  Add First Staff Member
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ ACHIEVEMENTS TAB ══ */}
        {activeTab === "achievements" && (
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <h2 className="font-['Russo_One'] text-base text-white">Achievements</h2>
              <span className="text-white/35 text-xs">
                {organization?.achievements?.length || 0} total
              </span>
            </div>
            {organization?.achievements?.length > 0 ? (
              <div className="p-6">
                {[...organization.achievements]
                  .sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
                  .map((a: any, i: number, arr: any[]) => {
                    const isAuto = !!a.auto;
                    return (
                      <div key={a._id || i} className="flex gap-4 py-4 border-b border-white/[0.05] last:border-0">
                        <div className="flex flex-col items-center flex-shrink-0 pt-1">
                          <div className={`w-2 h-2 rounded-full ${isAuto ? "bg-amber-400 ring-2 ring-amber-400/30" : "bg-[#e85d5d]/70"}`} />
                          {i < arr.length - 1 && <div className="w-px flex-1 bg-white/[0.05] mt-1.5" />}
                        </div>
                        <div className="pb-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="text-white/85 font-semibold text-sm">{a.title}</p>
                            {isAuto && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                🏆 Hosted
                              </span>
                            )}
                            {a.game && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/[0.05] text-white/50 border border-white/10">
                                {a.game}
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
              <div className="flex flex-col items-center py-20 gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-white/15">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0"/>
                  </svg>
                </div>
                <p className="text-white/30 text-sm">No achievements yet</p>
                <p className="text-white/20 text-xs max-w-xs text-center">
                  When a tournament you host completes, it will be recorded here automatically.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ══ TOURNAMENTS TAB ══ */}
        {activeTab === "tournaments" && (
          <div className="space-y-5">
            {/* List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                  <h2 className="font-['Russo_One'] text-base text-white/80">Your Tournaments</h2>
                  <button onClick={() => setShowCreateTournamentForm(true)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer"
                    style={{ background: ACCENT }}>
                    + Create Tournament
                  </button>
                </div>

                {tournaments.length > 0 ? (
                  <div className="space-y-3">
                    {tournaments.map((tournament: any) => (
                      <div key={tournament._id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-['Russo_One'] text-white text-base leading-tight mb-2">{tournament.name}</h3>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border"
                                style={{ color: ACCENT, background: `${ACCENT}15`, borderColor: `${ACCENT}30` }}>
                                {tournament.game}
                              </span>
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/[0.10] text-white/40">
                                {tournament.matchmakingType.replace(/_/g, " ")}
                              </span>
                              <StatusBadge status={tournament.status} />
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-white/70 text-sm font-semibold">
                              NPR {tournament.prizePool?.amount?.toLocaleString() || 0}
                            </p>
                            <p className="text-white/30 text-xs mt-0.5">
                              {tournament.participants?.length || 0}/{tournament.totalSlots} teams
                            </p>
                          </div>
                        </div>

                        {tournament.description && (
                          <p className="text-white/35 text-xs mb-3 line-clamp-2">{tournament.description}</p>
                        )}

                        <p className="text-white/25 text-[11px] mb-3">
                          Starts {new Date(tournament.tournamentStartDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.05]">
                          <button onClick={() => router.push(`/tournament/${tournament._id}/manage?from=org-profile`)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer"
                            style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40`, color: ACCENT }}>
                            Manage
                          </button>
                          <button onClick={() => router.push(`/tournament/${tournament._id}?from=org-profile`)}
                            className="px-3.5 py-1.5 rounded-lg text-xs text-white/50 hover:text-white border border-white/[0.10] hover:bg-white/[0.05] transition-all cursor-pointer">
                            View
                          </button>
                          <button onClick={() => router.push(`/tournament/${tournament._id}/bracket?from=org-profile`)}
                            className="px-3.5 py-1.5 rounded-lg text-xs text-white/50 hover:text-white border border-white/[0.10] hover:bg-white/[0.05] transition-all cursor-pointer">
                            Bracket
                          </button>
                          {tournament.status !== "ongoing" && (
                            <button onClick={() => { setTournamentToDelete(tournament); setShowDeleteTournamentModal(true); }}
                              className="px-3.5 py-1.5 rounded-lg text-xs text-red-400/60 hover:text-red-400 border border-red-500/15 hover:bg-red-500/[0.08] transition-all cursor-pointer">
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-20 gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="text-5xl">🏆</div>
                    <p className="text-white/30 text-sm">No tournaments yet</p>
                    <button onClick={() => setShowCreateTournamentForm(true)}
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer"
                      style={{ background: ACCENT }}>
                      Create Your First Tournament
                    </button>
                  </div>
                )}
            </div>

            {/* Create tournament modal */}
            {showCreateTournamentForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
                onClick={() => setShowCreateTournamentForm(false)}>
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                {/* Panel */}
                <div onClick={(e) => e.stopPropagation()}
                  className="relative rounded-2xl border border-white/[0.08] bg-[#161618] shadow-[0_24px_64px_rgba(0,0,0,0.6)] w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
                  <h2 className="font-['Russo_One'] text-base text-white">Create New Tournament</h2>
                  <button onClick={() => setShowCreateTournamentForm(false)}
                    className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.09] transition-all cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                <form onSubmit={handleCreateTournament} className="flex flex-col flex-1 min-h-0">
                <div className="p-6 space-y-6 overflow-y-auto flex-1">

                  {/* Basic Info */}
                  <div>
                    <p className={labelCls}>Basic Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className={labelCls}>Tournament Name <span className="text-[#e85d5d]">*</span></label>
                        <input type="text" value={tournamentForm.name} required className={fieldCls} placeholder="Enter tournament name"
                          onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelCls}>Game <span className="text-[#e85d5d]">*</span></label>
                        <select value={tournamentForm.game} required className={`${fieldCls} [&>option]:bg-[#161618]`}
                          onChange={(e) => setTournamentForm({ ...tournamentForm, game: e.target.value })}>
                          {GAMES.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      {tournamentForm.game === "Other" && (
                        <div>
                          <label className={labelCls}>Specify Game <span className="text-[#e85d5d]">*</span></label>
                          <input type="text" value={tournamentForm.customGame} required className={fieldCls} placeholder="Enter game name"
                            onChange={(e) => setTournamentForm({ ...tournamentForm, customGame: e.target.value })} />
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <label className={labelCls}>Description</label>
                      <textarea value={tournamentForm.description} rows={3} maxLength={2000} className={`${fieldCls} resize-none`}
                        placeholder="Describe your tournament…"
                        onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })} />
                    </div>
                  </div>

                  {/* Format */}
                  <div className="pt-4 border-t border-white/[0.06]">
                    <p className={labelCls}>Tournament Format</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className={labelCls}>Matchmaking Type <span className="text-[#e85d5d]">*</span></label>
                        <select value={tournamentForm.matchmakingType} required className={`${fieldCls} [&>option]:bg-[#161618]`}
                          onChange={(e) => setTournamentForm({ ...tournamentForm, matchmakingType: e.target.value })}>
                          <option value="single_elimination">Single Elimination</option>
                          <option value="double_elimination">Double Elimination</option>
                          <option value="round_robin">Round Robin</option>
                          <option value="swiss">Swiss System</option>
                          <option value="battle_royale">Battle Royale Scoring</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Total Slots <span className="text-[#e85d5d]">*</span></label>
                        <select value={tournamentForm.totalSlots} required className={`${fieldCls} [&>option]:bg-[#161618]`}
                          onChange={(e) => setTournamentForm({ ...tournamentForm, totalSlots: parseInt(e.target.value) })}>
                          {(tournamentForm.matchmakingType === "single_elimination" || tournamentForm.matchmakingType === "double_elimination")
                            ? [2,4,8,16,32,64,128].map((n) => <option key={n} value={n}>{n} Teams</option>)
                            : [4,6,8,10,12,16,20,24,32,50,100].map((n) => <option key={n} value={n}>{n} Teams</option>)
                          }
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Team Size</label>
                        <input type="number" value={tournamentForm.teamSize || ""} min={1} max={100} className={fieldCls} placeholder="5"
                          onChange={(e) => setTournamentForm({ ...tournamentForm, teamSize: parseInt(e.target.value) || 0 })} />
                        <p className="text-white/20 text-[11px] mt-1">Players per team</p>
                      </div>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="pt-4 border-t border-white/[0.06]">
                    <p className={labelCls}>Schedule</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      {[
                        { label: "Registration Start *", key: "registrationStartDate", required: true },
                        { label: "Registration End *",   key: "registrationEndDate",   required: true },
                        { label: "Tournament Start *",   key: "tournamentStartDate",   required: true },
                        { label: "Tournament End",       key: "tournamentEndDate",     required: false },
                      ].map(({ label, key, required }) => (
                        <div key={key}>
                          <label className={labelCls}>{label}</label>
                          <input type="datetime-local" required={required}
                            value={tournamentForm[key as keyof typeof tournamentForm] as string}
                            className={fieldCls}
                            onChange={(e) => setTournamentForm({ ...tournamentForm, [key]: e.target.value })} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prize & extras */}
                  <div className="pt-4 border-t border-white/[0.06]">
                    <p className={labelCls}>Prize &amp; Additional Info</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <div>
                        <label className={labelCls}>Prize Pool (NPR)</label>
                        <input type="number" min={0} value={tournamentForm.prizePool.amount || ""} className={fieldCls} placeholder="50000"
                          onChange={(e) => setTournamentForm({ ...tournamentForm, prizePool: { ...tournamentForm.prizePool, amount: parseInt(e.target.value) || 0 } })} />
                      </div>
                      <div>
                        <label className={labelCls}>Entry Fee (NPR)</label>
                        <input type="number" min={0} value={tournamentForm.entryFee.amount || ""} className={fieldCls} placeholder="0 for free"
                          onChange={(e) => setTournamentForm({ ...tournamentForm, entryFee: { ...tournamentForm.entryFee, amount: parseInt(e.target.value) || 0 } })} />
                      </div>
                      {tournamentForm.entryFee.amount > 0 && (
                        <div className="sm:col-span-2">
                          <label className={labelCls}>Payment Instructions <span className="text-[#e85d5d]">*</span></label>
                          <textarea required value={tournamentForm.entryFee.paymentInstructions} rows={3} maxLength={1000}
                            className={`${fieldCls} resize-none`}
                            placeholder="e.g. Pay NPR 500 to eSewa 98XXXXXXXX with your team name in remarks"
                            onChange={(e) => setTournamentForm({ ...tournamentForm, entryFee: { ...tournamentForm.entryFee, paymentInstructions: e.target.value } })} />
                        </div>
                      )}
                      <div>
                        <label className={labelCls}>Stream URL</label>
                        <input type="url" value={tournamentForm.streamUrl} className={fieldCls} placeholder="https://youtube.com/…"
                          onChange={(e) => setTournamentForm({ ...tournamentForm, streamUrl: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelCls}>Discord URL</label>
                        <input type="url" value={tournamentForm.discordUrl} className={fieldCls} placeholder="https://discord.gg/…"
                          onChange={(e) => setTournamentForm({ ...tournamentForm, discordUrl: e.target.value })} />
                      </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer mt-4">
                      <div onClick={() => setTournamentForm({ ...tournamentForm, requirements: { ...tournamentForm.requirements, isNepalOnly: !tournamentForm.requirements.isNepalOnly } })}
                        className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${tournamentForm.requirements.isNepalOnly ? "border-[#e85d5d]" : "border-white/20"}`}
                        style={tournamentForm.requirements.isNepalOnly ? { background: ACCENT } : {}}>
                        {tournamentForm.requirements.isNepalOnly && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
                        <input type="checkbox" checked={tournamentForm.requirements.isNepalOnly} className="sr-only" readOnly />
                      </div>
                      <span className="text-white/55 text-sm">Nepal Only Tournament</span>
                    </label>
                  </div>

                </div>

                {/* Sticky footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06] bg-[#161618] flex-shrink-0">
                  <button type="button" onClick={() => setShowCreateTournamentForm(false)}
                    className="btn-ghost flex-1 py-3 text-sm cursor-pointer">Cancel</button>
                  <SaveButton type="submit" saving={savingTournament} label="Create Tournament" className="flex-1 py-3 text-sm" />
                </div>
                </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── EDIT PROFILE DRAWER ── */}
      {isEditingProfile && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => { setIsEditingProfile(false); fetchOrganization(); }} />
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-[#161618] border-l border-white/[0.08] z-50 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] flex-shrink-0">
              <h2 className="font-['Russo_One'] text-white text-lg">Edit Profile</h2>
              <button onClick={() => { setIsEditingProfile(false); fetchOrganization(); }}
                className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.09] transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            {/* Scrollable form */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Organization Name</label>
                    <input type="text" value={profileForm.organizationName} disabled
                      className={`${fieldCls} opacity-40 cursor-not-allowed`} />
                    <p className="text-white/20 text-[11px] mt-1">Name cannot be changed</p>
                  </div>
                  <div>
                    <label className={labelCls}>Tag</label>
                    <input type="text" value={profileForm.tag} disabled
                      className={`${fieldCls} uppercase opacity-40 cursor-not-allowed`} />
                    <p className="text-white/20 text-[11px] mt-1">Tag cannot be changed</p>
                  </div>
                  <div>
                    <label className={labelCls}>Country</label>
                    <input type="text" value={profileForm.country} className={fieldCls} placeholder="Nepal"
                      onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Founded Date</label>
                    <input type="date" value={profileForm.foundedDate} className={fieldCls}
                      onChange={(e) => setProfileForm({ ...profileForm, foundedDate: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Contact Email</label>
                    <input type="email" value={profileForm.contactEmail} className={fieldCls} placeholder="contact@org.com"
                      onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Contact Phone</label>
                    <input type="tel" value={profileForm.contactPhone} className={fieldCls} placeholder="+977-9800000000"
                      onChange={(e) => setProfileForm({ ...profileForm, contactPhone: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={profileForm.description} rows={3} maxLength={2000} className={`${fieldCls} resize-none`}
                    placeholder="Tell the community about your organization…"
                    onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })} />
                  <p className="text-right text-white/20 text-xs mt-1">{profileForm.description.length}/2000</p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setProfileForm({ ...profileForm, isNepal: !profileForm.isNepal })}
                    className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${profileForm.isNepal ? "border-[#e85d5d]" : "border-white/20"}`}
                    style={profileForm.isNepal ? { background: ACCENT } : {}}>
                    {profileForm.isNepal && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
                    <input type="checkbox" checked={profileForm.isNepal} className="sr-only" readOnly />
                  </div>
                  <span className="text-white/55 text-sm">Based in Nepal 🇳🇵</span>
                </label>

                <div className="pt-4 border-t border-white/[0.06]">
                  <p className={labelCls}>Social Links</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {(["twitter","facebook","instagram","website","discord","youtube"] as const).map((key) => (
                      <div key={key}>
                        <label className="block text-white/25 text-[10px] uppercase tracking-widest mb-1 capitalize">{key}</label>
                        <input type="text" value={profileForm.socialLinks[key]} className={fieldCls}
                          placeholder={`https://${key === "website" ? "yourorg.com" : `${key}.com/yourorg`}`}
                          onChange={(e) => setProfileForm({ ...profileForm, socialLinks: { ...profileForm.socialLinks, [key]: e.target.value } })} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2 pb-4">
                  <button type="button" onClick={() => { setIsEditingProfile(false); fetchOrganization(); }}
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

      {/* Modals */}
      {showRemoveStaffModal && (
        <ConfirmDialog
          title="Remove Staff Member?"
          message="Are you sure? They will lose access to organization management features."
          confirmText="Yes, Remove" cancelText="Cancel"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleRemoveStaff}
          onCancel={() => { setShowRemoveStaffModal(false); setStaffToRemove(null); }}
        />
      )}
      {showAddStaffModal && (
        <AddStaffModal onSubmit={handleAddStaff} onClose={() => setShowAddStaffModal(false)} loading={addingStaff} />
      )}
      {showDeleteTournamentModal && tournamentToDelete && (
        <ConfirmDialog
          title="Delete Tournament?"
          message={`Delete "${tournamentToDelete.name}"? This cannot be undone. All registrations and bracket data will be permanently removed.`}
          confirmText="Yes, Delete" cancelText="Cancel"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleDeleteTournament}
          onCancel={() => { setShowDeleteTournamentModal(false); setTournamentToDelete(null); }}
        />
      )}
      {showDeleteTeamModal && teamToDelete && (
        <ConfirmDialog
          title="Delete Team?"
          message={`Delete "${teamToDelete.name}" [${teamToDelete.tag}]? This cannot be undone.`}
          confirmText="Yes, Delete" cancelText="Cancel"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleDeleteTeam}
          onCancel={() => { setShowDeleteTeamModal(false); setTeamToDelete(null); }}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Footer />
    </div>
  );
}

export default function OrganizationProfile() {
  return (
    <Suspense fallback={<div style={{minHeight: '60vh'}} />}>
      <OrganizationProfileInner />
    </Suspense>
  );
}

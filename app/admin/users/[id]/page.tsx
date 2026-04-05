"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

interface UserDetail {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  isBanned: boolean;
  isSuspended: boolean;
  suspendedUntil: string | null;
  banReason: string | null;
  isVerified: boolean;
  warnings: { reason: string; issuedBy: string; createdAt: string }[];
  createdAt: string;
  lastLogin: string | null;
}

interface TeamInfo {
  _id: string;
  name: string;
  tag: string;
  game: string;
}

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Action form state
  const [showWarnForm, setShowWarnForm] = useState(false);
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [showBanForm, setShowBanForm] = useState(false);
  const [warnReason, setWarnReason] = useState("");
  const [suspendUntil, setSuspendUntil] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [banReason, setBanReason] = useState("");

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users/${id}`);
      if (res.data.success) {
        setUser(res.data.data.user);
        setMessageCount(res.data.data.messageCount);
        setTeams(res.data.data.teams || []);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWarn = async () => {
    if (!warnReason.trim()) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${id}/warn`, { reason: warnReason });
      setWarnReason("");
      setShowWarnForm(false);
      fetchUser();
    } catch (err) {
      console.error("Warn failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!suspendUntil) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${id}/suspend`, { until: suspendUntil, reason: suspendReason });
      setShowSuspendForm(false);
      fetchUser();
    } catch (err) {
      console.error("Suspend failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBan = async () => {
    if (!banReason.trim()) return;
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${id}/ban`, { reason: banReason });
      setShowBanForm(false);
      fetchUser();
    } catch (err) {
      console.error("Ban failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async () => {
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${id}/unban`);
      fetchUser();
    } catch (err) {
      console.error("Unban failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    setActionLoading(true);
    try {
      await api.post(`/admin/users/${id}/unsuspend`);
      fetchUser();
    } catch (err) {
      console.error("Unsuspend failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading user details...</div>;
  }

  if (!user) {
    return <div className="text-red-400">User not found</div>;
  }

  return (
    <div>
      <Link href="/admin/users" className="text-indigo-400 hover:underline text-sm mb-4 inline-block">&larr; Back to Users</Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
          {user.username[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{user.username}</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {user.isAdmin && <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg text-sm">Admin</span>}
          {user.isBanned && <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-lg text-sm">Banned</span>}
          {user.isSuspended && <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-lg text-sm">Suspended</span>}
          {!user.isBanned && !user.isSuspended && !user.isAdmin && <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-sm">Active</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="bg-white/10 border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Account Info</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Verified</span><span className="text-white">{user.isVerified ? "Yes" : "No"}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Joined</span><span className="text-white">{new Date(user.createdAt).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Last Login</span><span className="text-white">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Messages</span><span className="text-white">{messageCount}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Teams</span><span className="text-white">{teams.length}</span></div>
            {user.isBanned && <div className="flex justify-between"><span className="text-gray-400">Ban Reason</span><span className="text-red-400">{user.banReason}</span></div>}
            {user.isSuspended && user.suspendedUntil && <div className="flex justify-between"><span className="text-gray-400">Suspended Until</span><span className="text-yellow-400">{new Date(user.suspendedUntil).toLocaleDateString()}</span></div>}
          </div>
        </div>

        {/* Teams */}
        <div className="bg-white/10 border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Teams</h2>
          {teams.length === 0 ? (
            <p className="text-gray-500 text-sm">No teams</p>
          ) : (
            <div className="space-y-2">
              {teams.map((t) => (
                <div key={t._id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                  <span className="text-white text-sm">{t.name} <span className="text-gray-500">[{t.tag}]</span></span>
                  <span className="text-gray-500 text-xs">{t.game}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white/10 border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Actions</h2>
          {user.isAdmin ? (
            <p className="text-gray-500 text-sm">Cannot take actions on admin accounts</p>
          ) : (
            <div className="space-y-3">
              {/* Warn */}
              {showWarnForm ? (
                <div className="space-y-2">
                  <input type="text" placeholder="Warning reason..." value={warnReason} onChange={(e) => setWarnReason(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  <div className="flex gap-2">
                    <button onClick={handleWarn} disabled={actionLoading} className="bg-yellow-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-yellow-700 disabled:opacity-50">Submit</button>
                    <button onClick={() => setShowWarnForm(false)} className="bg-white/10 text-white text-sm px-4 py-1.5 rounded-lg">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowWarnForm(true)} className="w-full bg-yellow-600/20 text-yellow-400 text-sm px-4 py-2 rounded-lg hover:bg-yellow-600/30">Issue Warning</button>
              )}

              {/* Suspend / Unsuspend */}
              {user.isSuspended ? (
                <button onClick={handleUnsuspend} disabled={actionLoading} className="w-full bg-green-600/20 text-green-400 text-sm px-4 py-2 rounded-lg hover:bg-green-600/30 disabled:opacity-50">Unsuspend</button>
              ) : showSuspendForm ? (
                <div className="space-y-2">
                  <input type="date" value={suspendUntil} onChange={(e) => setSuspendUntil(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  <input type="text" placeholder="Reason (optional)" value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  <div className="flex gap-2">
                    <button onClick={handleSuspend} disabled={actionLoading} className="bg-orange-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-orange-700 disabled:opacity-50">Suspend</button>
                    <button onClick={() => setShowSuspendForm(false)} className="bg-white/10 text-white text-sm px-4 py-1.5 rounded-lg">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowSuspendForm(true)} className="w-full bg-orange-600/20 text-orange-400 text-sm px-4 py-2 rounded-lg hover:bg-orange-600/30">Suspend User</button>
              )}

              {/* Ban / Unban */}
              {user.isBanned ? (
                <button onClick={handleUnban} disabled={actionLoading} className="w-full bg-green-600/20 text-green-400 text-sm px-4 py-2 rounded-lg hover:bg-green-600/30 disabled:opacity-50">Unban</button>
              ) : showBanForm ? (
                <div className="space-y-2">
                  <input type="text" placeholder="Ban reason (required)..." value={banReason} onChange={(e) => setBanReason(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  <div className="flex gap-2">
                    <button onClick={handleBan} disabled={actionLoading} className="bg-red-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50">Ban</button>
                    <button onClick={() => setShowBanForm(false)} className="bg-white/10 text-white text-sm px-4 py-1.5 rounded-lg">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowBanForm(true)} className="w-full bg-red-600/20 text-red-400 text-sm px-4 py-2 rounded-lg hover:bg-red-600/30">Ban User</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Warnings History */}
      <div className="mt-6 bg-white/10 border border-white/10 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Warning History ({user.warnings?.length || 0})</h2>
        {!user.warnings || user.warnings.length === 0 ? (
          <p className="text-gray-500 text-sm">No warnings issued</p>
        ) : (
          <div className="space-y-3">
            {user.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/5 rounded-lg px-4 py-3">
                <div className="bg-yellow-500/20 text-yellow-400 p-1 rounded mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{w.reason}</p>
                  <p className="text-gray-500 text-xs mt-1">{new Date(w.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

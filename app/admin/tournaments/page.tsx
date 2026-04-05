"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface TournamentItem {
  _id: string;
  name: string;
  game: string;
  organizerName: string;
  status: string;
  totalSlots: number;
  participantCount: number;
  tournamentStartDate: string;
  prizePool: { amount: number; currency: string };
  isPublished: boolean;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  registration_open: "bg-green-500/20 text-green-400",
  registration_closed: "bg-yellow-500/20 text-yellow-400",
  ongoing: "bg-blue-500/20 text-blue-400",
  completed: "bg-indigo-500/20 text-indigo-400",
  cancelled: "bg-red-500/20 text-red-400",
  overdue: "bg-orange-500/20 text-orange-400",
};

const games = ["Valorant", "CS2", "PUBG Mobile", "Dota 2", "League of Legends", "Free Fire"];

export default function TournamentOversight() {
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [gameFilter, setGameFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: string; name: string } | null>(null);

  useEffect(() => {
    fetchTournaments();
  }, [statusFilter, gameFilter, page]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (gameFilter) params.game = gameFilter;
      const res = await api.get("/admin/tournaments", { params });
      if (res.data.success) {
        setTournaments(res.data.data.tournaments);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch tournaments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: string) => {
    setActionLoading(id);
    try {
      if (action === "cancel") {
        await api.post(`/admin/tournaments/${id}/cancel`);
      } else {
        await api.post(`/admin/tournaments/${id}/force-complete`);
      }
      setConfirmAction(null);
      fetchTournaments();
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Tournament Oversight</h1>
      <p className="text-gray-400 mb-6">View and manage all platform tournaments</p>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white text-sm">
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="registration_open">Registration Open</option>
          <option value="registration_closed">Registration Closed</option>
          <option value="ongoing">Ongoing</option>
          <option value="overdue">Overdue</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={gameFilter} onChange={(e) => { setGameFilter(e.target.value); setPage(1); }} className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white text-sm">
          <option value="">All Games</option>
          {games.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/10 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Name</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Game</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Organizer</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Status</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Teams</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Start Date</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={7} className="px-6 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                </tr>
              ))
            ) : tournaments.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No tournaments found</td></tr>
            ) : (
              tournaments.map((t) => (
                <tr key={t._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 text-white text-sm font-medium">{t.name}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{t.game}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{t.organizerName}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded ${statusColors[t.status] || "bg-gray-500/20 text-gray-400"}`}>
                      {t.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{t.participantCount}/{t.totalSlots}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{t.tournamentStartDate ? new Date(t.tournamentStartDate).toLocaleDateString() : "-"}</td>
                  <td className="px-6 py-4">
                    {confirmAction?.id === t._id ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(t._id, confirmAction.action)} disabled={actionLoading === t._id} className="bg-red-600 text-white text-xs px-3 py-1 rounded disabled:opacity-50">Confirm</button>
                        <button onClick={() => setConfirmAction(null)} className="bg-white/10 text-white text-xs px-3 py-1 rounded">Cancel</button>
                      </div>
                    ) : t.status !== "cancelled" && t.status !== "completed" ? (
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmAction({ id: t._id, action: "cancel", name: t.name })} className="text-red-400 hover:text-red-300 text-xs">Cancel</button>
                        {(t.status === "ongoing" || t.status === "overdue") && (
                          <button onClick={() => setConfirmAction({ id: t._id, action: "complete", name: t.name })} className="text-green-400 hover:text-green-300 text-xs">Force Complete</button>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="bg-white/10 text-white px-4 py-2 rounded-lg disabled:opacity-30 text-sm">Previous</button>
          <span className="text-gray-400 py-2 px-4 text-sm">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="bg-white/10 text-white px-4 py-2 rounded-lg disabled:opacity-30 text-sm">Next</button>
        </div>
      )}
    </div>
  );
}

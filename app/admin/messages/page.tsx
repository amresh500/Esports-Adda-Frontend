"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Report {
  reporter: string;
  reporterModel: string;
  reason: string;
  details: string;
  createdAt: string;
}

interface FlaggedMessage {
  _id: string;
  game: string;
  senderName: string;
  senderTag: string;
  senderType: string;
  senderModel: string;
  sender: string;
  content: string;
  autoFlagged: boolean;
  autoFlagReason: string | null;
  reportCount: number;
  reports: Report[];
  createdAt: string;
}

export default function MessageModeration() {
  const [messages, setMessages] = useState<FlaggedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameFilter, setGameFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: string } | null>(null);

  const games = ["Valorant", "CS2", "PUBG Mobile", "Dota 2", "League of Legends", "Free Fire"];

  useEffect(() => {
    fetchFlagged();
  }, [gameFilter, page]);

  const fetchFlagged = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (gameFilter) params.game = gameFilter;
      const res = await api.get("/admin/messages/flagged", { params });
      if (res.data.success) {
        setMessages(res.data.data.messages);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch flagged messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: string) => {
    setActionLoading(id);
    try {
      if (action === "dismiss") {
        await api.patch(`/admin/messages/${id}/dismiss`);
      } else if (action === "delete") {
        await api.patch(`/admin/messages/${id}/delete`);
      } else if (action === "warn") {
        await api.patch(`/admin/messages/${id}/warn-sender`);
      }
      setMessages((prev) => prev.filter((m) => m._id !== id));
      setConfirmAction(null);
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Message Moderation</h1>
      <p className="text-gray-400 mb-6">Review and take action on flagged chat messages</p>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={gameFilter}
          onChange={(e) => { setGameFilter(e.target.value); setPage(1); }}
          className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
        >
          <option value="">All Games</option>
          {games.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-6 animate-pulse h-40" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white/10 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-lg">No flagged messages to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg._id} className="bg-white/10 border border-white/10 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{msg.senderName}</span>
                    {msg.senderTag && <span className="text-gray-500 text-sm">[{msg.senderTag}]</span>}
                    <span className={`text-xs px-2 py-0.5 rounded ${msg.senderType === "organization" ? "bg-purple-500/20 text-purple-400" : "bg-blue-500/20 text-blue-400"}`}>
                      {msg.senderType}
                    </span>
                    <span className="text-gray-500 text-xs bg-white/5 px-2 py-0.5 rounded">{msg.game}</span>
                  </div>
                  <p className="text-gray-300 mt-2 bg-white/5 rounded-lg p-3">{msg.content}</p>
                  <p className="text-gray-500 text-xs mt-2">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {msg.autoFlagged && (
                    <div className="bg-orange-500/20 text-orange-400 font-medium text-xs px-3 py-1 rounded-lg">
                      Auto-flagged
                    </div>
                  )}
                  <div className="bg-red-500/20 text-red-400 font-bold text-sm px-3 py-1 rounded-lg">
                    {msg.reportCount} report{msg.reportCount !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Auto-flag reason */}
              {msg.autoFlagged && msg.autoFlagReason && (
                <div className="mb-3 flex items-center gap-2 text-sm">
                  <span className="bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded text-xs">Filter</span>
                  <span className="text-gray-400">Detected: {msg.autoFlagReason}</span>
                </div>
              )}

              {/* Reports */}
              <div className="mb-4">
                <p className="text-gray-500 text-xs font-medium mb-2">REPORTS</p>
                <div className="space-y-2">
                  {msg.reports.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs">{r.reason}</span>
                      {r.details && <span className="text-gray-400">{r.details}</span>}
                      <span className="text-gray-600 text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {confirmAction?.id === msg._id ? (
                <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-sm flex-1">
                    Confirm {confirmAction.action === "delete" ? "delete message" : confirmAction.action === "warn" ? "warn sender" : "dismiss reports"}?
                  </p>
                  <button
                    onClick={() => handleAction(msg._id, confirmAction.action)}
                    disabled={actionLoading === msg._id}
                    className="bg-red-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading === msg._id ? "..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="bg-white/10 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-white/20"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmAction({ id: msg._id, action: "dismiss" })}
                    className="bg-gray-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => setConfirmAction({ id: msg._id, action: "delete" })}
                    className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Delete Message
                  </button>
                  {msg.senderModel === "User" && (
                    <button
                      onClick={() => setConfirmAction({ id: msg._id, action: "warn" })}
                      className="bg-yellow-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-yellow-700"
                    >
                      Warn Sender
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="bg-white/10 text-white px-4 py-2 rounded-lg disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-gray-400 py-2 px-4">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="bg-white/10 text-white px-4 py-2 rounded-lg disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

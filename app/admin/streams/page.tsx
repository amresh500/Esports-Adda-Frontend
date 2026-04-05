"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface PendingStream {
  _id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnail: string;
  game: string;
  tournament: any;
  tournamentName: string;
  organizerName: string;
  startTime: string;
  createdAt: string;
}

export default function StreamApproval() {
  const [streams, setStreams] = useState<PendingStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: string } | null>(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/streams/pending");
      if (res.data.success) setStreams(res.data.data.streams);
    } catch (err) {
      console.error("Failed to fetch pending streams:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: string) => {
    setActionLoading(id);
    try {
      if (action === "approve") {
        await api.patch(`/admin/streams/${id}/approve`);
      } else {
        await api.delete(`/admin/streams/${id}/reject`);
      }
      setStreams((prev) => prev.filter((s) => s._id !== id));
      setConfirmAction(null);
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|v=|embed\/)([^#&?]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Stream Approval</h1>
      <p className="text-gray-400 mb-6">Review and approve pending stream submissions</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/10 rounded-xl animate-pulse h-72" />
          ))}
        </div>
      ) : streams.length === 0 ? (
        <div className="bg-white/10 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-lg">No pending streams to review</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {streams.map((stream) => {
            const videoId = extractVideoId(stream.youtubeUrl);
            return (
              <div key={stream._id} className="bg-white/10 border border-white/10 rounded-xl overflow-hidden">
                {/* Thumbnail */}
                <div className="aspect-video bg-black relative">
                  {videoId ? (
                    <img
                      src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">No thumbnail</div>
                  )}
                  <span className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">{stream.game}</span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-medium text-lg">{stream.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{stream.tournamentName || stream.tournament?.name || "Unknown Tournament"}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>By {stream.organizerName}</span>
                    <span>{new Date(stream.startTime).toLocaleString()}</span>
                  </div>
                  {stream.description && (
                    <p className="text-gray-400 text-sm mt-2 line-clamp-2">{stream.description}</p>
                  )}

                  {/* Actions */}
                  {confirmAction?.id === stream._id ? (
                    <div className="flex items-center gap-3 mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-400 text-sm flex-1">
                        {confirmAction.action === "reject" ? "Reject this stream?" : "Approve this stream?"}
                      </p>
                      <button
                        onClick={() => handleAction(stream._id, confirmAction.action)}
                        disabled={actionLoading === stream._id}
                        className={`text-white text-sm px-4 py-1.5 rounded-lg disabled:opacity-50 ${
                          confirmAction.action === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {actionLoading === stream._id ? "..." : "Confirm"}
                      </button>
                      <button onClick={() => setConfirmAction(null)} className="bg-white/10 text-white text-sm px-4 py-1.5 rounded-lg">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => setConfirmAction({ id: stream._id, action: "approve" })}
                        className="flex-1 bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setConfirmAction({ id: stream._id, action: "reject" })}
                        className="flex-1 bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

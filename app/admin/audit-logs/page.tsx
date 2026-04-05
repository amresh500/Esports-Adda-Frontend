"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface AuditLogItem {
  _id: string;
  admin: { _id: string; username: string };
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

const actionLabels: Record<string, { label: string; color: string }> = {
  user_warned: { label: "User Warned", color: "text-yellow-400 bg-yellow-500/10" },
  user_suspended: { label: "User Suspended", color: "text-orange-400 bg-orange-500/10" },
  user_banned: { label: "User Banned", color: "text-red-400 bg-red-500/10" },
  user_unbanned: { label: "User Unbanned", color: "text-green-400 bg-green-500/10" },
  user_unsuspended: { label: "User Unsuspended", color: "text-green-400 bg-green-500/10" },
  message_dismissed: { label: "Reports Dismissed", color: "text-gray-400 bg-gray-500/10" },
  message_deleted: { label: "Message Deleted", color: "text-red-400 bg-red-500/10" },
  message_sender_warned: { label: "Sender Warned", color: "text-yellow-400 bg-yellow-500/10" },
  stream_approved: { label: "Stream Approved", color: "text-green-400 bg-green-500/10" },
  stream_rejected: { label: "Stream Rejected", color: "text-red-400 bg-red-500/10" },
  tournament_cancelled: { label: "Tournament Cancelled", color: "text-red-400 bg-red-500/10" },
  tournament_force_completed: { label: "Tournament Completed", color: "text-indigo-400 bg-indigo-500/10" },
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, targetFilter, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 30 };
      if (actionFilter) params.action = actionFilter;
      if (targetFilter) params.targetType = targetFilter;
      const res = await api.get("/admin/audit-logs", { params });
      if (res.data.success) {
        setLogs(res.data.data.logs);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
      <p className="text-gray-400 mb-6">Complete history of all admin actions</p>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white text-sm">
          <option value="">All Actions</option>
          {Object.entries(actionLabels).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <select value={targetFilter} onChange={(e) => { setTargetFilter(e.target.value); setPage(1); }} className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white text-sm">
          <option value="">All Targets</option>
          <option value="User">User</option>
          <option value="Message">Message</option>
          <option value="Stream">Stream</option>
          <option value="Tournament">Tournament</option>
          <option value="OrganizationAccount">Organization</option>
        </select>
      </div>

      {/* Logs */}
      <div className="bg-white/10 border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No audit logs found</div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((log) => {
              const info = actionLabels[log.action] || { label: log.action, color: "text-gray-400 bg-gray-500/10" };
              return (
                <div key={log._id} className="px-6 py-4 flex items-center gap-4">
                  <span className={`text-xs px-2.5 py-1 rounded font-medium flex-shrink-0 ${info.color}`}>
                    {info.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{log.details}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      by <span className="text-gray-400">{log.admin?.username || "Unknown"}</span>
                      &nbsp;&middot;&nbsp;Target: {log.targetType}
                    </p>
                  </div>
                  <span className="text-gray-600 text-xs flex-shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface Stats {
  totalUsers: number;
  totalOrgs: number;
  totalTournaments: number;
  totalTeams: number;
  activeUsers7d: number;
  messagesToday: number;
  flaggedMessages: number;
  pendingStreams: number;
}

const statCards = [
  { key: "totalUsers", label: "Total Users", color: "from-blue-500 to-blue-700", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" },
  { key: "totalOrgs", label: "Organizations", color: "from-purple-500 to-purple-700", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" },
  { key: "totalTournaments", label: "Tournaments", color: "from-green-500 to-green-700", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622" },
  { key: "totalTeams", label: "Teams", color: "from-cyan-500 to-cyan-700", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" },
  { key: "activeUsers7d", label: "Active (7d)", color: "from-yellow-500 to-yellow-700", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { key: "messagesToday", label: "Messages Today", color: "from-indigo-500 to-indigo-700", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { key: "flaggedMessages", label: "Flagged Messages", color: "from-red-500 to-red-700", icon: "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9", link: "/admin/messages" },
  { key: "pendingStreams", label: "Pending Streams", color: "from-orange-500 to-orange-700", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", link: "/admin/streams" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/stats");
      if (res.data.success) setStats(res.data.data);
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-6 animate-pulse h-32" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const value = stats[card.key as keyof Stats];
            const content = (
              <div className={`bg-gradient-to-br ${card.color} rounded-xl p-6 transition-transform hover:scale-105`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/70 text-sm">{card.label}</p>
                    <p className="text-3xl font-bold text-white mt-2">{value}</p>
                  </div>
                  <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                  </svg>
                </div>
              </div>
            );

            if ((card as any).link) {
              return (
                <Link key={card.key} href={(card as any).link}>
                  {content}
                </Link>
              );
            }
            return <div key={card.key}>{content}</div>;
          })}
        </div>
      ) : (
        <p className="text-red-400">Failed to load stats.</p>
      )}

      {/* Quick Links */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/admin/messages" className="bg-white/10 border border-white/10 rounded-xl p-5 hover:border-red-500/50 transition-colors">
            <h3 className="text-white font-medium">Review Flagged Messages</h3>
            <p className="text-gray-400 text-sm mt-1">Review and moderate reported chat messages</p>
          </Link>
          <Link href="/admin/streams" className="bg-white/10 border border-white/10 rounded-xl p-5 hover:border-orange-500/50 transition-colors">
            <h3 className="text-white font-medium">Approve Streams</h3>
            <p className="text-gray-400 text-sm mt-1">Review and approve pending stream submissions</p>
          </Link>
          <Link href="/admin/users" className="bg-white/10 border border-white/10 rounded-xl p-5 hover:border-blue-500/50 transition-colors">
            <h3 className="text-white font-medium">Manage Users</h3>
            <p className="text-gray-400 text-sm mt-1">View, warn, suspend, or ban platform users</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

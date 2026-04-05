"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

interface OrgDetail {
  _id: string;
  organizationName: string;
  tag: string;
  email: string;
  description: string;
  country: string;
  isNepal: boolean;
  foundedDate: string;
  contactEmail: string;
  contactPhone: string;
  teams: { _id: string; name: string; tag: string; game: string }[];
  staff: { username: string; role: string; department: string; isActive: boolean }[];
  stats: { totalTeams: number; totalPlayers: number; championships: number };
  createdAt: string;
}

export default function OrgDetailPage() {
  const { id } = useParams();
  const [org, setOrg] = useState<OrgDetail | null>(null);
  const [tournamentCount, setTournamentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrg();
  }, [id]);

  const fetchOrg = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/organizations/${id}`);
      if (res.data.success) {
        setOrg(res.data.data.organization);
        setTournamentCount(res.data.data.tournamentCount);
      }
    } catch (err) {
      console.error("Failed to fetch organization:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-gray-400">Loading organization...</div>;
  if (!org) return <div className="text-red-400">Organization not found</div>;

  return (
    <div>
      <Link href="/admin/organizations" className="text-indigo-400 hover:underline text-sm mb-4 inline-block">&larr; Back to Organizations</Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-xl bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
          {org.tag[0]}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{org.organizationName}</h1>
          <p className="text-gray-400">[{org.tag}] &middot; {org.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/10 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{org.teams?.length || 0}</p>
          <p className="text-gray-400 text-sm">Teams</p>
        </div>
        <div className="bg-white/10 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{org.staff?.length || 0}</p>
          <p className="text-gray-400 text-sm">Staff</p>
        </div>
        <div className="bg-white/10 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{tournamentCount}</p>
          <p className="text-gray-400 text-sm">Tournaments</p>
        </div>
        <div className="bg-white/10 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{org.stats?.championships || 0}</p>
          <p className="text-gray-400 text-sm">Championships</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info */}
        <div className="bg-white/10 border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Organization Info</h2>
          <div className="space-y-3 text-sm">
            {org.description && <div><span className="text-gray-400">Description:</span><p className="text-white mt-1">{org.description}</p></div>}
            <div className="flex justify-between"><span className="text-gray-400">Country</span><span className="text-white">{org.country || "Not set"}{org.isNepal ? " (Nepal)" : ""}</span></div>
            {org.foundedDate && <div className="flex justify-between"><span className="text-gray-400">Founded</span><span className="text-white">{new Date(org.foundedDate).toLocaleDateString()}</span></div>}
            <div className="flex justify-between"><span className="text-gray-400">Contact Email</span><span className="text-white">{org.contactEmail || "-"}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Registered</span><span className="text-white">{new Date(org.createdAt).toLocaleDateString()}</span></div>
          </div>
        </div>

        {/* Staff */}
        <div className="bg-white/10 border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Staff Members</h2>
          {!org.staff || org.staff.length === 0 ? (
            <p className="text-gray-500 text-sm">No staff members</p>
          ) : (
            <div className="space-y-2">
              {org.staff.map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                  <span className="text-white text-sm">{s.username}</span>
                  <div className="flex gap-2">
                    <span className="text-gray-500 text-xs">{s.department}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${s.role === "Admin" ? "bg-indigo-500/20 text-indigo-400" : "bg-gray-500/20 text-gray-400"}`}>{s.role}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Teams */}
        <div className="bg-white/10 border border-white/10 rounded-xl p-6 lg:col-span-2">
          <h2 className="text-white font-semibold mb-4">Teams</h2>
          {!org.teams || org.teams.length === 0 ? (
            <p className="text-gray-500 text-sm">No teams</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {org.teams.map((t) => (
                <div key={t._id} className="bg-white/5 rounded-lg px-4 py-3">
                  <p className="text-white text-sm font-medium">{t.name} <span className="text-gray-500">[{t.tag}]</span></p>
                  <p className="text-gray-500 text-xs mt-1">{t.game}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

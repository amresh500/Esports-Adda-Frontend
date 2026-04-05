"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface OrgItem {
  _id: string;
  organizationName: string;
  tag: string;
  email: string;
  country: string;
  teams: string[];
  staff: { username: string; role: string }[];
  createdAt: string;
}

export default function OrganizationOverview() {
  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchOrgs(), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, page]);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      const res = await api.get("/admin/organizations", { params });
      if (res.data.success) {
        setOrgs(res.data.data.organizations);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch organizations:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Organizations</h1>
      <p className="text-gray-400 mb-6">View all registered organizations</p>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-md bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500"
        />
      </div>

      <div className="bg-white/10 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Organization</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Tag</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Email</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Teams</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Staff</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Joined</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={7} className="px-6 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                </tr>
              ))
            ) : orgs.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No organizations found</td></tr>
            ) : (
              orgs.map((org) => (
                <tr key={org._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 text-white text-sm font-medium">{org.organizationName}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">[{org.tag}]</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{org.email}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{org.teams?.length || 0}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{org.staff?.length || 0}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{new Date(org.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/organizations/${org._id}`} className="text-indigo-400 hover:text-indigo-300 text-sm">View</Link>
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

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import api from "@/lib/api";

interface UserItem {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  isBanned: boolean;
  isSuspended: boolean;
  suspendedUntil: string | null;
  banReason: string | null;
  warnings: { reason: string; createdAt: string }[];
  createdAt: string;
  lastLogin: string | null;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, filter, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (filter === "banned") params.isBanned = "true";
      if (filter === "suspended") params.isSuspended = "true";
      const res = await api.get("/admin/users", { params });
      if (res.data.success) {
        setUsers(res.data.data.users);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (user: UserItem) => {
    if (user.isAdmin) return <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded">Admin</span>;
    if (user.isBanned) return <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded">Banned</span>;
    if (user.isSuspended) return <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded">Suspended</span>;
    return <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded">Active</span>;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
      <p className="text-gray-400 mb-6">Search, view, and manage platform users</p>

      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500"
        />
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
        >
          <option value="">All Users</option>
          <option value="banned">Banned</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/10 border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Username</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Email</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Status</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Warnings</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Joined</th>
              <th className="text-left text-gray-400 text-xs font-medium px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-6 py-4 text-white text-sm font-medium">{user.username}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{user.email}</td>
                  <td className="px-6 py-4">{getStatusBadge(user)}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{user.warnings?.length || 0}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/users/${user._id}`}
                      className="text-indigo-400 hover:text-indigo-300 text-sm"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

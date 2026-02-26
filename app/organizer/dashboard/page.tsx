"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConfirmDialog from "@/components/ConfirmDialog";
import { authAPI } from "@/lib/api";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function OrganizerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    youtubeUrl: "",
    game: "Valorant",
    tournament: "",
    startTime: "",
    endTime: "",
    isNepal: true,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Delete stream confirmation modal
  const [showDeleteStreamModal, setShowDeleteStreamModal] = useState(false);
  const [streamToDelete, setStreamToDelete] = useState<string | null>(null);

  const games = [
    "Valorant",
    "CS2",
    "PUBG Mobile",
    "Dota 2",
    "League of Legends",
    "Free Fire",
    "Mobile Legends",
    "Apex Legends",
    "Call of Duty",
    "Rainbow Six Siege",
    "Other",
  ];

  useEffect(() => {
    checkAuth();
    fetchMyStreams();
  }, []);

  const checkAuth = async () => {
    try {
      const accountType = localStorage.getItem("accountType");
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      // Organizations should access this dashboard
      if (accountType === "organization") {
        const response = await fetch(`${API_URL}/api/org-auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.data.organization);
        } else {
          router.push("/login");
        }
      } else {
        // Player accounts shouldn't access organization stream dashboard
        router.push("/profile");
      }
    } catch (error) {
      router.push("/login");
    }
  };

  const fetchMyStreams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/streams/my/streams`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStreams(response.data.data.streams);
    } catch (error) {
      console.error("Failed to fetch streams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      // Validate YouTube URL
      if (
        !formData.youtubeUrl.includes("youtube.com") &&
        !formData.youtubeUrl.includes("youtu.be")
      ) {
        setError("Please provide a valid YouTube URL");
        setFormLoading(false);
        return;
      }

      await axios.post(`${API_URL}/api/streams`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(
        "Stream added successfully! It will be visible after admin approval."
      );
      setFormData({
        title: "",
        description: "",
        youtubeUrl: "",
        game: "Valorant",
        tournament: "",
        startTime: "",
        endTime: "",
        isNepal: true,
      });
      setShowAddForm(false);
      fetchMyStreams();
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Failed to create stream"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteStreamModal = (id: string) => {
    setStreamToDelete(id);
    setShowDeleteStreamModal(true);
  };

  const handleDelete = async () => {
    if (!streamToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/streams/${streamToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Stream deleted successfully");
      setShowDeleteStreamModal(false);
      setStreamToDelete(null);
      fetchMyStreams();
    } catch (error) {
      setError("Failed to delete stream");
    }
  };

  const getStatusBadge = (stream: any) => {
    if (stream.status === "live") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-xs">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          LIVE
        </span>
      );
    }
    if (stream.status === "scheduled") {
      return (
        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-400 text-xs">
          UPCOMING
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-gray-500/20 border border-gray-500/50 rounded-full text-gray-400 text-xs">
        ENDED
      </span>
    );
  };

  const getApprovalBadge = (isApproved: boolean) => {
    return isApproved ? (
      <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-xs">
        APPROVED
      </span>
    ) : (
      <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-400 text-xs">
        PENDING APPROVAL
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415]">
      <Header />

      <div className="px-20 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-plus-jakarta text-4xl text-white mb-2">
              Organizer Dashboard
            </h1>
            <p className="font-plus-jakarta text-lg text-white/70">
              Welcome back, {user?.username}! Manage your tournament streams
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-[#e85d5d] hover:bg-[#d64d4d] rounded-lg text-white font-arial text-base transition-all"
          >
            {showAddForm ? "Cancel" : "+ Add New Stream"}
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Add Stream Form */}
        {showAddForm && (
          <div className="mb-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <h2 className="font-plus-jakarta text-2xl text-white mb-6">
              Add New Stream
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm font-arial mb-2">
                    Stream Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white font-arial placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="e.g., Nepal Valorant Championship - Finals"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-arial mb-2">
                    YouTube URL *
                  </label>
                  <input
                    type="url"
                    name="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white font-arial placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-arial mb-2">
                    Game *
                  </label>
                  <select
                    name="game"
                    value={formData.game}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white font-arial focus:outline-none focus:border-white/40"
                  >
                    {games.map((game) => (
                      <option key={game} value={game}>
                        {game}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-arial mb-2">
                    Tournament Name *
                  </label>
                  <input
                    type="text"
                    name="tournament"
                    value={formData.tournament}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white font-arial placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="e.g., Nepal Championship 2024"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-arial mb-2">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white font-arial focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-arial mb-2">
                    End Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white font-arial focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-arial mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white font-arial placeholder-gray-400 focus:outline-none focus:border-white/40"
                  placeholder="Add details about your tournament stream..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isNepal"
                  id="isNepal"
                  checked={formData.isNepal}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <label htmlFor="isNepal" className="text-white/70 text-sm font-arial">
                  This is a Nepal tournament 🇳🇵
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-3 bg-[#e85d5d] hover:bg-[#d64d4d] rounded-lg text-white font-arial text-base transition-all disabled:opacity-50"
                >
                  {formLoading ? "Adding..." : "Add Stream"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/15 rounded-lg text-white font-arial text-base transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Streams List */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <h2 className="font-plus-jakarta text-2xl text-white mb-6">
            My Streams ({streams.length})
          </h2>

          {streams.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/70 font-arial text-lg mb-4">
                You haven't added any streams yet
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-[#e85d5d] hover:bg-[#d64d4d] rounded-lg text-white font-arial text-base transition-all"
              >
                Add Your First Stream
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {streams.map((stream) => (
                <div
                  key={stream._id}
                  className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-arial text-xl text-white mb-2">
                        {stream.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {getStatusBadge(stream)}
                        {getApprovalBadge(stream.isApproved)}
                        {stream.isNepal && (
                          <span className="text-sm">🇳🇵</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => openDeleteStreamModal(stream._id)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 font-arial text-sm transition-all"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-white/50 mb-1">Game</p>
                      <p className="text-white">{stream.game}</p>
                    </div>
                    <div>
                      <p className="text-white/50 mb-1">Tournament</p>
                      <p className="text-white">{stream.tournament}</p>
                    </div>
                    <div>
                      <p className="text-white/50 mb-1">Start Time</p>
                      <p className="text-white">
                        {new Date(stream.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/50 mb-1">YouTube URL</p>
                      <a
                        href={stream.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        View Link
                      </a>
                    </div>
                  </div>

                  {stream.description && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-white/70 text-sm">
                        {stream.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Stream Confirmation Modal */}
      {showDeleteStreamModal && (
        <ConfirmDialog
          title="Delete Stream?"
          message="Are you sure you want to delete this stream? This action cannot be undone."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleDelete}
          onCancel={() => {
            setShowDeleteStreamModal(false);
            setStreamToDelete(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}

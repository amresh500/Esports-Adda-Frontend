"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "axios";
import { useLanguage } from "@/lib/LanguageContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function WatchNowPage() {
  const { t } = useLanguage();
  const [selectedGame, setSelectedGame] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreams();
  }, [selectedGame, selectedStatus, searchQuery]);

  const fetchStreams = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedGame !== "all") params.append("game", selectedGame);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (searchQuery) params.append("search", searchQuery);

      const response = await axios.get(
        `${API_URL}/api/streams?${params.toString()}`
      );
      setStreams(response.data.data.streams);
    } catch (error) {
      console.error("Failed to fetch streams:", error);
      setStreams([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract video ID and create embed URL
  const getEmbedUrl = (youtubeUrl: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = youtubeUrl.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : youtubeUrl;
  };

  // Helper function to extract video ID for thumbnail
  const getThumbnail = (youtubeUrl: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = youtubeUrl.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : "";
  };

  const games = [
    "Valorant",
    "CS2",
    "PUBG Mobile",
    "Dota 2",
    "League of Legends",
    "Free Fire",
    "Mobile Legends",
  ];

  const statusOptions = [
    { value: "all", label: "All Streams" },
    { value: "live", label: "Live Now" },
    { value: "scheduled", label: "Upcoming" },
    { value: "completed", label: "Past Streams" },
  ];

  // Filtering is now done on backend via API query params
  // So we just use the streams directly
  const filteredStreams = streams;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-xs font-arial">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            LIVE
          </span>
        );
      case "scheduled":
        return (
          <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-400 text-xs font-arial">
            UPCOMING
          </span>
        );
      case "completed":
        return (
          <span className="px-3 py-1 bg-gray-500/20 border border-gray-500/50 rounded-full text-gray-400 text-xs font-arial">
            ENDED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415]">
      <Header />

      {/* Hero Section */}
      <div className="px-4 sm:px-8 lg:px-20 py-6 sm:py-8">
        <h1 className="font-plus-jakarta text-2xl sm:text-4xl text-white mb-2">
          {t.watchNow.title}
        </h1>
        <p className="font-plus-jakarta text-sm sm:text-lg text-white/70">
          Watch live esports matches and tournament streams from Nepal and
          around the world
        </p>
      </div>

      {/* Filters Section */}
      <div className="px-4 sm:px-8 lg:px-20 pb-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tournaments, organizers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white font-arial text-base placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="#9CA3AF"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-white/70 text-sm font-arial mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedStatus(option.value)}
                    className={`px-4 py-2 rounded-lg font-arial text-sm transition-all ${
                      selectedStatus === option.value
                        ? "bg-[#e85d5d] text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/15"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Game Filter */}
            <div className="flex-1">
              <label className="block text-white/70 text-sm font-arial mb-2">
                Game
              </label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white font-arial text-sm focus:outline-none focus:border-white/40 [&>option]:bg-gray-900 [&>option]:text-white"
              >
                <option value="all">All Games</option>
                {games.map((game) => (
                  <option key={game} value={game}>
                    {game}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Streams Grid */}
      <div className="px-4 sm:px-8 lg:px-20 pb-12">
        {loading ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-12 text-center">
            <p className="text-white/70 font-arial text-lg">Loading streams...</p>
          </div>
        ) : filteredStreams.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-12 text-center">
            <p className="text-white/70 font-arial text-lg">
              {t.watchNow.noStreams}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredStreams.map((stream) => (
              <div
                key={stream._id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:border-white/40 transition-all"
              >
                {/* Video Player */}
                <div className="relative aspect-video bg-black">
                  {stream.status === "live" ? (
                    <iframe
                      src={getEmbedUrl(stream.youtubeUrl)}
                      title={stream.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div
                      className="w-full h-full bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${getThumbnail(stream.youtubeUrl)})` }}
                    >
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        {stream.status === "scheduled" ? (
                          <div className="text-center">
                            <svg
                              className="w-16 h-16 text-white/70 mx-auto mb-2"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeWidth="2"
                                d="M12 6v6l4 2"
                              />
                            </svg>
                            <p className="text-white font-arial text-sm">
                              Starting Soon
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <svg
                              className="w-16 h-16 text-white/70 mx-auto mb-2"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="currentColor"
                                d="M8 5v14l11-7z"
                              />
                            </svg>
                            <p className="text-white font-arial text-sm">
                              Watch Recording
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stream Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-arial text-lg text-white flex-1 pr-4">
                      {stream.title}
                    </h3>
                    {getStatusBadge(stream.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-white/50"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <p className="font-arial text-sm text-white/70">
                        {stream.tournamentName || stream.tournament?.name || "Unknown Tournament"}
                      </p>
                      {stream.isNepal && (
                        <span className="text-xs">🇳🇵</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-white/50"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <p className="font-arial text-sm text-white/70">
                        {stream.organizerName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-white/50"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="font-arial text-sm text-white/70">
                        {stream.game}
                      </p>
                    </div>

                  </div>

                  <button className="w-full px-4 py-2.5 bg-[#e85d5d] hover:bg-[#d64d4d] rounded-lg text-white font-arial text-sm transition-all">
                    {stream.status === "live"
                      ? "Watch Now"
                      : stream.status === "scheduled"
                      ? "Set Reminder"
                      : "Watch Recording"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

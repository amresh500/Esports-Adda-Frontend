"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/ToastContainer";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/useToast";
import { useConfirm } from "@/hooks/useConfirm";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const GAMES = [
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

export default function PlayerProfilePage() {
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const { confirm, confirmState, handleConfirm, handleCancel } = useConfirm();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "games" | "achievements">("profile");
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [editingGame, setEditingGame] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [adminOrg, setAdminOrg] = useState<any>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    realName: "",
    bio: "",
    country: "",
    city: "",
    isNepal: false,
    dateOfBirth: "",
    socialLinks: {
      twitter: "",
      twitch: "",
      youtube: "",
      discord: "",
      instagram: "",
    },
  });

  // Game form state
  const [gameForm, setGameForm] = useState({
    game: "Valorant",
    rank: "",
    role: "",
    inGameName: "",
    isPrimary: false,
  });

  // Achievement form state
  const [achievementForm, setAchievementForm] = useState({
    title: "",
    description: "",
    date: "",
  });

  useEffect(() => {
    fetchProfile();
    checkAdminStatus();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/api/profile/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profileData = response.data.data.profile;
      setProfile(profileData);

      // Populate form with existing data
      setProfileForm({
        realName: profileData.realName || "",
        bio: profileData.bio || "",
        country: profileData.country || "",
        city: profileData.city || "",
        isNepal: profileData.isNepal || false,
        dateOfBirth: profileData.dateOfBirth
          ? new Date(profileData.dateOfBirth).toISOString().split("T")[0]
          : "",
        socialLinks: profileData.socialLinks || {
          twitter: "",
          twitch: "",
          youtube: "",
          discord: "",
          instagram: "",
        },
      });

      setLoading(false);
    } catch (error: any) {
      console.error("Fetch profile error:", error);
      showError(error.response?.data?.message || "Failed to fetch profile");
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get(`${API_URL}/api/org-auth/admin-org`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setAdminOrg(response.data.data.organization);
        // Also update localStorage so Header picks it up
        localStorage.setItem("isOrgAdmin", "true");
        localStorage.setItem("adminOrgId", response.data.data.organization._id);
        localStorage.setItem("adminOrgName", response.data.data.organization.organizationName);
      }
    } catch {
      // Not an admin staff — clear any stale flags
      setAdminOrg(null);
      localStorage.removeItem("isOrgAdmin");
      localStorage.removeItem("adminOrgId");
      localStorage.removeItem("adminOrgName");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/profile`, profileForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showSuccess("Profile updated successfully!");
      setIsEditingProfile(false);
      fetchProfile();
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gameForm.rank) {
      showError("Please enter your rank");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/profile/games`, gameForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showSuccess(editingGame ? "Game updated successfully!" : "Game added successfully!");
      setGameForm({
        game: "Valorant",
        rank: "",
        role: "",
        inGameName: "",
        isPrimary: false,
      });
      setShowAddGameModal(false);
      setEditingGame(null);
      fetchProfile();
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to add/update game");
    }
  };

  const handleEditGame = (game: any) => {
    setGameForm({
      game: game.game,
      rank: game.rank,
      role: game.role || "",
      inGameName: game.inGameName || "",
      isPrimary: game.isPrimary,
    });
    setEditingGame(game.game);
    setShowAddGameModal(true);
  };

  const handleRemoveGame = async (game: string) => {
    const confirmed = await confirm({
      title: 'Remove Game',
      message: `Are you sure you want to remove ${game} from your profile? This action cannot be undone.`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      confirmButtonClass: 'bg-red-500 hover:bg-red-600',
    });

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/profile/games/${game}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showSuccess("Game removed successfully!");
      fetchProfile();
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to remove game");
    }
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!achievementForm.title) {
      showError("Please enter achievement title");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/profile/achievements`, achievementForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showSuccess("Achievement added successfully!");
      setAchievementForm({ title: "", description: "", date: "" });
      fetchProfile();
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to add achievement");
    }
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
      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {profile?.user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                {profile?.user?.username}
              </h1>
              <p className="text-gray-300 mb-4">{profileForm.realName || "Set your real name"}</p>

              {/* Current Team & Organizations */}
              <div className="mb-4 space-y-2">
                {profile?.currentTeam && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Team:</span>
                    <span className="text-white font-semibold">{profile.currentTeam.name}</span>
                    <span className="text-gray-500">[{profile.currentTeam.tag}]</span>
                  </div>
                )}
                {profile?.organizations && profile.organizations.length > 0 && (
                  <div>
                    <span className="text-gray-400">Organizations:</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {profile.organizations.map((org: any, idx: number) => (
                        <div key={idx} className="bg-white/10 px-3 py-1 rounded-full text-sm">
                          <span className="text-white">{org.organization?.name}</span>
                          <span className="text-gray-400 ml-1">• {org.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {profile?.stats?.tournamentsPlayed || 0}
                  </div>
                  <div className="text-sm text-gray-400">Tournaments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {profile?.stats?.wins || 0}
                  </div>
                  <div className="text-sm text-gray-400">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {profile?.stats?.mvps || 0}
                  </div>
                  <div className="text-sm text-gray-400">MVPs</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Org Banner */}
        {adminOrg && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-md rounded-2xl p-5 mb-8 border border-yellow-500/30 flex items-center justify-between">
            <div>
              <p className="text-yellow-400 font-semibold text-sm mb-1">Organization Admin</p>
              <p className="text-white text-lg font-bold">
                {adminOrg.organizationName}
                {adminOrg.tag && <span className="text-gray-400 text-sm font-normal ml-2">[{adminOrg.tag}]</span>}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">You have management access to this organization</p>
            </div>
            <button
              onClick={() => router.push("/admin-dashboard")}
              className="px-6 py-3 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-all font-semibold whitespace-nowrap"
            >
              Open Admin Dashboard
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "profile"
                ? "bg-white text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab("games")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "games"
                ? "bg-white text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Games & Ranks
          </button>
          <button
            onClick={() => setActiveTab("achievements")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "achievements"
                ? "bg-white text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Achievements
          </button>
        </div>

        {/* Profile Tab - View Mode */}
        {activeTab === "profile" && !isEditingProfile && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Player Profile</h2>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-6 py-2 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all font-semibold"
              >
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-gray-400 text-sm mb-1">Username</p>
                <p className="text-white text-lg font-semibold">{profile?.user?.username || "Not set"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Real Name</p>
                <p className="text-white text-lg">{profile?.realName || "Not set"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Date of Birth</p>
                <p className="text-white text-lg">
                  {profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Country</p>
                <p className="text-white text-lg">{profile?.country || "Not set"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">City</p>
                <p className="text-white text-lg">{profile?.city || "Not set"}</p>
              </div>
            </div>

            {profile?.bio && (
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Bio</p>
                <p className="text-white">{profile.bio}</p>
              </div>
            )}

            {profile?.isNepal && (
              <div className="mb-6">
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">🇳🇵 From Nepal</span>
              </div>
            )}

            {profile?.socialLinks && Object.values(profile.socialLinks).some((link: any) => link) && (
              <div>
                <p className="text-gray-400 text-sm mb-3">Social Links</p>
                <div className="flex flex-wrap gap-3">
                  {profile.socialLinks.twitter && (
                    <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg hover:bg-blue-500/30">Twitter</a>
                  )}
                  {profile.socialLinks.twitch && (
                    <a href={profile.socialLinks.twitch} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-purple-500/20 border border-purple-500 text-purple-300 rounded-lg hover:bg-purple-500/30">Twitch</a>
                  )}
                  {profile.socialLinks.youtube && (
                    <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-300 rounded-lg hover:bg-red-500/30">YouTube</a>
                  )}
                  {profile.socialLinks.discord && (
                    <a href={profile.socialLinks.discord} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-indigo-500/20 border border-indigo-500 text-indigo-300 rounded-lg hover:bg-indigo-500/30">Discord</a>
                  )}
                  {profile.socialLinks.instagram && (
                    <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-pink-500/20 border border-pink-500 text-pink-300 rounded-lg hover:bg-pink-500/30">Instagram</a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab - Edit Mode */}
        {activeTab === "profile" && isEditingProfile && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Real Name</label>
                  <input
                    type="text"
                    value={profileForm.realName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, realName: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="Your real name"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, dateOfBirth: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Country</label>
                  <input
                    type="text"
                    value={profileForm.country}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, country: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="Nepal"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">City</label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, city: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="Kathmandu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, bio: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isNepal"
                  checked={profileForm.isNepal}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, isNepal: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <label htmlFor="isNepal" className="text-white">
                  I am from Nepal 🇳🇵
                </label>
              </div>

              <h3 className="text-xl font-bold text-white mt-8 mb-4">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Twitter</label>
                  <input
                    type="text"
                    value={profileForm.socialLinks.twitter}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        socialLinks: { ...profileForm.socialLinks, twitter: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="https://twitter.com/username"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Twitch</label>
                  <input
                    type="text"
                    value={profileForm.socialLinks.twitch}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        socialLinks: { ...profileForm.socialLinks, twitch: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="https://twitch.tv/username"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">YouTube</label>
                  <input
                    type="text"
                    value={profileForm.socialLinks.youtube}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        socialLinks: { ...profileForm.socialLinks, youtube: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="https://youtube.com/@username"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Discord</label>
                  <input
                    type="text"
                    value={profileForm.socialLinks.discord}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        socialLinks: { ...profileForm.socialLinks, discord: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="username#1234"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Instagram</label>
                  <input
                    type="text"
                    value={profileForm.socialLinks.instagram}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        socialLinks: { ...profileForm.socialLinks, instagram: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    fetchProfile(); // Reset form to original values
                  }}
                  className="flex-1 bg-white/10 border border-white/30 text-white py-4 rounded-lg font-bold text-lg hover:bg-white/20 hover:border-white/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500/20 border border-blue-500 text-blue-300 py-4 rounded-lg font-bold text-lg hover:bg-blue-500/30 transition-all"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === "games" && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Your Games & Ranks</h2>
              <button
                onClick={() => {
                  setGameForm({
                    game: "Valorant",
                    rank: "",
                    role: "",
                    inGameName: "",
                    isPrimary: false,
                  });
                  setEditingGame(null);
                  setShowAddGameModal(true);
                }}
                className="bg-white/10 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 hover:border-white/50 transition-all"
              >
                + Add Game
              </button>
            </div>

            {profile?.games?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.games.map((game: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white/5 border border-white/20 rounded-lg p-6 relative hover:bg-white/10 transition-all"
                  >
                    {game.isPrimary && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                          PRIMARY
                        </span>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-white mb-3">{game.game}</h3>
                    <div className="space-y-2 text-gray-300">
                      <p>
                        <span className="font-semibold">Rank:</span> {game.rank}
                      </p>
                      {game.role && (
                        <p>
                          <span className="font-semibold">Role:</span> {game.role}
                        </p>
                      )}
                      {game.inGameName && (
                        <p>
                          <span className="font-semibold">IGN:</span> {game.inGameName}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleEditGame(game)}
                        className="flex-1 bg-blue-500/20 border border-blue-500 text-blue-300 py-2 rounded-lg hover:bg-blue-500/30 transition-all text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveGame(game.game)}
                        className="flex-1 bg-red-500/20 border border-red-500 text-red-300 py-2 rounded-lg hover:bg-red-500/30 transition-all text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">
                  No games added yet.
                </p>
                <button
                  onClick={() => setShowAddGameModal(true)}
                  className="bg-white/10 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 hover:border-white/50 transition-all"
                >
                  Add Your First Game
                </button>
              </div>
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="space-y-8">
            {/* Add Achievement Form */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Add Achievement</h2>
              <form onSubmit={handleAddAchievement} className="space-y-6">
                <div>
                  <label className="block text-white mb-2">Title *</label>
                  <input
                    type="text"
                    value={achievementForm.title}
                    onChange={(e) =>
                      setAchievementForm({ ...achievementForm, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="e.g., 1st Place - Valorant Champions Nepal"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Description</label>
                  <textarea
                    value={achievementForm.description}
                    onChange={(e) =>
                      setAchievementForm({
                        ...achievementForm,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="Additional details..."
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Date</label>
                  <input
                    type="date"
                    value={achievementForm.date}
                    onChange={(e) =>
                      setAchievementForm({ ...achievementForm, date: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-white/10 border border-white/30 text-white py-4 rounded-lg font-bold text-lg hover:bg-white/20 hover:border-white/50 transition-all"
                >
                  Add Achievement
                </button>
              </form>
            </div>

            {/* Achievements List */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Your Achievements</h2>
              {profile?.achievements?.length > 0 ? (
                <div className="space-y-4">
                  {profile.achievements.map((achievement: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white/5 border border-white/20 rounded-lg p-6"
                    >
                      <h3 className="text-xl font-bold text-white mb-2">
                        {achievement.title}
                      </h3>
                      {achievement.description && (
                        <p className="text-gray-300 mb-2">{achievement.description}</p>
                      )}
                      {achievement.date && (
                        <p className="text-sm text-gray-400">
                          {new Date(achievement.date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No achievements added yet. Add your first achievement above!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Game Modal */}
      {showAddGameModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowAddGameModal(false);
            setEditingGame(null);
          }}
        >
          <div
            className="bg-gradient-to-b from-[#1a1a1a] to-[#2a1a1a] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingGame ? "Edit Game" : "Add Game"}
              </h2>
              <button
                onClick={() => {
                  setShowAddGameModal(false);
                  setEditingGame(null);
                }}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddGame} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Game</label>
                  <select
                    value={gameForm.game}
                    onChange={(e) =>
                      setGameForm({ ...gameForm, game: e.target.value })
                    }
                    disabled={!!editingGame}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 [&>option]:bg-gray-900 [&>option]:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {GAMES.map((game) => (
                      <option key={game} value={game}>
                        {game}
                      </option>
                    ))}
                  </select>
                  {editingGame && (
                    <p className="text-gray-400 text-xs mt-1">Game cannot be changed when editing</p>
                  )}
                </div>

                <div>
                  <label className="block text-white mb-2">Rank *</label>
                  <input
                    type="text"
                    value={gameForm.rank}
                    onChange={(e) =>
                      setGameForm({ ...gameForm, rank: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="e.g., Immortal 3, Global Elite"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Role</label>
                  <input
                    type="text"
                    value={gameForm.role}
                    onChange={(e) =>
                      setGameForm({ ...gameForm, role: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="e.g., Duelist, AWPer, IGL"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">In-Game Name</label>
                  <input
                    type="text"
                    value={gameForm.inGameName}
                    onChange={(e) =>
                      setGameForm({ ...gameForm, inGameName: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="Your IGN"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={gameForm.isPrimary}
                  onChange={(e) =>
                    setGameForm({ ...gameForm, isPrimary: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <label htmlFor="isPrimary" className="text-white">
                  This is my primary game
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddGameModal(false);
                    setEditingGame(null);
                  }}
                  className="flex-1 bg-white/10 border border-white/20 text-white py-3 rounded-lg font-semibold hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-white/10 border border-white/30 text-white py-3 rounded-lg font-semibold hover:bg-white/20 hover:border-white/50 transition-all"
                >
                  {editingGame ? "Update Game" : "Add Game"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmState && (
        <ConfirmDialog
          title={confirmState.options.title}
          message={confirmState.options.message}
          confirmText={confirmState.options.confirmText}
          cancelText={confirmState.options.cancelText}
          confirmButtonClass={confirmState.options.confirmButtonClass}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Footer />
    </div>
  );
}

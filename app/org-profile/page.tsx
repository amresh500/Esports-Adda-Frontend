"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConfirmDialog from "@/components/ConfirmDialog";
import AddStaffModal from "@/components/AddStaffModal";

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

export default function OrganizationProfile() {
  const router = useRouter();
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "teams" | "staff" | "achievements" | "tournaments">("profile");
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showCreateTournamentForm, setShowCreateTournamentForm] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    organizationName: "",
    tag: "",
    description: "",
    country: "",
    isNepal: false,
    foundedDate: "",
    contactEmail: "",
    contactPhone: "",
    socialLinks: {
      twitter: "",
      facebook: "",
      instagram: "",
      website: "",
      discord: "",
      youtube: "",
    },
  });


  // Staff modal state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [addingStaff, setAddingStaff] = useState(false);

  // Remove staff confirmation modal
  const [showRemoveStaffModal, setShowRemoveStaffModal] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState<string | null>(null);

  // Delete tournament confirmation
  const [showDeleteTournamentModal, setShowDeleteTournamentModal] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<any>(null);

  // Delete team confirmation
  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<any>(null);

  // Achievement form state
  const [achievementForm, setAchievementForm] = useState({
    title: "",
    description: "",
    date: "",
    game: "",
  });

  // Tournament form state
  const [tournamentForm, setTournamentForm] = useState({
    name: "",
    description: "",
    game: "Valorant",
    customGame: "",
    matchmakingType: "single_elimination",
    totalSlots: 8,
    teamSize: 5,
    registrationStartDate: "",
    registrationEndDate: "",
    tournamentStartDate: "",
    tournamentEndDate: "",
    prizePool: {
      amount: 0,
      currency: "NPR",
    },
    requirements: {
      isNepalOnly: false,
      minRank: "",
    },
    streamUrl: "",
    discordUrl: "",
  });

  useEffect(() => {
    // Check if user is logged in and is an organization
    const accountType = localStorage.getItem("accountType");
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/org-login");
      return;
    }

    if (accountType !== "organization") {
      router.push("/profile");
      return;
    }

    fetchOrganization();
    fetchTournaments();
  }, []);

  const fetchOrganization = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/org-auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orgData = response.data.data.organization;
      setOrganization(orgData);

      // Populate form with existing data
      setProfileForm({
        organizationName: orgData.organizationName || "",
        tag: orgData.tag || "",
        description: orgData.description || "",
        country: orgData.country || "",
        isNepal: orgData.isNepal || false,
        foundedDate: orgData.foundedDate
          ? new Date(orgData.foundedDate).toISOString().split("T")[0]
          : "",
        contactEmail: orgData.contactEmail || "",
        contactPhone: orgData.contactPhone || "",
        socialLinks: orgData.socialLinks || {
          twitter: "",
          facebook: "",
          instagram: "",
          website: "",
          discord: "",
          youtube: "",
        },
      });

      setLoading(false);
    } catch (error: any) {
      console.error("Fetch organization error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("accountType");
        router.push("/org-login");
      } else {
        setError(error.response?.data?.message || "Failed to fetch organization profile");
      }
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/api/org-auth/profile`, profileForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Profile updated successfully!");
      setIsEditingProfile(false);
      fetchOrganization();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update profile");
      setTimeout(() => setError(""), 3000);
    }
  };

  const fetchTournaments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/tournaments/my/tournaments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTournaments(response.data.data.tournaments || []);
    } catch (error: any) {
      console.error("Fetch tournaments error:", error);
    }
  };


  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/tournaments`, tournamentForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Tournament created successfully!");
      setShowCreateTournamentForm(false);
      setTournamentForm({
        name: "",
        description: "",
        game: "Valorant",
        customGame: "",
        matchmakingType: "single_elimination",
        totalSlots: 8,
        teamSize: 5,
        registrationStartDate: "",
        registrationEndDate: "",
        tournamentStartDate: "",
        tournamentEndDate: "",
        prizePool: {
          amount: 0,
          currency: "NPR",
        },
        requirements: {
          isNepalOnly: false,
          minRank: "",
        },
        streamUrl: "",
        discordUrl: "",
      });
      fetchTournaments();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create tournament");
    }
  };

  const handleAddStaff = async ({ username, role, department }: { username: string; role: string; department: string }) => {
    setAddingStaff(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/org-auth/my/staff`,
        { username, role, department },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`Staff member ${username} added successfully!`);
      setShowAddStaffModal(false);
      fetchOrganization();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to add staff member");
      setTimeout(() => setError(""), 3000);
    } finally {
      setAddingStaff(false);
    }
  };

  const openRemoveStaffModal = (userId: string) => {
    setStaffToRemove(userId);
    setShowRemoveStaffModal(true);
  };

  const handleRemoveStaff = async () => {
    if (!staffToRemove) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/org-auth/my/staff/${staffToRemove}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Staff member removed successfully!");
      setShowRemoveStaffModal(false);
      setStaffToRemove(null);
      fetchOrganization();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to remove staff member");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDeleteTournament = async () => {
    if (!tournamentToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/tournaments/${tournamentToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Tournament deleted successfully!");
      setShowDeleteTournamentModal(false);
      setTournamentToDelete(null);
      fetchTournaments();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete tournament");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/teams/${teamToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(`Team "${teamToDelete.name}" deleted successfully!`);
      setShowDeleteTeamModal(false);
      setTeamToDelete(null);
      fetchOrganization();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete team");
      setTimeout(() => setError(""), 3000);
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
              {organization?.organizationName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                {organization?.organizationName}
              </h1>
              <p className="text-gray-300 mb-4">
                [{organization?.tag}] {organization?.country && `• ${organization.country}`}
              </p>

              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {organization?.stats?.totalTeams || 0}
                  </div>
                  <div className="text-sm text-gray-400">Teams</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {organization?.stats?.totalPlayers || 0}
                  </div>
                  <div className="text-sm text-gray-400">Players</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {organization?.stats?.championships || 0}
                  </div>
                  <div className="text-sm text-gray-400">Championships</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 flex-wrap">
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
            onClick={() => setActiveTab("teams")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "teams"
                ? "bg-white text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Teams
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "staff"
                ? "bg-white text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Staff
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
          <button
            onClick={() => setActiveTab("tournaments")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "tournaments"
                ? "bg-white text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            Tournaments
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 px-6 py-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && !isEditingProfile && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Organization Profile</h2>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-6 py-2 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all font-semibold"
              >
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-gray-400 text-sm mb-1">Organization Name</p>
                <p className="text-white text-lg font-semibold">{organization?.organizationName || "Not set"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Tag</p>
                <p className="text-white text-lg font-semibold">[{organization?.tag || "N/A"}]</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Country</p>
                <p className="text-white text-lg">{organization?.country || "Not set"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Founded</p>
                <p className="text-white text-lg">
                  {organization?.foundedDate ? new Date(organization.foundedDate).toLocaleDateString() : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Contact Email</p>
                <p className="text-white text-lg">{organization?.contactEmail || "Not set"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Contact Phone</p>
                <p className="text-white text-lg">{organization?.contactPhone || "Not set"}</p>
              </div>
            </div>

            {organization?.description && (
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Description</p>
                <p className="text-white">{organization.description}</p>
              </div>
            )}

            {organization?.isNepal && (
              <div className="mb-6">
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">🇳🇵 Based in Nepal</span>
              </div>
            )}

            {organization?.socialLinks && Object.values(organization.socialLinks).some((link: any) => link) && (
              <div>
                <p className="text-gray-400 text-sm mb-3">Social Links</p>
                <div className="flex flex-wrap gap-3">
                  {organization.socialLinks.twitter && (
                    <a href={organization.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg hover:bg-blue-500/30">Twitter</a>
                  )}
                  {organization.socialLinks.facebook && (
                    <a href={organization.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600/20 border border-blue-600 text-blue-400 rounded-lg hover:bg-blue-600/30">Facebook</a>
                  )}
                  {organization.socialLinks.instagram && (
                    <a href={organization.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-pink-500/20 border border-pink-500 text-pink-300 rounded-lg hover:bg-pink-500/30">Instagram</a>
                  )}
                  {organization.socialLinks.discord && (
                    <a href={organization.socialLinks.discord} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-purple-500/20 border border-purple-500 text-purple-300 rounded-lg hover:bg-purple-500/30">Discord</a>
                  )}
                  {organization.socialLinks.youtube && (
                    <a href={organization.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-300 rounded-lg hover:bg-red-500/30">YouTube</a>
                  )}
                  {organization.socialLinks.website && (
                    <a href={organization.socialLinks.website} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30">Website</a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile Edit Mode */}
        {activeTab === "profile" && isEditingProfile && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Organization Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Organization Name</label>
                  <input
                    type="text"
                    value={profileForm.organizationName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, organizationName: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="Organization name"
                    disabled
                  />
                  <p className="text-gray-400 text-sm mt-1">Name cannot be changed</p>
                </div>

                <div>
                  <label className="block text-white mb-2">Tag</label>
                  <input
                    type="text"
                    value={profileForm.tag}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 uppercase"
                    disabled
                  />
                  <p className="text-gray-400 text-sm mt-1">Tag cannot be changed</p>
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
                  <label className="block text-white mb-2">Founded Date</label>
                  <input
                    type="date"
                    value={profileForm.foundedDate}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, foundedDate: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={profileForm.contactEmail}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, contactEmail: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="contact@organization.com"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    value={profileForm.contactPhone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, contactPhone: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="+977-9800000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={profileForm.description}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  placeholder="Tell us about your organization..."
                  maxLength={2000}
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
                  Based in Nepal
                </label>
              </div>

              <h3 className="text-xl font-bold text-white mt-8 mb-4">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["twitter", "facebook", "instagram", "website", "discord", "youtube"].map((platform) => (
                  <div key={platform}>
                    <label className="block text-white mb-2 capitalize">{platform}</label>
                    <input
                      type="text"
                      value={profileForm.socialLinks[platform as keyof typeof profileForm.socialLinks]}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          socialLinks: { ...profileForm.socialLinks, [platform]: e.target.value },
                        })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder={`https://${platform}.com/yourorg`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    fetchOrganization(); // Reset form to original values
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

        {/* Teams Tab */}
        {activeTab === "teams" && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Your Teams</h2>
              <button
                onClick={() => router.push('/organization')}
                className="bg-white/10 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 hover:border-white/50 transition-all"
              >
                Manage Teams
              </button>
            </div>
            {organization?.teams?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organization.teams.map((team: any) => (
                  <div
                    key={team._id}
                    className="bg-white/5 border border-white/20 rounded-lg p-6 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{team.name}</h3>
                        <p className="text-gray-400 text-sm">[{team.tag}]</p>
                      </div>
                      {team.game && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                          {team.game}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      {team.games && team.games.length > 0 && team.games[0].roster && (
                        <p className="text-gray-400 text-sm">
                          Players: {team.games[0].roster.length}
                        </p>
                      )}
                      {team.country && (
                        <p className="text-gray-400 text-sm">
                          Country: {team.country}
                        </p>
                      )}
                      {team.createdAt && (
                        <p className="text-gray-400 text-sm">
                          Created: {new Date(team.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/team/${team._id}?from=org-profile`)}
                        className="flex-1 px-4 py-2 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-semibold"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => router.push(`/team-management/${team._id}?from=org-profile`)}
                        className="flex-1 px-4 py-2 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all text-sm font-semibold"
                      >
                        Manage Team
                      </button>
                      <button
                        onClick={() => {
                          setTeamToDelete(team);
                          setShowDeleteTeamModal(true);
                        }}
                        className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-300 rounded-lg hover:bg-red-500/30 transition-all text-sm font-semibold"
                        title="Delete team"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">
                  No teams created yet.
                </p>
                <button
                  onClick={() => router.push('/organization')}
                  className="bg-white/10 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 hover:border-white/50 transition-all"
                >
                  Create Your First Team
                </button>
              </div>
            )}
          </div>
        )}

        {/* Staff Tab */}
        {activeTab === "staff" && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Staff Management</h2>
              <button
                onClick={() => setShowAddStaffModal(true)}
                className="px-6 py-3 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all font-semibold"
              >
                + Add Staff Member
              </button>
            </div>

            {organization?.staff && organization.staff.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organization.staff.map((member: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white/5 p-6 rounded-lg border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">{member.username}</h3>
                        <p className="text-blue-400 text-sm">{member.role}</p>
                        {member.role === "Admin" && (
                          <p className="text-yellow-400 text-xs mt-0.5">Has management access</p>
                        )}
                        {member.department && (
                          <p className="text-gray-400 text-sm">{member.department}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          member.isActive
                            ? "bg-green-500/20 text-green-300"
                            : "bg-red-500/20 text-red-300"
                        }`}
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">
                      Joined: {new Date(member.joinedDate).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => openRemoveStaffModal(member.user)}
                      className="w-full px-4 py-2 bg-red-500/20 border border-red-500 text-red-300 rounded-lg hover:bg-red-500/30 transition-all text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-2">No staff members added yet</p>
                <p className="text-gray-500 text-sm">
                  Click "Add Staff Member" to add team members to your organization
                </p>
              </div>
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Achievements</h2>
            <p className="text-gray-400 text-center py-8">
              Achievement management features coming soon!
            </p>
          </div>
        )}

        {/* Tournaments Tab */}
        {activeTab === "tournaments" && (
          <div className="space-y-8">
            {/* Tournaments List - Show First */}
            {!showCreateTournamentForm && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Your Tournaments</h2>
                  <button
                    onClick={() => setShowCreateTournamentForm(true)}
                    className="px-6 py-3 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all font-semibold"
                  >
                    + Create Tournament
                  </button>
                </div>
                {tournaments.length > 0 ? (
                  <div className="space-y-4">
                    {tournaments.map((tournament: any) => (
                      <div
                        key={tournament._id}
                        className="bg-white/5 border border-white/20 rounded-lg p-6 hover:bg-white/10 transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                                {tournament.game}
                              </span>
                              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                                {tournament.matchmakingType.replace("_", " ").toUpperCase()}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                tournament.status === "draft" ? "bg-gray-500/20 text-gray-300" :
                                tournament.status === "registration_open" ? "bg-green-500/20 text-green-300" :
                                tournament.status === "ongoing" ? "bg-yellow-500/20 text-yellow-300" :
                                tournament.status === "completed" ? "bg-blue-500/20 text-blue-300" :
                                "bg-red-500/20 text-red-300"
                              }`}>
                                {tournament.status.replace("_", " ").toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm">
                              {tournament.participants?.length || 0} / {tournament.totalSlots} teams registered
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-semibold">
                              Prize: NPR {tournament.prizePool?.amount?.toLocaleString() || 0}
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                              Starts: {new Date(tournament.tournamentStartDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {tournament.description && (
                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{tournament.description}</p>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => router.push(`/tournament/${tournament._id}/manage?from=org-profile`)}
                            className="px-4 py-2 bg-purple-500/20 border border-purple-500 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all"
                          >
                            Manage
                          </button>
                          <button
                            onClick={() => router.push(`/tournament/${tournament._id}?from=org-profile`)}
                            className="px-4 py-2 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => router.push(`/tournament/${tournament._id}/bracket?from=org-profile`)}
                            className="px-4 py-2 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all"
                          >
                            View Bracket
                          </button>
                          {tournament.status !== "ongoing" && (
                            <button
                              onClick={() => {
                                setTournamentToDelete(tournament);
                                setShowDeleteTournamentModal(true);
                              }}
                              className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <p className="text-gray-400 mb-4">No tournaments created yet</p>
                    <p className="text-gray-500 text-sm">Click "Create Tournament" to organize your first tournament</p>
                  </div>
                )}
              </div>
            )}

            {/* Create Tournament Form - Show When Button Clicked */}
            {showCreateTournamentForm && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Create New Tournament</h2>
                  <button
                    onClick={() => setShowCreateTournamentForm(false)}
                    className="px-4 py-2 bg-white/10 border border-white/30 text-white rounded-lg hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                </div>
                <form onSubmit={handleCreateTournament} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white mb-2">Tournament Name *</label>
                      <input
                        type="text"
                        value={tournamentForm.name}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, name: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                        placeholder="Enter tournament name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Game *</label>
                      <select
                        value={tournamentForm.game}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, game: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 [&>option]:bg-gray-900 [&>option]:text-white"
                        required
                      >
                        {GAMES.map((game) => (
                          <option key={game} value={game}>
                            {game}
                          </option>
                        ))}
                      </select>
                    </div>

                    {tournamentForm.game === "Other" && (
                      <div>
                        <label className="block text-white mb-2">Specify Game *</label>
                        <input
                          type="text"
                          value={tournamentForm.customGame}
                          onChange={(e) =>
                            setTournamentForm({ ...tournamentForm, customGame: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          placeholder="Enter game name"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-white mb-2">Description</label>
                    <textarea
                      value={tournamentForm.description}
                      onChange={(e) =>
                        setTournamentForm({ ...tournamentForm, description: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      placeholder="Describe your tournament..."
                      maxLength={2000}
                    />
                  </div>
                </div>

                {/* Tournament Format */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Tournament Format</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white mb-2">Matchmaking Type *</label>
                      <select
                        value={tournamentForm.matchmakingType}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, matchmakingType: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 [&>option]:bg-gray-900 [&>option]:text-white"
                        required
                      >
                        <option value="single_elimination">Single Elimination (Fast, No Second Chances)</option>
                        <option value="double_elimination">Double Elimination (Major Tournaments, Winners & Losers Bracket)</option>
                        <option value="round_robin">Round Robin (Everyone plays everyone, League format)</option>
                        <option value="swiss">Swiss System (Fair matchmaking, Similar records face off)</option>
                        <option value="battle_royale">Battle Royale Scoring (Points for placement & kills)</option>
                      </select>
                      <p className="text-gray-400 text-sm mt-1">
                        {tournamentForm.matchmakingType === "single_elimination" && "Quick format, losers are eliminated immediately"}
                        {tournamentForm.matchmakingType === "double_elimination" && "Industry standard for major tournaments"}
                        {tournamentForm.matchmakingType === "round_robin" && "Best for small groups (4-8 teams)"}
                        {tournamentForm.matchmakingType === "swiss" && "Great for large player pools"}
                        {tournamentForm.matchmakingType === "battle_royale" && "For PUBG Mobile, Free Fire, Apex Legends"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-white mb-2">Total Slots *</label>
                      <select
                        value={tournamentForm.totalSlots}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, totalSlots: parseInt(e.target.value) })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 [&>option]:bg-gray-900 [&>option]:text-white"
                        required
                      >
                        {(tournamentForm.matchmakingType === "single_elimination" || tournamentForm.matchmakingType === "double_elimination") ? (
                          <>
                            <option value={2}>2 Teams</option>
                            <option value={4}>4 Teams</option>
                            <option value={8}>8 Teams</option>
                            <option value={16}>16 Teams</option>
                            <option value={32}>32 Teams</option>
                            <option value={64}>64 Teams</option>
                            <option value={128}>128 Teams</option>
                          </>
                        ) : (
                          <>
                            <option value={4}>4 Teams</option>
                            <option value={6}>6 Teams</option>
                            <option value={8}>8 Teams</option>
                            <option value={10}>10 Teams</option>
                            <option value={12}>12 Teams</option>
                            <option value={16}>16 Teams</option>
                            <option value={20}>20 Teams</option>
                            <option value={24}>24 Teams</option>
                            <option value={32}>32 Teams</option>
                            <option value={50}>50 Teams</option>
                            <option value={100}>100 Teams</option>
                          </>
                        )}
                      </select>
                      <p className="text-gray-400 text-sm mt-1">
                        {(tournamentForm.matchmakingType === "single_elimination" || tournamentForm.matchmakingType === "double_elimination")
                          ? "Must be power of 2 for bracket formats"
                          : "Any number of teams allowed"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-white mb-2">Team Size</label>
                      <input
                        type="number"
                        value={tournamentForm.teamSize || ''}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, teamSize: parseInt(e.target.value) || 0 })
                        }
                        min={1}
                        max={100}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                        placeholder="5"
                      />
                      <p className="text-gray-400 text-sm mt-1">Players per team (e.g., 5 for Valorant/CS2, 1 for solo)</p>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white mb-2">Registration Start Date *</label>
                      <input
                        type="datetime-local"
                        value={tournamentForm.registrationStartDate}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, registrationStartDate: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Registration End Date *</label>
                      <input
                        type="datetime-local"
                        value={tournamentForm.registrationEndDate}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, registrationEndDate: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Tournament Start Date *</label>
                      <input
                        type="datetime-local"
                        value={tournamentForm.tournamentStartDate}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, tournamentStartDate: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Tournament End Date (Optional)</label>
                      <input
                        type="datetime-local"
                        value={tournamentForm.tournamentEndDate}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, tournamentEndDate: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                      />
                    </div>
                  </div>
                </div>

                {/* Prize & Additional Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Prize & Additional Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white mb-2">Prize Pool Amount (NPR)</label>
                      <input
                        type="number"
                        value={tournamentForm.prizePool.amount || ''}
                        onChange={(e) =>
                          setTournamentForm({
                            ...tournamentForm,
                            prizePool: { ...tournamentForm.prizePool, amount: parseInt(e.target.value) || 0 }
                          })
                        }
                        min={0}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                        placeholder="50000"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Stream URL (Optional)</label>
                      <input
                        type="url"
                        value={tournamentForm.streamUrl}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, streamUrl: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                        placeholder="https://youtube.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Discord URL (Optional)</label>
                      <input
                        type="url"
                        value={tournamentForm.discordUrl}
                        onChange={(e) =>
                          setTournamentForm({ ...tournamentForm, discordUrl: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                        placeholder="https://discord.gg/..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isNepalOnly"
                      checked={tournamentForm.requirements.isNepalOnly}
                      onChange={(e) =>
                        setTournamentForm({
                          ...tournamentForm,
                          requirements: { ...tournamentForm.requirements, isNepalOnly: e.target.checked }
                        })
                      }
                      className="w-5 h-5"
                    />
                    <label htmlFor="isNepalOnly" className="text-white">
                      Nepal Only Tournament
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-white/10 border border-white/30 text-white py-4 rounded-lg font-bold text-lg hover:bg-white/20 hover:border-white/50 transition-all"
                >
                  Create Tournament
                </button>
              </form>
            </div>
            )}
          </div>
        )}
      </div>

      {/* Remove Staff Confirmation Modal */}
      {showRemoveStaffModal && (
        <ConfirmDialog
          title="Remove Staff Member?"
          message="Are you sure you want to remove this staff member from your organization? They will lose access to organization management features."
          confirmText="Yes, Remove"
          cancelText="Cancel"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleRemoveStaff}
          onCancel={() => {
            setShowRemoveStaffModal(false);
            setStaffToRemove(null);
          }}
        />
      )}

      {showAddStaffModal && (
        <AddStaffModal
          onSubmit={handleAddStaff}
          onClose={() => setShowAddStaffModal(false)}
          loading={addingStaff}
        />
      )}

      {showDeleteTournamentModal && tournamentToDelete && (
        <ConfirmDialog
          title="Delete Tournament?"
          message={`Are you sure you want to delete "${tournamentToDelete.name}"? This action cannot be undone. All registrations and bracket data will be permanently removed.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleDeleteTournament}
          onCancel={() => {
            setShowDeleteTournamentModal(false);
            setTournamentToDelete(null);
          }}
        />
      )}

      {showDeleteTeamModal && teamToDelete && (
        <ConfirmDialog
          title="Delete Team?"
          message={`Are you sure you want to delete "${teamToDelete.name}" [${teamToDelete.tag}]? This action cannot be undone. All roster data and team history will be permanently removed.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleDeleteTeam}
          onCancel={() => {
            setShowDeleteTeamModal(false);
            setTeamToDelete(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}

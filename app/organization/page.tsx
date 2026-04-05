"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConfirmDialog from "@/components/ConfirmDialog";

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

const STAFF_ROLES = [
  "Owner",
  "Co-Owner",
  "CEO",
  "Manager",
  "Coach",
  "Analyst",
  "Content Creator",
  "Social Media Manager",
  "Admin",
  "Staff",
];

export default function OrganizationDashboardPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateTeamForm, setShowCreateTeamForm] = useState(false);

  // Create new team form
  const [createTeamForm, setCreateTeamForm] = useState({
    name: "",
    tag: "",
    game: "Valorant",
    description: "",
    country: "",
    isNepal: false,
    socialLinks: {
      twitter: "",
      discord: "",
      website: "",
    },
  });

  // Add staff form
  const [staffForm, setStaffForm] = useState({
    username: "",
    role: "Staff",
    department: "",
  });

  // Confirmation modal states
  const [showRemoveStaffModal, setShowRemoveStaffModal] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState<string | null>(null);
  const [showDeleteOrgModal, setShowDeleteOrgModal] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<string | null>(null);

  // Add existing team to org form
  const [teamForm, setTeamForm] = useState({
    teamName: "",
    game: "Valorant",
  });

  useEffect(() => {
    fetchMyOrganizations();
  }, []);

  const fetchMyOrganizations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/organizations/my/organizations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrganizations(response.data.data.organizations);
      setLoading(false);
    } catch (error: any) {
      console.error("Fetch organizations error:", error);
      setError(error.response?.data?.message || "Failed to fetch organizations");
      setLoading(false);
    }
  };

  const fetchOrgDetails = async (orgId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/organizations/${orgId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedOrg(response.data.data.organization);
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Failed to fetch organization details"
      );
    }
  };

  const handleToggleCreateTeamForm = () => {
    if (!showCreateTeamForm && selectedOrg) {
      // Pre-fill with organization name and tag when opening the form
      setCreateTeamForm({
        name: selectedOrg.name || "",
        tag: selectedOrg.tag || "",
        game: "Valorant",
        description: "",
        country: selectedOrg.country || "",
        isNepal: selectedOrg.isNepal || false,
        socialLinks: {
          twitter: "",
          discord: "",
          website: "",
        },
      });
    }
    setShowCreateTeamForm(!showCreateTeamForm);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/teams`, createTeamForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Team created successfully!");
      setCreateTeamForm({
        name: "",
        tag: "",
        game: "Valorant",
        description: "",
        country: "",
        isNepal: false,
        socialLinks: {
          twitter: "",
          discord: "",
          website: "",
        },
      });
      setShowCreateTeamForm(false);
      if (selectedOrg) {
        fetchOrgDetails(selectedOrg._id);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create team");
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/organizations/${selectedOrg._id}/staff`,
        staffForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Staff member added successfully!");
      setStaffForm({ username: "", role: "Staff", department: "" });
      fetchOrgDetails(selectedOrg._id);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to add staff member");
    }
  };

  const openRemoveStaffModal = (userId: string) => {
    setStaffToRemove(userId);
    setShowRemoveStaffModal(true);
  };

  const handleRemoveStaff = async () => {
    if (!selectedOrg || !staffToRemove) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_URL}/api/organizations/${selectedOrg._id}/staff`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { userId: staffToRemove },
        }
      );

      setSuccess("Staff member removed successfully!");
      setShowRemoveStaffModal(false);
      setStaffToRemove(null);
      fetchOrgDetails(selectedOrg._id);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to remove staff member");
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/organizations/${selectedOrg._id}/teams`,
        teamForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Team added successfully!");
      setTeamForm({ teamName: "", game: "Valorant" });
      fetchOrgDetails(selectedOrg._id);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to add team");
    }
  };

  const openDeleteOrgModal = (orgId: string) => {
    setOrgToDelete(orgId);
    setShowDeleteOrgModal(true);
  };

  const handleDeleteOrganization = async () => {
    if (!orgToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/organizations/${orgToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Organization deleted successfully!");
      setShowDeleteOrgModal(false);
      setOrgToDelete(null);
      setSelectedOrg(null);
      fetchMyOrganizations();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete organization");
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
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Team Management
          </h1>
          <button
            onClick={handleToggleCreateTeamForm}
            className="bg-white/10 border border-white/30 text-white px-6 py-3 rounded-lg font-bold hover:bg-white/20 hover:border-white/50 transition-all"
          >
            {showCreateTeamForm ? "Cancel" : "Create New Team"}
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

        {/* Create Team Form */}
        {showCreateTeamForm && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Team</h2>
            <form onSubmit={handleCreateTeam} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Team Name *</label>
                  <input
                    type="text"
                    value={createTeamForm.name}
                    onChange={(e) => setCreateTeamForm({ ...createTeamForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="Team Esports"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Team Tag *</label>
                  <input
                    type="text"
                    value={createTeamForm.tag}
                    onChange={(e) =>
                      setCreateTeamForm({ ...createTeamForm, tag: e.target.value.toUpperCase() })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="TE"
                    maxLength={10}
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Game *</label>
                  <select
                    value={createTeamForm.game}
                    onChange={(e) =>
                      setCreateTeamForm({ ...createTeamForm, game: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    required
                  >
                    {GAMES.map((game) => (
                      <option key={game} value={game} className="bg-white/10">
                        {game}
                      </option>
                    ))}
                  </select>
                  <p className="text-gray-400 text-sm mt-1">
                    Note: An organization can only have one team per game
                  </p>
                </div>

                <div>
                  <label className="block text-white mb-2">Country</label>
                  <input
                    type="text"
                    value={createTeamForm.country}
                    onChange={(e) =>
                      setCreateTeamForm({ ...createTeamForm, country: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="Nepal"
                  />
                </div>

                <div className="flex items-center gap-3 pt-8">
                  <input
                    type="checkbox"
                    id="teamNepal"
                    checked={createTeamForm.isNepal}
                    onChange={(e) =>
                      setCreateTeamForm({ ...createTeamForm, isNepal: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                  <label htmlFor="teamNepal" className="text-white">
                    Nepal Team 🇳🇵
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">Description</label>
                <textarea
                  value={createTeamForm.description}
                  onChange={(e) =>
                    setCreateTeamForm({ ...createTeamForm, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  placeholder="Team description..."
                  maxLength={500}
                />
              </div>

              <h3 className="text-xl font-bold text-white mt-6">Social Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-white mb-2">Website</label>
                  <input
                    type="text"
                    value={createTeamForm.socialLinks.website}
                    onChange={(e) =>
                      setCreateTeamForm({
                        ...createTeamForm,
                        socialLinks: {
                          ...createTeamForm.socialLinks,
                          website: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="https://yoursite.com"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Twitter</label>
                  <input
                    type="text"
                    value={createTeamForm.socialLinks.twitter}
                    onChange={(e) =>
                      setCreateTeamForm({
                        ...createTeamForm,
                        socialLinks: {
                          ...createTeamForm.socialLinks,
                          twitter: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="https://twitter.com/team"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Discord</label>
                  <input
                    type="text"
                    value={createTeamForm.socialLinks.discord}
                    onChange={(e) =>
                      setCreateTeamForm({
                        ...createTeamForm,
                        socialLinks: {
                          ...createTeamForm.socialLinks,
                          discord: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="https://discord.gg/invite"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-white/10 border border-white/30 text-white py-4 rounded-lg font-bold text-lg hover:bg-white/20 hover:border-white/50 transition-all"
              >
                Create Team
              </button>
            </form>
          </div>
        )}

        {/* Team Management Content */}
        <div className="max-w-4xl mx-auto">
          {/* Quick Access to Organization Profile */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">View & Manage Your Teams</h3>
                <p className="text-gray-400">
                  All your created teams are available in your Organization Profile
                </p>
              </div>
              <button
                onClick={() => router.push('/org-profile')}
                className="px-6 py-3 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all font-semibold"
              >
                Go to Organization Profile →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="text-3xl mb-2">👥</div>
                <h4 className="text-white font-semibold mb-1">View Teams</h4>
                <p className="text-gray-400 text-sm">See all your created teams in the Teams tab</p>
              </div>
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="text-3xl mb-2">➕</div>
                <h4 className="text-white font-semibold mb-1">Add Members</h4>
                <p className="text-gray-400 text-sm">Click any team to manage roster and add players</p>
              </div>
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="text-3xl mb-2">✏️</div>
                <h4 className="text-white font-semibold mb-1">Edit Teams</h4>
                <p className="text-gray-400 text-sm">Update team details, roster, and achievements</p>
              </div>
            </div>
          </div>

          {/* Create Team Guide */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-white mb-2">Create a New Team</h3>
              <p className="text-gray-400 mb-4">
                Click the "Create New Team" button at the top to get started with your esports team!
              </p>
              <div className="text-left max-w-2xl mx-auto mt-6 space-y-2">
                <div className="flex items-start gap-3 text-sm text-gray-400">
                  <span className="text-blue-400 font-bold">1.</span>
                  <p>Click "Create New Team" button above to open the team creation form</p>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-400">
                  <span className="text-blue-400 font-bold">2.</span>
                  <p>Fill in team details (name, tag, organization)</p>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-400">
                  <span className="text-blue-400 font-bold">3.</span>
                  <p>Go to Organization Profile to view your created team</p>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-400">
                  <span className="text-blue-400 font-bold">4.</span>
                  <p>Click on the team card to manage roster and add players</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Remove Staff Confirmation Modal */}
      {showRemoveStaffModal && (
        <ConfirmDialog
          title="Remove Staff Member?"
          message="Are you sure you want to remove this staff member? They will lose access to organization features."
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

      {/* Delete Organization Confirmation Modal */}
      {showDeleteOrgModal && (
        <ConfirmDialog
          title="Delete Organization?"
          message="Are you sure you want to delete this organization? This action cannot be undone and all associated data will be lost."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleDeleteOrganization}
          onCancel={() => {
            setShowDeleteOrgModal(false);
            setOrgToDelete(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}

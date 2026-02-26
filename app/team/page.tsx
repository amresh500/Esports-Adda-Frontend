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

const ROLES = ["Player", "Captain", "Coach", "Manager", "Substitute"];

export default function TeamDashboardPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create team form
  const [teamForm, setTeamForm] = useState({
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

  // Add game roster form
  const [gameRosterForm, setGameRosterForm] = useState({
    game: "Valorant",
  });

  // Add player form
  const [playerForm, setPlayerForm] = useState({
    game: "Valorant",
    username: "",
    role: "Player",
    inGameRole: "",
  });

  // Confirmation modal states
  const [showRemovePlayerModal, setShowRemovePlayerModal] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<{ game: string; playerId: string } | null>(null);
  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchMyTeams();
  }, []);

  const fetchMyTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/api/teams/my/teams`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTeams(response.data.data.teams);
      setLoading(false);
    } catch (error: any) {
      console.error("Fetch teams error:", error);
      setError(error.response?.data?.message || "Failed to fetch teams");
      setLoading(false);
    }
  };

  const fetchTeamDetails = async (teamId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedTeam(response.data.data.team);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch team details");
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/api/teams`, teamForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Team created successfully!");
      setTeamForm({
        name: "",
        tag: "",
        game: "Valorant",
        description: "",
        country: "",
        isNepal: false,
        socialLinks: { twitter: "", discord: "", website: "" },
      });
      setShowCreateForm(false);
      fetchMyTeams();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create team");
    }
  };

  const handleAddGameRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/teams/${selectedTeam._id}/games`,
        gameRosterForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Game roster added successfully!");
      fetchTeamDetails(selectedTeam._id);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to add game roster");
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/teams/${selectedTeam._id}/roster`,
        playerForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Player added successfully!");
      setPlayerForm({
        game: "Valorant",
        username: "",
        role: "Player",
        inGameRole: "",
      });
      fetchTeamDetails(selectedTeam._id);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to add player");
    }
  };

  const openRemovePlayerModal = (game: string, playerId: string) => {
    setPlayerToRemove({ game, playerId });
    setShowRemovePlayerModal(true);
  };

  const handleRemovePlayer = async () => {
    if (!selectedTeam || !playerToRemove) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/teams/${selectedTeam._id}/roster`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { game: playerToRemove.game, playerId: playerToRemove.playerId },
      });

      setSuccess("Player removed successfully!");
      setShowRemovePlayerModal(false);
      setPlayerToRemove(null);
      fetchTeamDetails(selectedTeam._id);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to remove player");
    }
  };

  const openDeleteTeamModal = (teamId: string) => {
    setTeamToDelete(teamId);
    setShowDeleteTeamModal(true);
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/teams/${teamToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Team deleted successfully!");
      setShowDeleteTeamModal(false);
      setTeamToDelete(null);
      setSelectedTeam(null);
      fetchMyTeams();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete team");
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
          <h1 className="text-4xl font-bold text-white">Team Dashboard</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-white/10 border border-white/30 text-white px-6 py-3 rounded-lg font-bold hover:bg-white/20 hover:border-white/50 transition-all"
          >
            {showCreateForm ? "Cancel" : "Create New Team"}
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
        {showCreateForm && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Team</h2>
            <form onSubmit={handleCreateTeam} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Team Name *</label>
                  <input
                    type="text"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="Team Esports"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Team Tag *</label>
                  <input
                    type="text"
                    value={teamForm.tag}
                    onChange={(e) =>
                      setTeamForm({ ...teamForm, tag: e.target.value.toUpperCase() })
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
                    value={teamForm.game}
                    onChange={(e) => setTeamForm({ ...teamForm, game: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 [&>option]:bg-gray-900 [&>option]:text-white"
                    required
                  >
                    {GAMES.map((game) => (
                      <option key={game} value={game}>
                        {game}
                      </option>
                    ))}
                  </select>
                  <p className="text-gray-400 text-sm mt-1">
                    Note: A player can only be in one team per game
                  </p>
                </div>

                <div>
                  <label className="block text-white mb-2">Country</label>
                  <input
                    type="text"
                    value={teamForm.country}
                    onChange={(e) =>
                      setTeamForm({ ...teamForm, country: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    placeholder="Nepal"
                  />
                </div>

                <div className="flex items-center gap-3 pt-8">
                  <input
                    type="checkbox"
                    id="teamNepal"
                    checked={teamForm.isNepal}
                    onChange={(e) =>
                      setTeamForm({ ...teamForm, isNepal: e.target.checked })
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
                  value={teamForm.description}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  placeholder="Team description..."
                  maxLength={1000}
                />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Teams List */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">My Teams</h2>
              {teams.length > 0 ? (
                <div className="space-y-4">
                  {teams.map((team) => (
                    <div
                      key={team._id}
                      onClick={() => fetchTeamDetails(team._id)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedTeam?._id === team._id
                          ? "bg-white/20 border-2 border-white"
                          : "bg-white/5 border border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                          {team.tag}
                        </div>
                        <div>
                          <h3 className="text-white font-bold">{team.name}</h3>
                          <p className="text-sm text-gray-400">{team.tag}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No teams yet. Create your first team!
                </p>
              )}
            </div>
          </div>

          {/* Team Details */}
          <div className="lg:col-span-2">
            {selectedTeam ? (
              <div className="space-y-8">
                {/* Team Info */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {selectedTeam.name}
                      </h2>
                      <p className="text-gray-300 text-lg">[{selectedTeam.tag}]</p>
                    </div>
                    <button
                      onClick={() => openDeleteTeamModal(selectedTeam._id)}
                      className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all"
                    >
                      Delete Team
                    </button>
                  </div>
                  {selectedTeam.description && (
                    <p className="text-gray-300 mb-4">{selectedTeam.description}</p>
                  )}
                  {selectedTeam.country && (
                    <p className="text-gray-400">
                      <span className="font-semibold">Country:</span>{" "}
                      {selectedTeam.country}
                    </p>
                  )}
                </div>

                {/* Add Game Roster */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold text-white mb-6">Add Game Roster</h3>
                  <form onSubmit={handleAddGameRoster} className="space-y-4">
                    <div>
                      <label className="block text-white mb-2">Select Game</label>
                      <select
                        value={gameRosterForm.game}
                        onChange={(e) =>
                          setGameRosterForm({ game: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 [&>option]:bg-gray-900 [&>option]:text-white"
                      >
                        {GAMES.map((game) => (
                          <option key={game} value={game}>
                            {game}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-cyan-700 transition-all"
                    >
                      Add Game
                    </button>
                  </form>
                </div>

                {/* Game Rosters */}
                {selectedTeam.games && selectedTeam.games.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                    <h3 className="text-2xl font-bold text-white mb-6">Game Rosters</h3>
                    <div className="space-y-6">
                      {selectedTeam.games.map((gameData: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white/5 border border-white/20 rounded-lg p-6"
                        >
                          <h4 className="text-xl font-bold text-white mb-4">
                            {gameData.game}
                          </h4>

                          {/* Add Player Form */}
                          <div className="mb-6 p-4 bg-white/5 rounded-lg">
                            <h5 className="text-white font-semibold mb-4">
                              Add Player to {gameData.game}
                            </h5>
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                setPlayerForm({ ...playerForm, game: gameData.game });
                                handleAddPlayer(e);
                              }}
                              className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                              <input
                                type="text"
                                placeholder="Player Username"
                                value={
                                  playerForm.game === gameData.game
                                    ? playerForm.username
                                    : ""
                                }
                                onChange={(e) =>
                                  setPlayerForm({
                                    ...playerForm,
                                    game: gameData.game,
                                    username: e.target.value,
                                  })
                                }
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                                required
                              />
                              <select
                                value={
                                  playerForm.game === gameData.game
                                    ? playerForm.role
                                    : "Player"
                                }
                                onChange={(e) =>
                                  setPlayerForm({
                                    ...playerForm,
                                    game: gameData.game,
                                    role: e.target.value,
                                  })
                                }
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 [&>option]:bg-gray-900 [&>option]:text-white"
                              >
                                {ROLES.map((role) => (
                                  <option key={role} value={role}>
                                    {role}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                placeholder="In-Game Role (e.g., Duelist)"
                                value={
                                  playerForm.game === gameData.game
                                    ? playerForm.inGameRole
                                    : ""
                                }
                                onChange={(e) =>
                                  setPlayerForm({
                                    ...playerForm,
                                    game: gameData.game,
                                    inGameRole: e.target.value,
                                  })
                                }
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                              />
                              <button
                                type="submit"
                                className="bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-all"
                              >
                                Add Player
                              </button>
                            </form>
                          </div>

                          {/* Roster List */}
                          {gameData.roster && gameData.roster.length > 0 ? (
                            <div className="space-y-3">
                              {gameData.roster.map((player: any, pIndex: number) => (
                                <div
                                  key={pIndex}
                                  className="flex justify-between items-center bg-white/5 p-4 rounded-lg"
                                >
                                  <div>
                                    <p className="text-white font-semibold">
                                      {player.playerName}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      {player.role}
                                      {player.inGameRole && ` - ${player.inGameRole}`}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() =>
                                      openRemovePlayerModal(
                                        gameData.game,
                                        player.player
                                      )
                                    }
                                    className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm hover:bg-red-500/30 transition-all"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-400 text-center py-4">
                              No players in this roster yet
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 flex items-center justify-center h-96">
                <p className="text-gray-400 text-xl">
                  Select a team to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Remove Player Confirmation Modal */}
      {showRemovePlayerModal && (
        <ConfirmDialog
          title="Remove Player?"
          message="Are you sure you want to remove this player from the roster? They will need to be re-added if you change your mind."
          confirmText="Yes, Remove"
          cancelText="Cancel"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleRemovePlayer}
          onCancel={() => {
            setShowRemovePlayerModal(false);
            setPlayerToRemove(null);
          }}
        />
      )}

      {/* Delete Team Confirmation Modal */}
      {showDeleteTeamModal && (
        <ConfirmDialog
          title="Delete Team?"
          message="Are you sure you want to delete this team? This action cannot be undone and all team data will be permanently lost."
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

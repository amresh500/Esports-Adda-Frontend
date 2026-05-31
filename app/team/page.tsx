"use client";

import { useState, useEffect } from "react";
import api from '@/lib/api';
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConfirmDialog from "@/components/ConfirmDialog";
import SaveButton from "@/components/SaveButton";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";


const GAMES = [
  "Valorant", "CS2", "PUBG Mobile", "Dota 2", "League of Legends",
  "Free Fire", "Mobile Legends", "Apex Legends", "Call of Duty",
  "Rainbow Six Siege", "Other",
];
const ROLES = ["Player", "Captain", "Coach", "Manager", "Substitute"];

const fieldCls = "w-full px-3.5 py-3 bg-white/[0.05] border border-white/[0.10] rounded-lg text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#e85d5d]/50 focus:bg-white/[0.07] transition-all duration-200 [&>option]:bg-[#161618]";
const labelCls = "block text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-1.5";

export default function TeamDashboardPage() {
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [savingTeam, setSavingTeam] = useState(false);
  const [savingGame, setSavingGame] = useState(false);
  const [savingPlayer, setSavingPlayer] = useState<string | null>(null); // game name

  const [teamForm, setTeamForm] = useState({
    name: "", tag: "", game: "Valorant", description: "", country: "", isNepal: false,
    socialLinks: { twitter: "", discord: "", website: "" },
  });
  const [gameRosterForm, setGameRosterForm] = useState({ game: "Valorant" });
  const [playerForm, setPlayerForm] = useState({ game: "Valorant", username: "", role: "Player", inGameRole: "" });

  const [showRemovePlayerModal, setShowRemovePlayerModal] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<{ game: string; playerId: string } | null>(null);
  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [showLeaveTeamModal, setShowLeaveTeamModal] = useState(false);

  useEffect(() => { fetchMyTeams(); }, []);

  const fetchMyTeams = async () => {
    try {
      const response = await api.get(`/teams/my/teams`);
      setTeams(response.data.data.teams);
      setLoading(false);
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to fetch teams");
      setLoading(false);
    }
  };

  const fetchTeamDetails = async (teamId: string, isOwner?: boolean) => {
    try {
      const response = await api.get(`/teams/${teamId}`);
      // The detail endpoint is public and doesn't compute isOwner; carry it over
      // from the list (getMyTeams) so owner-only controls render correctly.
      const team = response.data.data.team;
      setSelectedTeam({
        ...team,
        isOwner: isOwner !== undefined ? isOwner : team.isOwner,
      });
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to fetch team details");
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTeam(true);
    try {
      await api.post(`/teams`, teamForm);
      showSuccess("Team created!");
      setTeamForm({ name: "", tag: "", game: "Valorant", description: "", country: "", isNepal: false,
        socialLinks: { twitter: "", discord: "", website: "" } });
      setShowCreateForm(false);
      fetchMyTeams();
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to create team");
    } finally { setSavingTeam(false); }
  };

  const handleAddGameRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    setSavingGame(true);
    try {
      await api.post(`/teams/${selectedTeam._id}/games`, gameRosterForm);
      showSuccess("Game roster added!");
      fetchTeamDetails(selectedTeam._id, selectedTeam.isOwner);
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to add game roster");
    } finally { setSavingGame(false); }
  };

  const handleAddPlayer = async (e: React.FormEvent, game: string) => {
    e.preventDefault();
    if (!selectedTeam) return;
    setSavingPlayer(game);
    try {
      await api.post(`/teams/${selectedTeam._id}/roster`,
        { ...playerForm, game });
      showSuccess("Player added!");
      setPlayerForm({ game: "Valorant", username: "", role: "Player", inGameRole: "" });
      fetchTeamDetails(selectedTeam._id, selectedTeam.isOwner);
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to add player");
    } finally { setSavingPlayer(null); }
  };

  const handleRemovePlayer = async () => {
    if (!selectedTeam || !playerToRemove) return;
    try {
      await api.delete(`/teams/${selectedTeam._id}/roster`, {
        data: { game: playerToRemove.game, playerId: playerToRemove.playerId },
      });
      showSuccess("Player removed!");
      setShowRemovePlayerModal(false);
      setPlayerToRemove(null);
      fetchTeamDetails(selectedTeam._id, selectedTeam.isOwner);
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to remove player");
    }
  };

  const handleDeleteTeam = async () => {
    if (!teamToDelete) return;
    try {
      await api.delete(`/teams/${teamToDelete}`);
      showSuccess("Team deleted!");
      setShowDeleteTeamModal(false);
      setTeamToDelete(null);
      setSelectedTeam(null);
      fetchMyTeams();
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to delete team");
    }
  };

  const handleLeaveTeam = async () => {
    try {
      // Pass the team id so leaving works even when currentTeam isn't set
      // (e.g. members added via the org/addMember path).
      await api.post(`/teams/leave`, { teamId: selectedTeam?._id });
      showSuccess("You have left the team.");
      setShowLeaveTeamModal(false);
      setSelectedTeam(null);
      fetchMyTeams();
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to leave team");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #111111 0%, #110a0a 100%)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#e85d5d]/30 border-t-[#e85d5d] animate-spin" />
        <p className="text-white/35 text-sm">Loading teams…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #111111 0%, #110a0a 100%)' }}>
      <Header />

      {/* Page header */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-['Russo_One'] text-2xl sm:text-3xl text-white">Team Dashboard</h1>
              <p className="text-white/35 text-sm mt-1">{teams.length} team{teams.length !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={() => setShowCreateForm(!showCreateForm)}
              className={showCreateForm ? "btn-ghost px-5 py-2.5 text-sm cursor-pointer" : "btn-brand px-5 py-2.5 text-sm cursor-pointer"}>
              {showCreateForm ? "Cancel" : "+ Create Team"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Create Team Form ── */}
        {showCreateForm && (
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <h2 className="font-['Russo_One'] text-base text-white">Create New Team</h2>
            </div>
            <form onSubmit={handleCreateTeam} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className={labelCls}>Team Name <span className="text-[#e85d5d]">*</span></label>
                  <input type="text" value={teamForm.name} required className={fieldCls} placeholder="Team Esports"
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} /></div>
                <div><label className={labelCls}>Team Tag <span className="text-[#e85d5d]">*</span></label>
                  <input type="text" value={teamForm.tag} required maxLength={10} className={fieldCls} placeholder="TE"
                    onChange={(e) => setTeamForm({ ...teamForm, tag: e.target.value.toUpperCase() })} /></div>
                <div><label className={labelCls}>Primary Game <span className="text-[#e85d5d]">*</span></label>
                  <select value={teamForm.game} required className={fieldCls}
                    onChange={(e) => setTeamForm({ ...teamForm, game: e.target.value })}>
                    {GAMES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <p className="text-white/20 text-[11px] mt-1">A player can only be in one team per game</p>
                </div>
                <div><label className={labelCls}>Country</label>
                  <input type="text" value={teamForm.country} className={fieldCls} placeholder="Nepal"
                    onChange={(e) => setTeamForm({ ...teamForm, country: e.target.value })} /></div>
              </div>
              <div><label className={labelCls}>Description</label>
                <textarea value={teamForm.description} rows={3} maxLength={1000} className={`${fieldCls} resize-none`}
                  placeholder="Team description…"
                  onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })} /></div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setTeamForm({ ...teamForm, isNepal: !teamForm.isNepal })}
                  className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${teamForm.isNepal ? 'bg-[#e85d5d] border-[#e85d5d]' : 'border-white/20'}`}>
                  {teamForm.isNepal && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
                  <input type="checkbox" checked={teamForm.isNepal} className="sr-only" readOnly />
                </div>
                <span className="text-white/55 text-sm">Nepal Team 🇳🇵</span>
              </label>
              <div className="flex justify-end pt-2">
                <SaveButton type="submit" saving={savingTeam} label="Create Team" className="px-8 py-3 text-sm" />
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teams list */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <h2 className="font-['Russo_One'] text-sm text-white/60 uppercase tracking-wider">My Teams</h2>
              </div>
              {teams.length > 0 ? (
                <div className="p-3 space-y-1">
                  {teams.map((team) => (
                    <button key={team._id} onClick={() => fetchTeamDetails(team._id, team.isOwner)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                        selectedTeam?._id === team._id
                          ? 'bg-[#e85d5d]/10 border border-[#e85d5d]/25'
                          : 'hover:bg-white/[0.04] border border-transparent'
                      }`}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-['Russo_One'] text-sm flex-shrink-0"
                        style={{ background: 'rgba(232,93,93,0.15)', color: '#e85d5d', border: '1px solid rgba(232,93,93,0.25)' }}>
                        {team.tag?.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{team.name}</p>
                        <p className="text-white/30 text-xs">[{team.tag}]</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 gap-3 text-white/25">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197" />
                  </svg>
                  <p className="text-sm text-center px-4">No teams yet. Create your first team!</p>
                </div>
              )}
            </div>
          </div>

          {/* Team detail */}
          <div className="lg:col-span-2">
            {selectedTeam ? (
              <div className="space-y-5">
                {/* Team header */}
                <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                  <div className="flex items-start justify-between px-6 py-5">
                    <div>
                      <h2 className="font-['Russo_One'] text-2xl text-white">{selectedTeam.name}</h2>
                      <p className="text-white/35 text-sm">[{selectedTeam.tag}]{selectedTeam.country && ` · ${selectedTeam.country}`}</p>
                      {selectedTeam.description && <p className="text-white/50 text-sm mt-3 max-w-md">{selectedTeam.description}</p>}
                    </div>
                    {selectedTeam.isOwner ? (
                      <button onClick={() => { setTeamToDelete(selectedTeam._id); setShowDeleteTeamModal(true); }}
                        className="text-red-400/50 hover:text-red-400 text-xs border border-red-500/15 hover:bg-red-500/[0.08] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex-shrink-0">
                        Delete Team
                      </button>
                    ) : (
                      <button onClick={() => setShowLeaveTeamModal(true)}
                        className="text-amber-400/60 hover:text-amber-400 text-xs border border-amber-500/15 hover:bg-amber-500/[0.08] px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex-shrink-0">
                        Leave Team
                      </button>
                    )}
                  </div>
                </div>

                {/* Add game roster — owner only */}
                {selectedTeam.isOwner && (
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.06]">
                      <h3 className="font-['Russo_One'] text-sm text-white/60 uppercase tracking-wider">Add Game Roster</h3>
                    </div>
                    <form onSubmit={handleAddGameRoster} className="p-6 flex gap-3">
                      <select value={gameRosterForm.game} className={`${fieldCls} flex-1`}
                        onChange={(e) => setGameRosterForm({ game: e.target.value })}>
                        {GAMES.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                      <SaveButton type="submit" saving={savingGame} label="Add Roster" savingLabel="Adding…" className="px-5 py-3 text-sm flex-shrink-0" />
                    </form>
                  </div>
                )}

                {/* Game rosters */}
                {selectedTeam.games?.length > 0 && selectedTeam.games.map((gameData: any, index: number) => (
                  <div key={index} className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.06]">
                      <h3 className="font-['Russo_One'] text-sm text-white">{gameData.game} Roster</h3>
                    </div>

                    {/* Add player form — owner only */}
                    {selectedTeam.isOwner && (
                      <div className="p-5 border-b border-white/[0.04]">
                        <p className="text-white/30 text-[10px] uppercase tracking-widest mb-3">Add Player</p>
                        <form onSubmit={(e) => handleAddPlayer(e, gameData.game)}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" placeholder="Player username" required className={fieldCls}
                            value={playerForm.game === gameData.game ? playerForm.username : ""}
                            onChange={(e) => setPlayerForm({ ...playerForm, game: gameData.game, username: e.target.value })} />
                          <select className={fieldCls}
                            value={playerForm.game === gameData.game ? playerForm.role : "Player"}
                            onChange={(e) => setPlayerForm({ ...playerForm, game: gameData.game, role: e.target.value })}>
                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <input type="text" placeholder="In-game role (e.g., Duelist)" className={fieldCls}
                            value={playerForm.game === gameData.game ? playerForm.inGameRole : ""}
                            onChange={(e) => setPlayerForm({ ...playerForm, game: gameData.game, inGameRole: e.target.value })} />
                          <SaveButton type="submit"
                            saving={savingPlayer === gameData.game}
                            label="Add Player" savingLabel="Adding…"
                            className="py-3 text-sm" />
                        </form>
                      </div>
                    )}

                    {/* Roster list */}
                    <div className="p-5">
                      {gameData.roster?.length > 0 ? (
                        <div className="space-y-2">
                          {gameData.roster.map((player: any, pIndex: number) => (
                            <div key={pIndex} className="flex items-center justify-between px-4 py-3 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                              <div>
                                <p className="text-white/85 text-sm font-semibold">{player.playerName}</p>
                                <p className="text-white/30 text-xs">{player.role}{player.inGameRole && ` · ${player.inGameRole}`}</p>
                              </div>
                              {selectedTeam.isOwner && (
                                <button onClick={() => { setPlayerToRemove({ game: gameData.game, playerId: player.player }); setShowRemovePlayerModal(true); }}
                                  className="text-red-400/40 hover:text-red-400 text-xs transition-colors cursor-pointer">
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-white/25 text-sm text-center py-4">No players in this roster yet</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] flex items-center justify-center h-64">
                <div className="text-center">
                  <svg className="w-8 h-8 text-white/15 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <p className="text-white/25 text-sm">Select a team to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRemovePlayerModal && (
        <ConfirmDialog
          title="Remove Player?"
          message="Are you sure you want to remove this player from the roster?"
          confirmText="Remove"
          cancelText="Cancel"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleRemovePlayer}
          onCancel={() => { setShowRemovePlayerModal(false); setPlayerToRemove(null); }}
        />
      )}
      {showDeleteTeamModal && (
        <ConfirmDialog
          title="Delete Team?"
          message="This action cannot be undone. All team data will be permanently lost."
          confirmText="Delete Team"
          cancelText="Cancel"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleDeleteTeam}
          onCancel={() => { setShowDeleteTeamModal(false); setTeamToDelete(null); }}
        />
      )}
      {showLeaveTeamModal && (
        <ConfirmDialog
          title="Leave Team?"
          message="You will be removed from this team's roster. You can be added back later by the team owner."
          confirmText="Leave Team"
          cancelText="Cancel"
          confirmButtonClass="bg-amber-500 hover:bg-amber-600"
          onConfirm={handleLeaveTeam}
          onCancel={() => setShowLeaveTeamModal(false)}
        />
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Footer />
    </div>
  );
}

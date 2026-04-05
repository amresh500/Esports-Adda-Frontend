'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConfirmDialog from '@/components/ConfirmDialog';
import AddStaffModal from '@/components/AddStaffModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const GAMES = [
  'Valorant', 'CS2', 'PUBG Mobile', 'Dota 2', 'League of Legends',
  'Free Fire', 'Mobile Legends', 'Apex Legends', 'Call of Duty',
  'Rainbow Six Siege', 'Other',
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [organization, setOrganization] = useState<any>(null);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'staff' | 'tournaments'>('staff');
  const [showCreateTournamentForm, setShowCreateTournamentForm] = useState(false);

  // Staff modal state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [addingStaff, setAddingStaff] = useState(false);

  // Remove staff confirmation
  const [showRemoveStaffModal, setShowRemoveStaffModal] = useState(false);
  const [staffToRemove, setStaffToRemove] = useState<string | null>(null);

  // Delete tournament confirmation
  const [showDeleteTournamentModal, setShowDeleteTournamentModal] = useState(false);
  const [tournamentToDelete, setTournamentToDelete] = useState<any>(null);

  // Tournament form
  const [tournamentForm, setTournamentForm] = useState({
    name: '', description: '', game: 'Valorant', customGame: '',
    matchmakingType: 'single_elimination', totalSlots: 8, teamSize: 5,
    registrationStartDate: '', registrationEndDate: '',
    tournamentStartDate: '', tournamentEndDate: '',
    prizePool: { amount: 0, currency: 'NPR' },
    entryFee: { amount: 0, currency: 'NPR', paymentInstructions: '' },
    requirements: { isNepalOnly: false, minRank: '' },
    streamUrl: '', discordUrl: '',
  });

  useEffect(() => {
    const accountType = localStorage.getItem('accountType');
    const isAdmin = localStorage.getItem('isOrgAdmin');

    if (accountType !== 'player' || isAdmin !== 'true') {
      router.push('/profile');
      return;
    }

    fetchOrganization();
    fetchTournaments();
  }, []);

  const fetchOrganization = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/org-auth/admin-org`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrganization(response.data.data.organization);
      setLoading(false);
    } catch (error: any) {
      console.error('Fetch admin org error:', error);
      if (error.response?.status === 403) {
        localStorage.removeItem('isOrgAdmin');
        localStorage.removeItem('adminOrgId');
        localStorage.removeItem('adminOrgName');
        router.push('/profile');
      }
      setError('Failed to load organization data');
      setLoading(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/tournaments/my/tournaments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTournaments(response.data.data.tournaments || []);
    } catch (error: any) {
      console.error('Fetch tournaments error:', error);
    }
  };

  const handleAddStaff = async ({ username, role, department }: { username: string; role: string; department: string }) => {
    setAddingStaff(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/org-auth/my/staff`,
        { username, role, department },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`Staff member ${username} added successfully!`);
      setShowAddStaffModal(false);
      fetchOrganization();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add staff member');
      setTimeout(() => setError(''), 3000);
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
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/org-auth/my/staff/${staffToRemove}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Staff member removed successfully!');
      setShowRemoveStaffModal(false);
      setStaffToRemove(null);
      fetchOrganization();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to remove staff member');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteTournament = async () => {
    if (!tournamentToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/tournaments/${tournamentToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Tournament deleted successfully!');
      setShowDeleteTournamentModal(false);
      setTournamentToDelete(null);
      fetchTournaments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete tournament');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/tournaments`, tournamentForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Tournament created successfully!');
      setShowCreateTournamentForm(false);
      setTournamentForm({
        name: '', description: '', game: 'Valorant', customGame: '',
        matchmakingType: 'single_elimination', totalSlots: 8, teamSize: 5,
        registrationStartDate: '', registrationEndDate: '',
        tournamentStartDate: '', tournamentEndDate: '',
        prizePool: { amount: 0, currency: 'NPR' },
        entryFee: { amount: 0, currency: 'NPR', paymentInstructions: '' },
        requirements: { isNepalOnly: false, minRank: '' },
        streamUrl: '', discordUrl: '',
      });
      fetchTournaments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create tournament');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415] flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
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
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {organization?.organizationName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
              <p className="text-yellow-400 text-lg font-semibold">
                {organization?.organizationName} [{organization?.tag}]
              </p>
              <p className="text-gray-400 text-sm mt-1">
                You are managing this organization as an Admin staff member.
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-6">{error}</div>
        )}
        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 px-6 py-4 rounded-lg mb-6">{success}</div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {(['staff', 'tournaments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white/20 border border-white/40 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Staff Tab */}
        {activeTab === 'staff' && (
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
                        {member.role === 'Admin' && (
                          <p className="text-yellow-400 text-xs mt-0.5">Has management access</p>
                        )}
                        {member.department && (
                          <p className="text-gray-400 text-sm">{member.department}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          member.isActive !== false
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {member.isActive !== false ? 'Active' : 'Inactive'}
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
              </div>
            )}
          </div>
        )}

        {/* Tournaments Tab */}
        {activeTab === 'tournaments' && (
          <div className="space-y-8">
            {!showCreateTournamentForm && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Tournaments</h2>
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
                                {tournament.matchmakingType.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm ${
                                tournament.status === 'draft' ? 'bg-gray-500/20 text-gray-300' :
                                tournament.status === 'registration_open' ? 'bg-green-500/20 text-green-300' :
                                tournament.status === 'ongoing' ? 'bg-yellow-500/20 text-yellow-300' :
                                tournament.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-red-500/20 text-red-300'
                              }`}>
                                {tournament.status.replace('_', ' ').toUpperCase()}
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
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => router.push(`/tournament/${tournament._id}/manage?from=admin-dashboard`)}
                            className="px-4 py-2 bg-purple-500/20 border border-purple-500 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all"
                          >
                            Manage
                          </button>
                          <button
                            onClick={() => router.push(`/tournament/${tournament._id}`)}
                            className="px-4 py-2 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => router.push(`/tournament/${tournament._id}/bracket`)}
                            className="px-4 py-2 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all"
                          >
                            View Bracket
                          </button>
                          {tournament.status !== 'ongoing' && (
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

            {/* Create Tournament Form */}
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
                          onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          placeholder="Enter tournament name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white mb-2">Game *</label>
                        <select
                          value={tournamentForm.game}
                          onChange={(e) => setTournamentForm({ ...tournamentForm, game: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 [&>option]:bg-gray-900 [&>option]:text-white"
                          required
                        >
                          {GAMES.map((game) => (
                            <option key={game} value={game}>{game}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-white mb-2">Description</label>
                      <textarea
                        value={tournamentForm.description}
                        onChange={(e) => setTournamentForm({ ...tournamentForm, description: e.target.value })}
                        rows={3}
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
                          onChange={(e) => setTournamentForm({ ...tournamentForm, matchmakingType: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 [&>option]:bg-gray-900 [&>option]:text-white"
                          required
                        >
                          <option value="single_elimination">Single Elimination</option>
                          <option value="double_elimination">Double Elimination</option>
                          <option value="round_robin">Round Robin</option>
                          <option value="swiss">Swiss System</option>
                          <option value="battle_royale">Battle Royale Scoring</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white mb-2">Total Slots *</label>
                        <select
                          value={tournamentForm.totalSlots}
                          onChange={(e) => setTournamentForm({ ...tournamentForm, totalSlots: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 [&>option]:bg-gray-900 [&>option]:text-white"
                          required
                        >
                          {[2, 4, 8, 16, 32, 64].map((n) => (
                            <option key={n} value={n}>{n} Teams</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-white mb-2">Team Size</label>
                        <input
                          type="number"
                          value={tournamentForm.teamSize || ''}
                          onChange={(e) => setTournamentForm({ ...tournamentForm, teamSize: parseInt(e.target.value) || 0 })}
                          min={1} max={100}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          placeholder="5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white mb-2">Registration Start *</label>
                        <input type="datetime-local" value={tournamentForm.registrationStartDate}
                          onChange={(e) => setTournamentForm({ ...tournamentForm, registrationStartDate: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40" required />
                      </div>
                      <div>
                        <label className="block text-white mb-2">Registration End *</label>
                        <input type="datetime-local" value={tournamentForm.registrationEndDate}
                          onChange={(e) => setTournamentForm({ ...tournamentForm, registrationEndDate: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40" required />
                      </div>
                      <div>
                        <label className="block text-white mb-2">Tournament Start *</label>
                        <input type="datetime-local" value={tournamentForm.tournamentStartDate}
                          onChange={(e) => setTournamentForm({ ...tournamentForm, tournamentStartDate: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40" required />
                      </div>
                      <div>
                        <label className="block text-white mb-2">Tournament End</label>
                        <input type="datetime-local" value={tournamentForm.tournamentEndDate}
                          onChange={(e) => setTournamentForm({ ...tournamentForm, tournamentEndDate: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40" />
                      </div>
                    </div>
                  </div>

                  {/* Prize */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Prize & Additional Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white mb-2">Prize Pool (NPR)</label>
                        <input type="number" value={tournamentForm.prizePool.amount || ''}
                          onChange={(e) => setTournamentForm({
                            ...tournamentForm,
                            prizePool: { ...tournamentForm.prizePool, amount: parseInt(e.target.value) || 0 }
                          })}
                          min={0}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          placeholder="50000" />
                      </div>
                      <div>
                        <label className="block text-white mb-2">Entry Fee (NPR)</label>
                        <input type="number" value={tournamentForm.entryFee.amount || ''}
                          onChange={(e) => setTournamentForm({
                            ...tournamentForm,
                            entryFee: { ...tournamentForm.entryFee, amount: parseInt(e.target.value) || 0 }
                          })}
                          min={0}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          placeholder="0 for free tournament" />
                      </div>
                      {tournamentForm.entryFee.amount > 0 && (
                        <div className="md:col-span-2">
                          <label className="block text-white mb-2">Payment Instructions *</label>
                          <textarea
                            value={tournamentForm.entryFee.paymentInstructions}
                            onChange={(e) => setTournamentForm({
                              ...tournamentForm,
                              entryFee: { ...tournamentForm.entryFee, paymentInstructions: e.target.value }
                            })}
                            rows={3}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                            placeholder="e.g. Pay NPR 500 to eSewa 98XXXXXXXX with your team name in remarks"
                            maxLength={1000}
                            required
                          />
                          <p className="text-gray-400 text-sm mt-1">Teams will see these instructions when registering and must upload a payment screenshot</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-white mb-2">Stream URL</label>
                        <input type="url" value={tournamentForm.streamUrl}
                          onChange={(e) => setTournamentForm({ ...tournamentForm, streamUrl: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                          placeholder="https://youtube.com/..." />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="isNepalOnly"
                        checked={tournamentForm.requirements.isNepalOnly}
                        onChange={(e) => setTournamentForm({
                          ...tournamentForm,
                          requirements: { ...tournamentForm.requirements, isNepalOnly: e.target.checked }
                        })}
                        className="w-5 h-5" />
                      <label htmlFor="isNepalOnly" className="text-white">Nepal Only Tournament</label>
                    </div>
                  </div>

                  <button type="submit"
                    className="w-full bg-white/10 border border-white/30 text-white py-4 rounded-lg font-bold text-lg hover:bg-white/20 hover:border-white/50 transition-all">
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

      <Footer />
    </div>
  );
}

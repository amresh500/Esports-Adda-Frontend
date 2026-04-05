'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConfirmDialog from '@/components/ConfirmDialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function TeamManagementPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = params.id;
  const fromPage = searchParams.get('from');

  // Get the appropriate back navigation based on where user came from
  const handleBack = () => {
    if (fromPage === 'org-profile') {
      router.push('/org-profile');
    } else {
      router.push('/org-profile');
    }
  };

  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isOrgOwner, setIsOrgOwner] = useState(false);

  // Add member form
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberForm, setAddMemberForm] = useState({
    playerUsername: '',
    role: 'Player',
    inGameRole: '',
  });

  // Confirmation modal states
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ gameIndex: number; memberIndex: number } | null>(null);
  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false);

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  useEffect(() => {
    if (team) {
      checkPermissions();
    }
  }, [team]);

  const fetchTeamDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/teams/${teamId}`);
      setTeam(response.data.data.team);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching team:', error);
      setError(error.response?.data?.message || 'Failed to load team');
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const accountType = localStorage.getItem('accountType');

      if (!token || !team) {
        setIsOwner(false);
        setIsOrgOwner(false);
        return;
      }

      console.log('Checking permissions for team:', team);
      console.log('Account type:', accountType);

      if (accountType === 'player') {
        try {
          const response = await axios.get(`${API_URL}/api/profile/my`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const userId = response.data.data.profile.user;
          const teamOwnerId = typeof team.owner === 'string' ? team.owner : team.owner?._id;
          console.log('Player userId:', userId, 'Team owner:', teamOwnerId);
          setIsOwner(userId === teamOwnerId);
        } catch (err) {
          console.error('Error fetching player profile:', err);
          setIsOwner(false);
        }
      } else if (accountType === 'organization') {
        try {
          const response = await axios.get(`${API_URL}/api/org-auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const orgId = response.data.data.organization._id;
          const teamOrgId = typeof team.organization === 'string' ? team.organization : team.organization?._id;
          console.log('Org ID:', orgId, 'Team organization:', teamOrgId);

          // Check if user is the org owner
          const isOrgMatch = orgId === teamOrgId;

          // Also check if user is the team owner directly
          const teamOwnerId = typeof team.owner === 'string' ? team.owner : team.owner?._id;
          const isDirectOwner = orgId === teamOwnerId;

          setIsOrgOwner(isOrgMatch || isDirectOwner);
          console.log('Is org owner:', isOrgMatch || isDirectOwner);
        } catch (err) {
          console.log('No organization profile found');
          // If team has null owner/organization, allow access for organization accounts
          // This handles legacy teams created before organization profiles existed
          if (!team.owner && !team.organization) {
            console.log('Team has no owner, granting access to organization account');
            setIsOrgOwner(true);
          } else {
            setIsOrgOwner(false);
          }
        }
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setIsOwner(false);
      setIsOrgOwner(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const memberData = {
        ...addMemberForm,
        game: team.game,
      };
      await axios.post(
        `${API_URL}/api/teams/${teamId}/members`,
        memberData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Member added successfully!');
      setShowAddMemberModal(false);
      setAddMemberForm({
        playerUsername: '',
        role: 'Player',
        inGameRole: '',
      });
      fetchTeamDetails();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to add member');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openRemoveMemberModal = (gameIndex: number, memberIndex: number) => {
    setMemberToRemove({ gameIndex, memberIndex });
    setShowRemoveMemberModal(true);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/teams/${teamId}/members/${memberToRemove.gameIndex}/${memberToRemove.memberIndex}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Member removed successfully!');
      setShowRemoveMemberModal(false);
      setMemberToRemove(null);
      fetchTeamDetails();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to remove member');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteTeamModal(false);
      router.push('/org-profile');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete team');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-xl">Loading team details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !team) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415]">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="text-red-400 text-xl">{error}</div>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
          >
            Go Back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isOwner && !isOrgOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415]">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="text-red-400 text-xl">You don't have permission to manage this team</div>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
          >
            Go Back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415]">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-500/20 border border-green-500 text-green-300 px-6 py-4 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500 text-red-300 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Profile
        </button>

        {/* Team Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white">{team.name}</h1>
                {team.game && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                    {team.game}
                  </span>
                )}
              </div>
              <p className="text-gray-300 text-xl">[{team.tag}]</p>
            </div>
            <button
              onClick={() => setShowDeleteTeamModal(true)}
              className="px-6 py-3 bg-red-500/20 border border-red-500 text-red-300 rounded-lg hover:bg-red-500/30 transition-all font-semibold"
            >
              Delete Team
            </button>
          </div>
        </div>

        {/* Team Roster Management */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Roster Management</h2>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-6 py-3 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all font-semibold"
            >
              + Add Member
            </button>
          </div>

          {/* Roster Display */}
          {team.game && (
            <div className="bg-white/5 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">{team.game} Roster</h3>
              {team.games && team.games.length > 0 ? (
                team.games
                  .filter((g: any) => g.game === team.game)
                  .map((game: any, gameIndex: number) => (
                    <div key={gameIndex}>
                      {game.roster && game.roster.length > 0 ? (
                        <div className="space-y-3">
                          {game.roster.map((member: any, memberIndex: number) => (
                            <div
                              key={memberIndex}
                              className="flex justify-between items-center bg-white/5 p-4 rounded-lg"
                            >
                              <div>
                                <p className="text-white font-semibold">{member.playerName}</p>
                                <div className="flex gap-3 mt-1">
                                  <span className="text-sm text-gray-400">{member.role}</span>
                                  {member.inGameRole && (
                                    <span className="text-sm text-blue-400">{member.inGameRole}</span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => openRemoveMemberModal(gameIndex, memberIndex)}
                                className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-400 mb-2">No members in the roster yet</p>
                          <p className="text-gray-500 text-sm">Click "Add Member" to add players to your team</p>
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-2">No members in the roster yet</p>
                  <p className="text-gray-500 text-sm">Click "Add Member" to add players to your team</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddMemberModal(false)}
        >
          <div
            className="bg-gradient-to-b from-[#1a1a1a] to-[#2a1a1a] rounded-2xl p-8 max-w-md w-full border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Add Team Member</h2>
            {team.game && (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 text-sm">
                  Adding member to <span className="font-semibold">{team.game}</span> roster
                </p>
              </div>
            )}
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-white mb-2">Player Username</label>
                <input
                  type="text"
                  value={addMemberForm.playerUsername}
                  onChange={(e) => setAddMemberForm({ ...addMemberForm, playerUsername: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="block text-white mb-2">Role</label>
                <select
                  value={addMemberForm.role}
                  onChange={(e) => setAddMemberForm({ ...addMemberForm, role: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  required
                >
                  <option value="Player" className="bg-gray-900">Player</option>
                  <option value="Captain" className="bg-gray-900">Captain</option>
                  <option value="Coach" className="bg-gray-900">Coach</option>
                  <option value="Manager" className="bg-gray-900">Manager</option>
                  <option value="Substitute" className="bg-gray-900">Substitute</option>
                </select>
              </div>
              <div>
                <label className="block text-white mb-2">In-Game Role (Optional)</label>
                <input
                  type="text"
                  value={addMemberForm.inGameRole}
                  onChange={(e) => setAddMemberForm({ ...addMemberForm, inGameRole: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  placeholder="e.g., Entry Fragger, Support, etc."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all font-semibold"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {showRemoveMemberModal && (
        <ConfirmDialog
          title="Remove Member?"
          message="Are you sure you want to remove this member from the team? They will need to be re-added if you change your mind."
          confirmText="Yes, Remove"
          cancelText="Cancel"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleRemoveMember}
          onCancel={() => {
            setShowRemoveMemberModal(false);
            setMemberToRemove(null);
          }}
        />
      )}

      {/* Delete Team Confirmation Modal */}
      {showDeleteTeamModal && (
        <ConfirmDialog
          title="Delete Team?"
          message={`Are you sure you want to delete ${team?.name}? This action cannot be undone and all team data will be permanently lost.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleDeleteTeam}
          onCancel={() => setShowDeleteTeamModal(false)}
        />
      )}

      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConfirmDialog from '@/components/ConfirmDialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function RegistrationApprovals({ tournament, tournamentId, onRefresh }: {
  tournament: any;
  tournamentId: string;
  onRefresh: () => void;
}) {
  const [filter, setFilter] = useState<'all' | 'pending_approval' | 'approved' | 'rejected'>('all');
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null);
  const [loadingScreenshot, setLoadingScreenshot] = useState(false);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const participants = tournament?.participants || [];
  const pendingCount = participants.filter((p: any) => p.status === 'pending_approval').length;
  const approvedCount = participants.filter((p: any) => p.status === 'approved').length;
  const rejectedCount = participants.filter((p: any) => p.status === 'rejected').length;

  const filteredParticipants = filter === 'all'
    ? participants
    : participants.filter((p: any) => p.status === filter);

  const handleViewScreenshot = async (teamId: string) => {
    try {
      setLoadingScreenshot(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/tournaments/${tournamentId}/participants/${teamId}/screenshot`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setScreenshotModal(response.data.data.screenshot);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load screenshot');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoadingScreenshot(false);
    }
  };

  const handleVerify = async (teamId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/api/tournaments/${tournamentId}/participants/${teamId}/verify`,
        { action, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(action === 'approve' ? 'Registration approved!' : 'Registration rejected.');
      setRejectModal(null);
      setRejectReason('');
      onRefresh();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify registration');
      setTimeout(() => setError(''), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const getTeamId = (team: any): string => {
    if (!team) return '';
    if (typeof team === 'string') return team;
    if (team._id) return typeof team._id === 'string' ? team._id : team._id.toString();
    return '';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs rounded-full font-semibold">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-500/20 border border-green-500/40 text-green-400 text-xs rounded-full font-semibold">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-500/20 border border-red-500/40 text-red-400 text-xs rounded-full font-semibold">Rejected</span>;
      case 'registered':
        return <span className="px-2 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs rounded-full font-semibold">Registered</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 border border-gray-500/40 text-gray-400 text-xs rounded-full font-semibold">{status}</span>;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-8 border border-white/20 mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Registration Approvals</h2>

      {/* Entry fee info */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
        <p className="text-yellow-300 font-semibold">
          Entry Fee: NPR {tournament.entryFee.amount.toLocaleString()}
        </p>
        <p className="text-gray-400 text-sm mt-1">{tournament.entryFee.paymentInstructions}</p>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-3 mb-4">
        <span className="px-3 py-1.5 bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 rounded-lg text-sm font-semibold">
          {pendingCount} Pending
        </span>
        <span className="px-3 py-1.5 bg-green-500/15 border border-green-500/30 text-green-400 rounded-lg text-sm font-semibold">
          {approvedCount} Approved
        </span>
        <span className="px-3 py-1.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded-lg text-sm font-semibold">
          {rejectedCount} Rejected
        </span>
      </div>

      {/* Messages */}
      {error && <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
      {success && <div className="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-4 text-sm">{success}</div>}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'all' as const, label: 'All' },
          { key: 'pending_approval' as const, label: 'Pending' },
          { key: 'approved' as const, label: 'Approved' },
          { key: 'rejected' as const, label: 'Rejected' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === tab.key
                ? 'bg-white/20 text-white border border-white/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Participant list */}
      {filteredParticipants.length === 0 ? (
        <p className="text-gray-400 text-center py-6">No registrations found.</p>
      ) : (
        <div className="space-y-3">
          {filteredParticipants.map((participant: any, index: number) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold truncate">{participant.teamName || 'Unknown Team'}</span>
                  {getStatusBadge(participant.status)}
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Registered: {participant.joinedAt ? new Date(participant.joinedAt).toLocaleString() : 'N/A'}
                </p>
                {participant.status === 'rejected' && participant.rejectionReason && (
                  <p className="text-red-400 text-sm mt-1">Reason: {participant.rejectionReason}</p>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {participant.status === 'pending_approval' && (
                  <>
                    <button
                      onClick={() => handleViewScreenshot(getTeamId(participant.team))}
                      disabled={loadingScreenshot}
                      className="px-3 py-1.5 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-semibold"
                    >
                      {loadingScreenshot ? 'Loading...' : 'View Screenshot'}
                    </button>
                    <button
                      onClick={() => handleVerify(getTeamId(participant.team), 'approve')}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all text-sm font-semibold"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectModal(getTeamId(participant.team))}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-red-500/20 border border-red-500 text-red-300 rounded-lg hover:bg-red-500/30 transition-all text-sm font-semibold"
                    >
                      Reject
                    </button>
                  </>
                )}
                {(participant.status === 'approved' || participant.status === 'rejected') && (
                  <button
                    onClick={() => handleViewScreenshot(getTeamId(participant.team))}
                    disabled={loadingScreenshot}
                    className="px-3 py-1.5 bg-white/10 border border-white/20 text-gray-300 rounded-lg hover:bg-white/15 transition-all text-sm"
                  >
                    View Screenshot
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Screenshot viewer modal — portaled to body to escape backdrop-blur stacking context */}
      {screenshotModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4" onClick={() => setScreenshotModal(null)}>
          <div className="bg-white/10 rounded-2xl p-4 max-w-2xl w-full max-h-[90vh] overflow-auto border border-white/20" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold text-lg">Payment Screenshot</h3>
              <button onClick={() => setScreenshotModal(null)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            <img
              src={screenshotModal}
              alt="Payment screenshot"
              className="w-full rounded-lg border border-white/10"
            />
          </div>
        </div>,
        document.body
      )}

      {/* Reject reason modal — portaled to body */}
      {rejectModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white/10 rounded-2xl p-6 max-w-md w-full border border-white/20">
            <h3 className="text-white font-semibold text-lg mb-4">Reject Registration</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (e.g. Payment not received, wrong amount, etc.)"
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/15 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerify(rejectModal, 'reject', rejectReason)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-500/20 border border-red-500 text-red-300 rounded-lg hover:bg-red-500/30 transition-all font-semibold"
              >
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default function TournamentManagePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tournamentId = params.id;
  const fromPage = searchParams.get('from');

  // Get the appropriate back navigation based on where user came from
  const handleBack = () => {
    if (fromPage === 'admin-dashboard') {
      router.push('/admin-dashboard');
    } else if (fromPage === 'org-profile') {
      router.push('/org-profile');
    } else if (fromPage === 'tournaments') {
      router.push('/tournaments');
    } else {
      router.push('/org-profile');
    }
  };

  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);

  // Modal states
  const [showReportResultModal, setShowReportResultModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [resultForm, setResultForm] = useState({
    winnerId: '',
    participant1Score: 0,
    participant2Score: 0,
  });

  // Dates modal
  const [showDatesModal, setShowDatesModal] = useState(false);
  const [datesForm, setDatesForm] = useState({
    registrationStartDate: '',
    registrationEndDate: '',
    tournamentStartDate: '',
    tournamentEndDate: '',
  });

  // Publish confirmation modal
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Reset match confirmation modal
  const [showResetMatchModal, setShowResetMatchModal] = useState(false);
  const [matchToReset, setMatchToReset] = useState<number | null>(null);

  // Regenerate bracket confirmation modal
  const [showRegenerateBracketModal, setShowRegenerateBracketModal] = useState(false);
  const [regeneratePreserveResults, setRegeneratePreserveResults] = useState(true);

  useEffect(() => {
    fetchTournamentDetails();
    checkPermissions();
  }, [tournamentId]);

  const fetchTournamentDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tournaments/${tournamentId}`);
      const tournamentData = response.data.data.tournament;
      console.log('Tournament data:', tournamentData);
      console.log('isPublished value:', tournamentData.isPublished);
      setTournament(tournamentData);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching tournament:', error);
      setError(error.response?.data?.message || 'Failed to load tournament');
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsOrganizer(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/tournaments/${tournamentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const tournamentData = response.data.data.tournament;
      const tournamentOrgId = tournamentData.organizer?._id || tournamentData.organizer;
      const accountType = localStorage.getItem('accountType');

      if (accountType === 'organization') {
        // Organization account: check via /api/org-auth/me
        const orgResponse = await axios.get(`${API_URL}/api/org-auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userOrgId = orgResponse.data.data.organization._id;
        setIsOrganizer(userOrgId === tournamentOrgId);
      } else {
        // Player account: check if admin staff of the tournament's org
        const adminResponse = await axios.get(`${API_URL}/api/org-auth/admin-org`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const adminOrgId = adminResponse.data.data.organization._id;
        setIsOrganizer(adminOrgId === tournamentOrgId);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setIsOrganizer(false);
    }
  };

  // Helper to extract team ID from various formats
  const getTeamId = (team: any): string => {
    if (!team) return '';
    // If team is already a string, return it
    if (typeof team === 'string') return team;
    // If team is an object with _id property (populated), return _id
    if (team._id) return typeof team._id === 'string' ? team._id : team._id.toString();
    // If team has toString method (ObjectId), use it
    if (typeof team.toString === 'function') return team.toString();
    return '';
  };

  const handleReportResult = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resultForm.winnerId) {
      setError('Please select a winner');
      setTimeout(() => setError(''), 3000);
      return;
    }

    console.log('Reporting result:', {
      matchNumber: selectedMatch.matchNumber,
      winnerId: resultForm.winnerId,
      participant1Team: selectedMatch.participant1?.team,
      participant2Team: selectedMatch.participant2?.team,
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/tournaments/${tournamentId}/matches/${selectedMatch.matchNumber}/result`,
        resultForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Report result response:', response.data);
      const resData = response.data.data;
      if (resData?.tournamentCompleted) {
        setSuccess(`🏆 Tournament completed! ${resData.winner?.teamName} is the champion!`);
      } else {
        setSuccess('Match result reported successfully! Teams have been auto-advanced.');
      }
      setShowReportResultModal(false);
      setResultForm({
        winnerId: '',
        participant1Score: 0,
        participant2Score: 0,
      });
      fetchTournamentDetails();
      setTimeout(() => setSuccess(''), 5000);
    } catch (error: any) {
      console.error('Report result error:', error.response?.data || error);
      setError(error.response?.data?.message || 'Failed to report result');
      setTimeout(() => setError(''), 5000);
    }
  };

  const openResetMatchModal = (matchNumber: number) => {
    setMatchToReset(matchNumber);
    setShowResetMatchModal(true);
  };

  const handleResetMatch = async () => {
    if (matchToReset === null) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/tournaments/${tournamentId}/matches/${matchToReset}/reset`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Match reset successfully!');
      setShowResetMatchModal(false);
      setMatchToReset(null);
      fetchTournamentDetails();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to reset match');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openReportResultModal = (match: any) => {
    setSelectedMatch(match);
    setResultForm({
      winnerId: '',
      participant1Score: 0,
      participant2Score: 0,
    });
    setShowReportResultModal(true);
  };

  const openDatesModal = () => {
    setDatesForm({
      registrationStartDate: tournament?.registrationStartDate
        ? new Date(tournament.registrationStartDate).toISOString().slice(0, 16)
        : '',
      registrationEndDate: tournament?.registrationEndDate
        ? new Date(tournament.registrationEndDate).toISOString().slice(0, 16)
        : '',
      tournamentStartDate: tournament?.tournamentStartDate
        ? new Date(tournament.tournamentStartDate).toISOString().slice(0, 16)
        : '',
      tournamentEndDate: tournament?.tournamentEndDate
        ? new Date(tournament.tournamentEndDate).toISOString().slice(0, 16)
        : '',
    });
    setShowDatesModal(true);
  };

  const handleUpdateDates = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/api/tournaments/${tournamentId}/registration-dates`,
        datesForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Tournament dates updated successfully!');
      setShowDatesModal(false);
      fetchTournamentDetails();
      setTimeout(() => setSuccess(''), 5000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update dates');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handlePublishTournament = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/api/tournaments/${tournamentId}/publish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Tournament published successfully! It is now visible to all users.');
      setShowPublishModal(false);
      fetchTournamentDetails();
      setTimeout(() => setSuccess(''), 5000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to publish tournament');
      setTimeout(() => setError(''), 5000);
    }
  };

  const openRegenerateBracketModal = (preserveResults: boolean) => {
    setRegeneratePreserveResults(preserveResults);
    setShowRegenerateBracketModal(true);
  };

  const handleRegenerateBracket = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/tournaments/${tournamentId}/generate-bracket`,
        { preserveResults: regeneratePreserveResults },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(regeneratePreserveResults
        ? 'Bracket regenerated successfully! Existing results have been preserved and winners auto-advanced.'
        : 'Bracket regenerated successfully!'
      );
      setShowRegenerateBracketModal(false);
      fetchTournamentDetails();
      setTimeout(() => setSuccess(''), 5000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to regenerate bracket');
      setTimeout(() => setError(''), 5000);
    }
  };

  const getRegistrationStatus = () => {
    if (!tournament) return { status: 'unknown', label: 'Unknown', color: 'gray' };

    const now = new Date();
    const regStart = new Date(tournament.registrationStartDate);
    const regEnd = new Date(tournament.registrationEndDate);

    if (now < regStart) {
      return { status: 'not_started', label: 'Not Started', color: 'yellow' };
    } else if (now > regEnd) {
      return { status: 'closed', label: 'Closed', color: 'red' };
    } else {
      return { status: 'open', label: 'Open', color: 'green' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-xl">Loading tournament...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isOrganizer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415]">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="text-red-400 text-xl">You don't have permission to manage this tournament</div>
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
          Back to {fromPage === 'admin-dashboard' ? 'Admin Dashboard' : fromPage === 'org-profile' ? 'Profile' : fromPage === 'tournaments' ? 'Tournaments' : 'Profile'}
        </button>

        {/* Tournament Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{tournament?.name}</h1>
              <div className="flex items-center gap-3">
                <p className="text-gray-400">Tournament Management - Organizer View</p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    tournament?.isPublished
                      ? 'bg-green-500/20 text-green-300 border border-green-500'
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500'
                  }`}
                >
                  {tournament?.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              {!tournament?.isPublished && (
                <button
                  onClick={() => setShowPublishModal(true)}
                  className="px-6 py-3 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all font-semibold"
                >
                  Publish Tournament
                </button>
              )}
              <button
                onClick={() => router.push(`/tournament/${tournamentId}/bracket`)}
                className="px-6 py-3 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all font-semibold"
              >
                View Public Bracket
              </button>
            </div>
          </div>
        </div>

        {/* Publish Warning for Draft Tournaments */}
        {!tournament?.isPublished && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl">⚠️</span>
              <div>
                <p className="text-yellow-300 font-semibold">Tournament Not Published</p>
                <p className="text-yellow-200/70 text-sm mt-1">
                  This tournament is currently in draft mode and is not visible to other users.
                  Click "Publish Tournament" to make it visible and allow teams to register.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tournament Winner Banner */}
        {tournament?.status === 'completed' && tournament?.winner?.teamName && (
          <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 backdrop-blur-md rounded-2xl p-8 border border-yellow-500/40 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🏆</div>
                <div>
                  <p className="text-yellow-400 text-sm font-semibold uppercase tracking-wider">Tournament Champion</p>
                  <p className="text-white text-3xl font-bold">{tournament.winner.teamName}</p>
                </div>
              </div>
              {tournament.runnerUp?.teamName && (
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🥈</div>
                  <div>
                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Runner-up</p>
                    <p className="text-white text-xl font-bold">{tournament.runnerUp.teamName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Low Teams Warning Banner — registration closed but not enough teams */}
        {tournament?.status === 'registration_closed' &&
          (tournament?.participants?.filter((p: any) =>
            ['registered', 'approved', 'confirmed'].includes(p.status)
          ).length ?? 0) < (tournament?.minimumTeams ?? 2) && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/40 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-yellow-300 font-semibold">Minimum Teams Not Met</p>
                <p className="text-yellow-200/70 text-sm mt-1">
                  Registration has closed but only{' '}
                  <strong>
                    {tournament.participants?.filter((p: any) =>
                      ['registered', 'approved', 'confirmed'].includes(p.status)
                    ).length ?? 0}
                  </strong>{' '}
                  of the required <strong>{tournament.minimumTeams ?? 2}</strong> teams have signed up.
                  Extend the registration deadline to give more teams a chance to join, or cancel the tournament.
                </p>
                <button
                  onClick={openDatesModal}
                  className="mt-3 px-4 py-2 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-all text-sm font-semibold"
                >
                  Extend Registration Deadline
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Overdue Warning Banner */}
        {tournament?.status === 'overdue' && (
          <div className="mb-6 bg-orange-500/10 border border-orange-500/40 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-orange-400 text-xl">⚠️</span>
              <div>
                <p className="text-orange-300 font-semibold">Tournament Overdue</p>
                <p className="text-orange-200/70 text-sm mt-1">
                  The tournament end date has passed but no winner has been declared yet.
                  Please report the final match result to complete the tournament, or contact the admin to force-complete it.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tournament Dates Management */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Tournament Dates Management</h2>

          {/* Registration Dates */}
          <h3 className="text-lg font-semibold text-white mb-4">Registration Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Registration Status */}
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-gray-400 text-sm mb-1">Registration Status</p>
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    getRegistrationStatus().color === 'green'
                      ? 'bg-green-500'
                      : getRegistrationStatus().color === 'red'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }`}
                ></span>
                <span
                  className={`font-semibold ${
                    getRegistrationStatus().color === 'green'
                      ? 'text-green-400'
                      : getRegistrationStatus().color === 'red'
                      ? 'text-red-400'
                      : 'text-yellow-400'
                  }`}
                >
                  {getRegistrationStatus().label}
                </span>
              </div>
            </div>

            {/* Registration Start Date */}
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-gray-400 text-sm mb-1">Registration Start</p>
              <p className="text-white font-semibold">
                {tournament?.registrationStartDate
                  ? new Date(tournament.registrationStartDate).toLocaleString()
                  : 'Not set'}
              </p>
            </div>

            {/* Registration End Date */}
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-gray-400 text-sm mb-1">Registration End</p>
              <p className="text-white font-semibold">
                {tournament?.registrationEndDate
                  ? new Date(tournament.registrationEndDate).toLocaleString()
                  : 'Not set'}
              </p>
            </div>
          </div>

          {/* Tournament Duration */}
          <h3 className="text-lg font-semibold text-white mb-4">Tournament Duration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Tournament Start Date */}
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-gray-400 text-sm mb-1">Tournament Start</p>
              <p className="text-white font-semibold">
                {tournament?.tournamentStartDate
                  ? new Date(tournament.tournamentStartDate).toLocaleString()
                  : 'Not set'}
              </p>
            </div>

            {/* Tournament End Date */}
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="text-gray-400 text-sm mb-1">Tournament End</p>
              <p className="text-white font-semibold">
                {tournament?.tournamentEndDate
                  ? new Date(tournament.tournamentEndDate).toLocaleString()
                  : 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-gray-400 text-sm">
                <strong>Registered Teams:</strong> {tournament?.participants?.length || 0} / {tournament?.totalSlots || 0}
              </p>
            </div>

            <button
              onClick={openDatesModal}
              disabled={tournament?.status === 'completed'}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                tournament?.status === 'completed'
                  ? 'bg-gray-500/20 border border-gray-500 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-500/20 border border-purple-500 text-purple-300 hover:bg-purple-500/30'
              }`}
            >
              {tournament?.status === 'overdue' ? 'Extend End Date' : 'Edit Dates'}
            </button>
          </div>

          {tournament?.status === 'completed' && (
            <p className="text-gray-400 text-sm mt-4">
              Dates cannot be modified for a completed tournament.
            </p>
          )}
          {(tournament?.status === 'ongoing' || tournament?.status === 'overdue') && (
            <p className="text-yellow-400 text-sm mt-4">
              Tournament is active — only the end date can be extended.
            </p>
          )}
        </div>

        {/* Registration Approvals (paid tournaments only) */}
        {tournament?.entryFee?.amount > 0 && (
          <RegistrationApprovals
            tournament={tournament}
            tournamentId={tournamentId as string}
            onRefresh={fetchTournamentDetails}
          />
        )}

        {/* Matches List */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Match Management</h2>
            <div className="flex gap-2">
              {tournament?.participants?.length >= 2 && (
                <>
                  {tournament?.matches && tournament.matches.length > 0 && (
                    <button
                      onClick={() => openRegenerateBracketModal(true)}
                      className="px-4 py-2 bg-yellow-500/20 border border-yellow-500 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-all text-sm font-semibold"
                      title="Regenerate bracket structure while keeping match results"
                    >
                      🔄 Fix Bracket
                    </button>
                  )}
                  <button
                    onClick={() => openRegenerateBracketModal(false)}
                    className="px-4 py-2 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all text-sm font-semibold"
                  >
                    {tournament?.matches && tournament.matches.length > 0 ? '🔄 Regenerate Bracket' : '✨ Generate Bracket'}
                  </button>
                </>
              )}
            </div>
          </div>

          {tournament?.matches && tournament.matches.length > 0 ? (
            <div className="space-y-4">
              {/* Group matches by round and bracket */}
              {Object.entries(
                tournament.matches.reduce((acc: any, match: any) => {
                  const key = `${match.bracket || 'main'}-round-${match.round}`;
                  if (!acc[key]) acc[key] = [];
                  acc[key].push(match);
                  return acc;
                }, {})
              ).map(([key, matches]: [string, any]) => {
                const [bracket, , round] = key.split('-');
                return (
                  <div key={key} className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-4 capitalize">
                      {bracket.replace('_', ' ')} Bracket - Round {round}
                    </h3>
                    <div className="space-y-3">
                      {matches.map((match: any) => {
                        // Detect bye match: completed with only one participant
                        const isByeMatch = match.status === 'completed' &&
                          ((!match.participant1?.team && match.participant2?.team) ||
                           (match.participant1?.team && !match.participant2?.team));
                        // Detect empty match: no participants at all
                        const isEmptyMatch = !match.participant1?.team && !match.participant2?.team;

                        if (isEmptyMatch && match.status === 'completed') return null;

                        return (
                        <div
                          key={match.matchNumber}
                          className={`p-6 rounded-lg border transition-all ${
                            isByeMatch
                              ? 'bg-white/3 border-white/5 opacity-60'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold">
                                  Match #{match.matchNumber}
                                </span>
                                {isByeMatch ? (
                                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-500/20 text-purple-300">
                                    BYE
                                  </span>
                                ) : (
                                  <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                      match.status === 'completed'
                                        ? 'bg-green-500/20 text-green-300'
                                        : match.status === 'in_progress'
                                        ? 'bg-yellow-500/20 text-yellow-300'
                                        : 'bg-gray-500/20 text-gray-300'
                                    }`}
                                  >
                                    {match.status.replace('_', ' ').toUpperCase()}
                                  </span>
                                )}
                              </div>

                              {/* Teams */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between bg-white/5 p-3 rounded">
                                  <span className="text-white font-semibold">
                                    {match.participant1?.teamName || 'BYE'}
                                  </span>
                                  {match.status === 'completed' && !isByeMatch && (
                                    <span className="text-white font-bold">
                                      {match.score?.participant1Score || 0}
                                    </span>
                                  )}
                                  {getTeamId(match.winner?.team) === getTeamId(match.participant1?.team) && getTeamId(match.winner?.team) && (
                                    <span className="text-green-400 font-bold">{isByeMatch ? 'Auto-advanced' : '✓ WINNER'}</span>
                                  )}
                                </div>

                                <div className="text-center text-gray-400 font-semibold">VS</div>

                                <div className="flex items-center justify-between bg-white/5 p-3 rounded">
                                  <span className="text-white font-semibold">
                                    {match.participant2?.teamName || 'BYE'}
                                  </span>
                                  {match.status === 'completed' && !isByeMatch && (
                                    <span className="text-white font-bold">
                                      {match.score?.participant2Score || 0}
                                    </span>
                                  )}
                                  {getTeamId(match.winner?.team) === getTeamId(match.participant2?.team) && getTeamId(match.winner?.team) && (
                                    <span className="text-green-400 font-bold">{isByeMatch ? 'Auto-advanced' : '✓ WINNER'}</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="ml-6 flex flex-col gap-2">
                              {match.status === 'pending' &&
                                match.participant1?.team &&
                                match.participant2?.team && (
                                  <button
                                    onClick={() => openReportResultModal(match)}
                                    className="px-4 py-2 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all font-semibold whitespace-nowrap"
                                  >
                                    Report Result
                                  </button>
                                )}

                              {match.status === 'completed' && !isByeMatch && (
                                <button
                                  onClick={() => openResetMatchModal(match.matchNumber)}
                                  className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-300 rounded-lg hover:bg-red-500/30 transition-all font-semibold whitespace-nowrap"
                                >
                                  Reset Match
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Match Info */}
                          {match.nextMatchWinner && !isByeMatch && (
                            <p className="text-gray-400 text-sm">
                              Winner advances to Match #{match.nextMatchWinner}
                            </p>
                          )}
                          {isByeMatch && match.nextMatchWinner && (
                            <p className="text-purple-400 text-sm">
                              {match.winner?.teamName} auto-advanced to Match #{match.nextMatchWinner}
                            </p>
                          )}
                          {match.nextMatchLoser && (
                            <p className="text-gray-400 text-sm">
                              Loser goes to Match #{match.nextMatchLoser} (Losers Bracket)
                            </p>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No matches generated yet</p>
              <p className="text-gray-500 text-sm mt-2">Generate bracket to create matches</p>
            </div>
          )}
        </div>
      </div>

      {/* Update Tournament Dates Modal */}
      {showDatesModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDatesModal(false)}
        >
          <div
            className="bg-gradient-to-b from-[#1a1a1a] to-[#2a1a1a] rounded-2xl p-8 max-w-lg w-full border border-white/20 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              {tournament?.status === 'ongoing' || tournament?.status === 'overdue'
                ? 'Extend Tournament End Date'
                : 'Edit Tournament Dates'}
            </h2>

            <form onSubmit={handleUpdateDates} className="space-y-6">
              {/* Context Info Banner */}
              {(tournament?.status === 'ongoing' || tournament?.status === 'overdue') ? (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <p className="text-orange-300 text-sm font-semibold">Extend Tournament End Date Only</p>
                  <p className="text-orange-200/70 text-sm mt-1">
                    The tournament is already underway. You can only extend the end date to give more time to finish the bracket.
                  </p>
                </div>
              ) : (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-300 text-sm">
                    <strong>Registration Status:</strong> {getRegistrationStatus().label}
                  </p>
                  {getRegistrationStatus().status === 'closed' && (
                    <p className="text-blue-300 text-sm mt-1">
                      Set a new registration end date in the future to reopen registration.
                    </p>
                  )}
                </div>
              )}

              {/* Registration Period Section — hidden when ongoing/overdue */}
              {tournament?.status !== 'ongoing' && tournament?.status !== 'overdue' && (
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Registration Period</h3>

                  {/* Registration Start Date */}
                  <div className="mb-4">
                    <label className="block text-white mb-2">Registration Start Date</label>
                    <input
                      type="datetime-local"
                      value={datesForm.registrationStartDate}
                      onChange={(e) =>
                        setDatesForm({ ...datesForm, registrationStartDate: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    />
                  </div>

                  {/* Registration End Date */}
                  <div>
                    <label className="block text-white mb-2">Registration End Date</label>
                    <input
                      type="datetime-local"
                      value={datesForm.registrationEndDate}
                      onChange={(e) =>
                        setDatesForm({ ...datesForm, registrationEndDate: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    />
                    <p className="text-gray-400 text-xs mt-1">Must be before tournament start date. Set a future date to reopen registration.</p>
                  </div>
                </div>
              )}

              {/* Tournament Duration Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Tournament Duration</h3>

                {/* Tournament Start Date — hidden when ongoing/overdue */}
                {tournament?.status !== 'ongoing' && tournament?.status !== 'overdue' && (
                  <div className="mb-4">
                    <label className="block text-white mb-2">Tournament Start Date</label>
                    <input
                      type="datetime-local"
                      value={datesForm.tournamentStartDate}
                      onChange={(e) =>
                        setDatesForm({ ...datesForm, tournamentStartDate: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                    />
                    <p className="text-gray-400 text-xs mt-1">Must be after registration end date</p>
                  </div>
                )}

                {/* Tournament End Date — always editable */}
                <div>
                  <label className="block text-white mb-2">Tournament End Date</label>
                  <input
                    type="datetime-local"
                    value={datesForm.tournamentEndDate}
                    onChange={(e) =>
                      setDatesForm({ ...datesForm, tournamentEndDate: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    {tournament?.status === 'ongoing' || tournament?.status === 'overdue'
                      ? 'Set a new end date to extend the tournament.'
                      : 'Must be after tournament start date.'}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDatesModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-500/20 border border-purple-500 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all font-semibold"
                >
                  {tournament?.status === 'ongoing' || tournament?.status === 'overdue'
                    ? 'Extend End Date'
                    : 'Update Dates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publish Tournament Confirmation Modal */}
      {showPublishModal && (
        <ConfirmDialog
          title="Publish Tournament?"
          message={`Are you sure you want to publish "${tournament?.name}"? It will become visible to all users and teams will be able to register.`}
          confirmText="Yes, Publish"
          cancelText="Cancel"
          confirmButtonClass="bg-green-500 hover:bg-green-600"
          onConfirm={handlePublishTournament}
          onCancel={() => setShowPublishModal(false)}
        />
      )}

      {/* Report Result Modal */}
      {showReportResultModal && selectedMatch && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowReportResultModal(false)}
        >
          <div
            className="bg-gradient-to-b from-[#1a1a1a] to-[#2a1a1a] rounded-2xl p-8 max-w-md w-full border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              Report Result - Match #{selectedMatch.matchNumber}
            </h2>

            <form onSubmit={handleReportResult} className="space-y-6">
              {/* Select Winner */}
              <div>
                <label className="block text-white mb-3 font-semibold">Select Winner *</label>
                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      resultForm.winnerId === getTeamId(selectedMatch.participant1?.team)
                        ? 'bg-green-500/20 border-green-500'
                        : 'bg-white/5 border-white/20 hover:border-white/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="winner"
                      value={getTeamId(selectedMatch.participant1?.team)}
                      checked={resultForm.winnerId === getTeamId(selectedMatch.participant1?.team)}
                      onChange={(e) => setResultForm({ ...resultForm, winnerId: e.target.value })}
                      className="w-5 h-5"
                      required
                    />
                    <span className="text-white font-semibold text-lg">
                      {selectedMatch.participant1?.teamName}
                    </span>
                  </label>

                  <label
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      resultForm.winnerId === getTeamId(selectedMatch.participant2?.team)
                        ? 'bg-green-500/20 border-green-500'
                        : 'bg-white/5 border-white/20 hover:border-white/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="winner"
                      value={getTeamId(selectedMatch.participant2?.team)}
                      checked={resultForm.winnerId === getTeamId(selectedMatch.participant2?.team)}
                      onChange={(e) => setResultForm({ ...resultForm, winnerId: e.target.value })}
                      className="w-5 h-5"
                      required
                    />
                    <span className="text-white font-semibold text-lg">
                      {selectedMatch.participant2?.teamName}
                    </span>
                  </label>
                </div>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2">
                    {selectedMatch.participant1?.teamName} Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={resultForm.participant1Score}
                    onChange={(e) =>
                      setResultForm({ ...resultForm, participant1Score: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="block text-white mb-2">
                    {selectedMatch.participant2?.teamName} Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={resultForm.participant2Score}
                    onChange={(e) =>
                      setResultForm({ ...resultForm, participant2Score: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  {selectedMatch.nextMatchWinner ? (
                    <>
                      <strong>✨ Auto-Advancement:</strong> The winner will be automatically moved to Match #{selectedMatch.nextMatchWinner} (Round {selectedMatch.round + 1})
                      {selectedMatch.nextMatchLoser &&
                        `, and the loser will go to Match #${selectedMatch.nextMatchLoser} (Losers Bracket)`}
                      .
                    </>
                  ) : (
                    <>
                      <strong>🏆 Finals:</strong> This is the final match! The winner will be crowned the tournament champion.
                    </>
                  )}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReportResultModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all font-semibold"
                >
                  Submit Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Match Confirmation Modal */}
      {showResetMatchModal && (
        <ConfirmDialog
          title="Reset Match?"
          message="Are you sure you want to reset this match? This will clear the result and any auto-advanced teams will be removed from subsequent matches."
          confirmText="Yes, Reset"
          cancelText="Cancel"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleResetMatch}
          onCancel={() => {
            setShowResetMatchModal(false);
            setMatchToReset(null);
          }}
        />
      )}

      {/* Regenerate Bracket Confirmation Modal */}
      {showRegenerateBracketModal && (
        <ConfirmDialog
          title={regeneratePreserveResults ? "Fix Bracket?" : "Generate Bracket?"}
          message={
            regeneratePreserveResults
              ? "This will regenerate the bracket structure while preserving existing match results. Winners will be auto-advanced to their next matches."
              : "This will completely regenerate the bracket and CLEAR all match results. This action cannot be undone."
          }
          confirmText={regeneratePreserveResults ? "Yes, Fix Bracket" : "Yes, Generate"}
          cancelText="Cancel"
          confirmButtonClass={regeneratePreserveResults ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"}
          onConfirm={handleRegenerateBracket}
          onCancel={() => setShowRegenerateBracketModal(false)}
        />
      )}

      <Footer />
    </div>
  );
}

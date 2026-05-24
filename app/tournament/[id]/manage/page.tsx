'use client';

import { useState, useEffect, Suspense } from "react";
import { createPortal } from 'react-dom';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConfirmDialog from '@/components/ConfirmDialog';


const fieldCls = "w-full px-3.5 py-3 bg-white/[0.05] border border-white/[0.10] rounded-lg text-white text-sm placeholder-white/25 focus:outline-none focus:border-[#e85d5d]/50 focus:bg-white/[0.07] transition-all duration-200";
const labelCls = "block text-white/40 text-[11px] font-semibold uppercase tracking-widest mb-1.5";

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:             "bg-white/[0.06]   text-white/40   border-white/[0.10]",
    in_progress:         "bg-amber-500/10   text-amber-400  border-amber-500/25",
    completed:           "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    bye:                 "bg-violet-500/10  text-violet-400 border-violet-500/25",
    pending_approval:    "bg-amber-500/10   text-amber-400  border-amber-500/25",
    approved:            "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    rejected:            "bg-red-500/10     text-red-400    border-red-500/25",
    registered:          "bg-sky-500/10     text-sky-400    border-sky-500/25",
  };
  const cls = map[status] ?? "bg-white/[0.06] text-white/40 border-white/[0.10]";
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   REGISTRATION APPROVALS SUB-COMPONENT
══════════════════════════════════════════════════════════════ */
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
  const pendingCount  = participants.filter((p: any) => p.status === 'pending_approval').length;
  const approvedCount = participants.filter((p: any) => p.status === 'approved').length;
  const rejectedCount = participants.filter((p: any) => p.status === 'rejected').length;

  const filteredParticipants = filter === 'all'
    ? participants
    : participants.filter((p: any) => p.status === filter);

  const getTeamId = (team: any): string => {
    if (!team) return '';
    if (typeof team === 'string') return team;
    if (team._id) return typeof team._id === 'string' ? team._id : team._id.toString();
    return '';
  };

  const handleViewScreenshot = async (teamId: string) => {
    try {
      setLoadingScreenshot(true);
      const response = await api.get(
        `/tournaments/${tournamentId}/participants/${teamId}/screenshot`
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
      await api.patch(
        `/tournaments/${tournamentId}/participants/${teamId}/verify`,
        { action, reason }
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

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden mb-5">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center gap-3">
        <h2 className="font-['Russo_One'] text-base text-white flex-1">Registration Approvals</h2>
        <div className="flex gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border bg-amber-500/10 text-amber-400 border-amber-500/25">
            {pendingCount} Pending
          </span>
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border bg-emerald-500/10 text-emerald-400 border-emerald-500/25">
            {approvedCount} Approved
          </span>
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border bg-red-500/10 text-red-400 border-red-500/25">
            {rejectedCount} Rejected
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Entry fee info */}
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.05] px-4 py-3 mb-5">
          <p className="text-amber-400 text-sm font-semibold">
            Entry Fee: NPR {tournament.entryFee.amount.toLocaleString()}
          </p>
          <p className="text-white/35 text-xs mt-1">{tournament.entryFee.paymentInstructions}</p>
        </div>

        {/* Messages */}
        {error   && <div className="rounded-lg border border-red-500/25     bg-red-500/[0.08]     text-red-400     px-4 py-3 mb-4 text-sm">{error}</div>}
        {success && <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-400 px-4 py-3 mb-4 text-sm">{success}</div>}

        {/* Filter tabs */}
        <div className="flex gap-0.5 p-1 bg-white/[0.03] border border-white/[0.07] rounded-xl mb-5 overflow-x-auto">
          {([
            { key: 'all' as const,              label: 'All' },
            { key: 'pending_approval' as const, label: 'Pending' },
            { key: 'approved' as const,         label: 'Approved' },
            { key: 'rejected' as const,         label: 'Rejected' },
          ]).map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`flex-1 min-w-[80px] px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                filter === tab.key
                  ? 'bg-[#e85d5d] text-white shadow-sm'
                  : 'text-white/40 hover:text-white/70'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Participant list */}
        {filteredParticipants.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3 text-white/20">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197" />
            </svg>
            <p className="text-sm">No registrations found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredParticipants.map((participant: any, index: number) => (
              <div key={index} className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-white/[0.04] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white/85 font-semibold text-sm truncate">{participant.teamName || 'Unknown Team'}</span>
                    <StatusBadge status={participant.status} />
                  </div>
                  <p className="text-white/30 text-xs mt-1">
                    Registered: {participant.joinedAt ? new Date(participant.joinedAt).toLocaleString() : 'N/A'}
                  </p>
                  {participant.status === 'rejected' && participant.rejectionReason && (
                    <p className="text-red-400/70 text-xs mt-1">Reason: {participant.rejectionReason}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap flex-shrink-0">
                  {participant.status === 'pending_approval' && (
                    <>
                      <button onClick={() => handleViewScreenshot(getTeamId(participant.team))} disabled={loadingScreenshot}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-sky-500/10 border-sky-500/25 text-sky-400 hover:bg-sky-500/20 transition-all cursor-pointer disabled:opacity-50">
                        {loadingScreenshot ? 'Loading…' : 'Screenshot'}
                      </button>
                      <button onClick={() => handleVerify(getTeamId(participant.team), 'approve')} disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50">
                        Approve
                      </button>
                      <button onClick={() => setRejectModal(getTeamId(participant.team))} disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50">
                        Reject
                      </button>
                    </>
                  )}
                  {(participant.status === 'approved' || participant.status === 'rejected') && (
                    <button onClick={() => handleViewScreenshot(getTeamId(participant.team))} disabled={loadingScreenshot}
                      className="px-3 py-1.5 rounded-lg text-xs border border-white/[0.10] text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all cursor-pointer disabled:opacity-50">
                      Screenshot
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Screenshot modal */}
      {screenshotModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={() => setScreenshotModal(null)}>
          <div className="bg-[#161618] border border-white/[0.10] rounded-2xl p-5 max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Russo_One'] text-white text-base">Payment Screenshot</h3>
              <button onClick={() => setScreenshotModal(null)}
                className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <img src={screenshotModal} alt="Payment screenshot" className="w-full rounded-lg border border-white/[0.08]" />
          </div>
        </div>,
        document.body
      )}

      {/* Reject reason modal */}
      {rejectModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#161618] border border-white/[0.10] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-['Russo_One'] text-white text-base">Reject Registration</h3>
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <label className={labelCls}>Rejection Reason</label>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Payment not received, wrong amount…"
              rows={3} className={`${fieldCls} resize-none mb-5`} />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-2.5 rounded-lg text-sm border border-white/[0.10] text-white/50 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={() => handleVerify(rejectModal, 'reject', rejectReason)} disabled={actionLoading}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold border bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50">
                {actionLoading ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
function TournamentManagePageInner() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tournamentId = params.id;
  const fromPage = searchParams.get('from');

  const handleBack = () => {
    if (fromPage === 'admin-dashboard') router.push('/admin-dashboard');
    else if (fromPage === 'org-profile')  router.push('/org-profile');
    else if (fromPage === 'tournaments')  router.push('/tournaments');
    else router.push('/org-profile');
  };

  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);

  const [showReportResultModal, setShowReportResultModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [resultForm, setResultForm] = useState({ winnerId: '', participant1Score: 0, participant2Score: 0 });

  const [showDatesModal, setShowDatesModal] = useState(false);
  const [datesForm, setDatesForm] = useState({ registrationStartDate: '', registrationEndDate: '', tournamentStartDate: '', tournamentEndDate: '' });

  const [showPublishModal, setShowPublishModal]             = useState(false);
  const [showResetMatchModal, setShowResetMatchModal]       = useState(false);
  const [matchToReset, setMatchToReset]                     = useState<number | null>(null);
  const [showRegenerateBracketModal, setShowRegenerateBracketModal] = useState(false);
  const [regeneratePreserveResults, setRegeneratePreserveResults]   = useState(true);

  useEffect(() => { fetchTournamentDetails(); checkPermissions(); }, [tournamentId]);

  const fetchTournamentDetails = async () => {
    try {
      const response = await api.get(`/tournaments/${tournamentId}`);
      setTournament(response.data.data.tournament);
      setLoading(false);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load tournament');
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const response = await api.get(`/tournaments/${tournamentId}`);
      const tournamentData = response.data.data.tournament;
      const tournamentOrgId = tournamentData.organizer?._id || tournamentData.organizer;
      const accountType = localStorage.getItem('accountType');
      if (accountType === 'organization') {
        const orgResponse = await api.get(`/org-auth/me`);
        setIsOrganizer(orgResponse.data.data.organization._id === tournamentOrgId);
      } else {
        const adminResponse = await api.get(`/org-auth/admin-org`);
        setIsOrganizer(adminResponse.data.data.organization._id === tournamentOrgId);
      }
    } catch { setIsOrganizer(false); }
  };

  const getTeamId = (team: any): string => {
    if (!team) return '';
    if (typeof team === 'string') return team;
    if (team._id) return typeof team._id === 'string' ? team._id : team._id.toString();
    if (typeof team.toString === 'function') return team.toString();
    return '';
  };

  const handleReportResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultForm.winnerId) { setError('Please select a winner'); setTimeout(() => setError(''), 3000); return; }
    try {
      const response = await api.post(
        `/tournaments/${tournamentId}/matches/${selectedMatch.matchNumber}/result`,
        resultForm
      );
      const resData = response.data.data;
      setSuccess(resData?.tournamentCompleted
        ? `🏆 Tournament completed! ${resData.winner?.teamName} is the champion!`
        : 'Match result reported! Teams have been auto-advanced.');
      setShowReportResultModal(false);
      setResultForm({ winnerId: '', participant1Score: 0, participant2Score: 0 });
      fetchTournamentDetails();
      setTimeout(() => setSuccess(''), 5000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to report result');
      setTimeout(() => setError(''), 5000);
    }
  };

  const openResetMatchModal = (matchNumber: number) => { setMatchToReset(matchNumber); setShowResetMatchModal(true); };

  const handleResetMatch = async () => {
    if (matchToReset === null) return;
    try {
      await api.post(`/tournaments/${tournamentId}/matches/${matchToReset}/reset`);
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
    setResultForm({ winnerId: '', participant1Score: 0, participant2Score: 0 });
    setShowReportResultModal(true);
  };

  const openDatesModal = () => {
    setDatesForm({
      registrationStartDate: tournament?.registrationStartDate ? new Date(tournament.registrationStartDate).toISOString().slice(0, 16) : '',
      registrationEndDate:   tournament?.registrationEndDate   ? new Date(tournament.registrationEndDate).toISOString().slice(0, 16) : '',
      tournamentStartDate:   tournament?.tournamentStartDate   ? new Date(tournament.tournamentStartDate).toISOString().slice(0, 16) : '',
      tournamentEndDate:     tournament?.tournamentEndDate     ? new Date(tournament.tournamentEndDate).toISOString().slice(0, 16) : '',
    });
    setShowDatesModal(true);
  };

  const handleUpdateDates = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/tournaments/${tournamentId}/registration-dates`, datesForm);
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
      await api.patch(`/tournaments/${tournamentId}/publish`);
      setSuccess('Tournament published! It is now visible to all users.');
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
      await api.post(`/tournaments/${tournamentId}/generate-bracket`, { preserveResults: regeneratePreserveResults });
      setSuccess(regeneratePreserveResults
        ? 'Bracket regenerated! Existing results preserved and winners auto-advanced.'
        : 'Bracket regenerated successfully!');
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
    const now = new Date(), regStart = new Date(tournament.registrationStartDate), regEnd = new Date(tournament.registrationEndDate);
    if (now < regStart) return { status: 'not_started', label: 'Not Started', color: 'yellow' };
    if (now > regEnd)   return { status: 'closed',      label: 'Closed',      color: 'red' };
    return               { status: 'open',        label: 'Open',        color: 'green' };
  };

  const approvedTeams = tournament?.participants?.filter((p: any) =>
    ['registered', 'approved', 'confirmed'].includes(p.status)
  ).length ?? 0;

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg,#111111 0%,#110a0a 100%)' }}>
      <Header />
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#e85d5d]/30 border-t-[#e85d5d] animate-spin" />
        <p className="text-white/35 text-sm">Loading tournament…</p>
      </div>
    </div>
  );

  /* ── No permission ── */
  if (!isOrganizer) return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#111111 0%,#110a0a 100%)' }}>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <p className="text-white/50 text-sm">You don't have permission to manage this tournament</p>
        <button onClick={handleBack} className="px-5 py-2.5 rounded-lg text-sm border border-white/[0.10] text-white/50 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer">
          Go Back
        </button>
      </div>
      <Footer />
    </div>
  );

  const regStatus = getRegistrationStatus();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#111111 0%,#110a0a 100%)' }}>
      <Header />

      {/* ── Banner ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0d0d0d 0%,#111111 60%,#e85d5d18 100%)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[220px] rounded-full blur-[120px] pointer-events-none" style={{ background: '#e85d5d12' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/[0.05]" />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,#e85d5d60,transparent)' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-10">
          {/* Back */}
          <button onClick={handleBack} className="flex items-center gap-1.5 text-white/35 hover:text-white/70 text-xs transition-colors mb-5 cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {fromPage === 'admin-dashboard' ? 'Admin Dashboard' : fromPage === 'org-profile' ? 'Profile' : fromPage === 'tournaments' ? 'Tournaments' : 'Profile'}
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end gap-5">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                  tournament?.isPublished
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                }`}>
                  {tournament?.isPublished ? 'Published' : 'Draft'}
                </span>
                <span className="text-white/25 text-[11px] uppercase tracking-widest">Organizer View</span>
              </div>
              <h1 className="font-['Russo_One'] text-3xl sm:text-4xl text-white leading-tight">{tournament?.name}</h1>
              <p className="text-white/35 text-sm mt-1">
                {tournament?.game} · {tournament?.matchmakingType?.replace(/_/g, ' ')}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              {!tournament?.isPublished && (
                <button onClick={() => setShowPublishModal(true)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer">
                  Publish
                </button>
              )}
              <button onClick={() => router.push(`/tournament/${tournamentId}/bracket`)}
                className="px-4 py-2 rounded-lg text-sm font-semibold border border-white/[0.10] text-white/50 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer">
                Public Bracket
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-16 space-y-5">

        {/* Global messages */}
        {success && <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-400 px-5 py-3.5 text-sm">{success}</div>}
        {error   && <div className="rounded-xl border border-red-500/25     bg-red-500/[0.08]     text-red-400     px-5 py-3.5 text-sm">{error}</div>}

        {/* Draft warning */}
        {!tournament?.isPublished && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-5 py-4 flex items-start gap-3">
            <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-amber-400 text-sm font-semibold">Tournament Not Published</p>
              <p className="text-amber-400/60 text-xs mt-0.5">This tournament is in draft mode and not visible to other users. Click "Publish" to open registrations.</p>
            </div>
          </div>
        )}

        {/* Winner banner */}
        {tournament?.status === 'completed' && tournament?.winner?.teamName && (
          <div className="rounded-xl overflow-hidden border border-amber-500/30" style={{ background: 'linear-gradient(135deg,#f59e0b18 0%,#0d0d0d 60%)' }}>
            <div className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl">🏆</span>
                <div>
                  <p className="text-amber-400/70 text-[10px] font-bold uppercase tracking-widest mb-0.5">Tournament Champion</p>
                  <p className="font-['Russo_One'] text-white text-2xl">{tournament.winner.teamName}</p>
                </div>
              </div>
              {tournament.runnerUp?.teamName && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🥈</span>
                  <div>
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-0.5">Runner-up</p>
                    <p className="font-['Russo_One'] text-white text-lg">{tournament.runnerUp.teamName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Low teams warning */}
        {tournament?.status === 'registration_closed' && approvedTeams < (tournament?.minimumTeams ?? 2) && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-5 py-4 flex items-start gap-3">
            <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div className="flex-1">
              <p className="text-amber-400 text-sm font-semibold">Minimum Teams Not Met</p>
              <p className="text-amber-400/60 text-xs mt-0.5">
                Registration closed with only <strong>{approvedTeams}</strong> of the required <strong>{tournament.minimumTeams ?? 2}</strong> teams.
                Extend the registration deadline or cancel the tournament.
              </p>
              <button onClick={openDatesModal}
                className="mt-3 px-3.5 py-1.5 rounded-lg text-xs font-semibold border bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer">
                Extend Registration
              </button>
            </div>
          </div>
        )}

        {/* Overdue warning */}
        {tournament?.status === 'overdue' && (
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.05] px-5 py-4 flex items-start gap-3">
            <svg className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-orange-400 text-sm font-semibold">Tournament Overdue</p>
              <p className="text-orange-400/60 text-xs mt-0.5">The end date has passed but no winner has been declared. Report the final match result or contact admin.</p>
            </div>
          </div>
        )}

        {/* ── Dates section ── */}
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <h2 className="font-['Russo_One'] text-base text-white">Tournament Dates</h2>
            <button onClick={openDatesModal} disabled={tournament?.status === 'completed'}
              className="text-white/50 hover:text-white text-xs border border-white/[0.10] px-3.5 py-1.5 rounded-lg hover:bg-white/[0.05] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
              {tournament?.status === 'overdue' ? 'Extend End Date' : 'Edit Dates'}
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              {/* Registration status */}
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5">Registration</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    regStatus.color === 'green' ? 'bg-emerald-400' : regStatus.color === 'red' ? 'bg-red-400' : 'bg-amber-400'
                  }`} />
                  <span className={`text-sm font-semibold ${
                    regStatus.color === 'green' ? 'text-emerald-400' : regStatus.color === 'red' ? 'text-red-400' : 'text-amber-400'
                  }`}>{regStatus.label}</span>
                </div>
              </div>
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5">Reg. Start</p>
                <p className="text-white/80 text-sm">{tournament?.registrationStartDate ? new Date(tournament.registrationStartDate).toLocaleString() : '—'}</p>
              </div>
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5">Reg. End</p>
                <p className="text-white/80 text-sm">{tournament?.registrationEndDate ? new Date(tournament.registrationEndDate).toLocaleString() : '—'}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.05]">
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5">Tournament Start</p>
                <p className="text-white/80 text-sm">{tournament?.tournamentStartDate ? new Date(tournament.tournamentStartDate).toLocaleString() : '—'}</p>
              </div>
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1.5">Tournament End</p>
                <p className="text-white/80 text-sm">{tournament?.tournamentEndDate ? new Date(tournament.tournamentEndDate).toLocaleString() : '—'}</p>
              </div>
            </div>
            <p className="text-white/25 text-xs mt-4">
              {tournament?.participants?.length || 0} / {tournament?.totalSlots || 0} teams registered
              {tournament?.status === 'completed' && ' · Dates locked for completed tournament'}
              {(tournament?.status === 'ongoing' || tournament?.status === 'overdue') && ' · Only end date can be extended'}
            </p>
          </div>
        </div>

        {/* ── Registration approvals (paid only) ── */}
        {tournament?.entryFee?.amount > 0 && (
          <RegistrationApprovals tournament={tournament} tournamentId={tournamentId as string} onRefresh={fetchTournamentDetails} />
        )}

        {/* ── Match management ── */}
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <h2 className="font-['Russo_One'] text-base text-white">Match Management</h2>
            {tournament?.participants?.length >= 2 && (
              <div className="flex gap-2">
                {tournament?.matches?.length > 0 && (
                  <button onClick={() => openRegenerateBracketModal(true)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer">
                    Fix Bracket
                  </button>
                )}
                <button onClick={() => openRegenerateBracketModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer">
                  {tournament?.matches?.length > 0 ? 'Regenerate' : 'Generate Bracket'}
                </button>
              </div>
            )}
          </div>

          <div className="p-6">
            {tournament?.matches?.length > 0 ? (
              <div className="space-y-6">
                {Object.entries(
                  tournament.matches.reduce((acc: Record<string, any[]>, match: any) => {
                    const key = `${match.bracket || 'main'}-round-${match.round}`;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(match);
                    return acc;
                  }, {} as Record<string, any[]>)
                ).map((entry) => {
                  const [key, matches] = entry as [string, any[]];
                  const [bracket, , round] = key.split('-');
                  return (
                    <div key={key}>
                      <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mb-3 capitalize">
                        {bracket.replace('_', ' ')} Bracket · Round {round}
                      </p>
                      <div className="space-y-2">
                        {matches.map((match: any) => {
                          const isByeMatch = match.status === 'completed' &&
                            ((!match.participant1?.team && match.participant2?.team) ||
                             (match.participant1?.team && !match.participant2?.team));
                          const isEmptyMatch = !match.participant1?.team && !match.participant2?.team;
                          if (isEmptyMatch && match.status === 'completed') return null;

                          const p1IsWinner = getTeamId(match.winner?.team) === getTeamId(match.participant1?.team) && getTeamId(match.winner?.team);
                          const p2IsWinner = getTeamId(match.winner?.team) === getTeamId(match.participant2?.team) && getTeamId(match.winner?.team);

                          return (
                            <div key={match.matchNumber}
                              className={`rounded-xl border transition-all ${
                                isByeMatch ? 'border-white/[0.04] bg-white/[0.01] opacity-60' : 'border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04]'
                              }`}>
                              <div className="px-4 py-3">
                                {/* Match header */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-white/35 text-[10px] font-bold uppercase tracking-widest">Match #{match.matchNumber}</span>
                                    {isByeMatch
                                      ? <StatusBadge status="bye" />
                                      : <StatusBadge status={match.status} />
                                    }
                                  </div>
                                  <div className="flex gap-2">
                                    {match.status === 'pending' && match.participant1?.team && match.participant2?.team && (
                                      <button onClick={() => openReportResultModal(match)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer whitespace-nowrap">
                                        Report Result
                                      </button>
                                    )}
                                    {match.status === 'completed' && !isByeMatch && (
                                      <>
                                        <button onClick={() => router.push(`/tournament/${tournamentId}/match/${match.matchNumber}/stats`)}
                                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-[#e85d5d]/10 border-[#e85d5d]/25 text-[#e85d5d] hover:bg-[#e85d5d]/20 transition-all cursor-pointer whitespace-nowrap">
                                          Enter Stats
                                        </button>
                                        <button onClick={() => openResetMatchModal(match.matchNumber)}
                                          className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer whitespace-nowrap">
                                          Reset
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Teams */}
                                <div className="space-y-1.5">
                                  {[
                                    { participant: match.participant1, isWinner: p1IsWinner, score: match.score?.participant1Score },
                                    { participant: match.participant2, isWinner: p2IsWinner, score: match.score?.participant2Score },
                                  ].map(({ participant, isWinner, score }, i) => (
                                    <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                                      isWinner ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/[0.03] border border-white/[0.05]'
                                    }`}>
                                      <span className={`text-sm font-semibold ${isWinner ? 'text-emerald-400' : 'text-white/70'}`}>
                                        {participant?.teamName || 'BYE'}
                                      </span>
                                      <div className="flex items-center gap-3">
                                        {match.status === 'completed' && !isByeMatch && (
                                          <span className={`text-sm font-bold ${isWinner ? 'text-emerald-400' : 'text-white/40'}`}>{score ?? 0}</span>
                                        )}
                                        {isWinner && (
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                                            {isByeMatch ? 'Auto' : '✓ Win'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Footer info */}
                                {(match.nextMatchWinner || isByeMatch) && (
                                  <p className={`text-xs mt-2 ${isByeMatch ? 'text-violet-400/70' : 'text-white/25'}`}>
                                    {isByeMatch
                                      ? `${match.winner?.teamName} auto-advanced to Match #${match.nextMatchWinner}`
                                      : match.nextMatchWinner && `Winner → Match #${match.nextMatchWinner}`
                                    }
                                    {match.nextMatchLoser && ` · Loser → Match #${match.nextMatchLoser} (Losers)`}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 gap-4 text-white/20">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
                <p className="text-sm">No matches generated yet</p>
                {tournament?.participants?.length >= 2 && (
                  <button onClick={() => openRegenerateBracketModal(false)}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#e85d5d] hover:bg-[#d94f4f] transition-all cursor-pointer">
                    Generate Bracket
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ DATES MODAL ══ */}
      {showDatesModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDatesModal(false)}>
          <div className="bg-[#161618] border border-white/[0.10] rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-['Russo_One'] text-white text-lg">
                {tournament?.status === 'ongoing' || tournament?.status === 'overdue' ? 'Extend End Date' : 'Edit Tournament Dates'}
              </h2>
              <button onClick={() => setShowDatesModal(false)}
                className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.09] transition-all cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleUpdateDates} className="space-y-5">
              {/* Context banner */}
              {(tournament?.status === 'ongoing' || tournament?.status === 'overdue') ? (
                <div className="rounded-lg border border-orange-500/20 bg-orange-500/[0.05] px-4 py-3">
                  <p className="text-orange-400 text-xs font-semibold">Extend Tournament End Date Only</p>
                  <p className="text-orange-400/60 text-xs mt-1">Tournament is underway. You can only extend the end date.</p>
                </div>
              ) : (
                <div className="rounded-lg border border-sky-500/20 bg-sky-500/[0.05] px-4 py-3">
                  <p className="text-sky-400 text-xs">Registration: <strong>{regStatus.label}</strong></p>
                  {regStatus.status === 'closed' && <p className="text-sky-400/70 text-xs mt-1">Set a future reg. end date to reopen registration.</p>}
                </div>
              )}

              {tournament?.status !== 'ongoing' && tournament?.status !== 'overdue' && (
                <div className="space-y-4 pb-5 border-b border-white/[0.06]">
                  <p className={labelCls}>Registration Period</p>
                  <div>
                    <label className={labelCls}>Registration Start</label>
                    <input type="datetime-local" value={datesForm.registrationStartDate} className={fieldCls}
                      onChange={(e) => setDatesForm({ ...datesForm, registrationStartDate: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Registration End</label>
                    <input type="datetime-local" value={datesForm.registrationEndDate} className={fieldCls}
                      onChange={(e) => setDatesForm({ ...datesForm, registrationEndDate: e.target.value })} />
                    <p className="text-white/20 text-[11px] mt-1">Set a future date to reopen registration</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <p className={labelCls}>Tournament Duration</p>
                {tournament?.status !== 'ongoing' && tournament?.status !== 'overdue' && (
                  <div>
                    <label className={labelCls}>Tournament Start</label>
                    <input type="datetime-local" value={datesForm.tournamentStartDate} className={fieldCls}
                      onChange={(e) => setDatesForm({ ...datesForm, tournamentStartDate: e.target.value })} />
                  </div>
                )}
                <div>
                  <label className={labelCls}>Tournament End</label>
                  <input type="datetime-local" value={datesForm.tournamentEndDate} className={fieldCls}
                    onChange={(e) => setDatesForm({ ...datesForm, tournamentEndDate: e.target.value })} />
                  <p className="text-white/20 text-[11px] mt-1">
                    {tournament?.status === 'ongoing' || tournament?.status === 'overdue'
                      ? 'Set a new end date to extend the tournament'
                      : 'Must be after tournament start date'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowDatesModal(false)}
                  className="flex-1 py-3 rounded-lg text-sm border border-white/[0.10] text-white/50 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 rounded-lg text-sm font-semibold text-white bg-[#e85d5d] hover:bg-[#d94f4f] transition-all cursor-pointer">
                  {tournament?.status === 'ongoing' || tournament?.status === 'overdue' ? 'Extend Date' : 'Update Dates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ REPORT RESULT MODAL ══ */}
      {showReportResultModal && selectedMatch && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReportResultModal(false)}>
          <div className="bg-[#161618] border border-white/[0.10] rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-['Russo_One'] text-white text-lg">Report Result</h2>
              <div className="flex items-center gap-3">
                <span className="text-white/30 text-xs">Match #{selectedMatch.matchNumber}</span>
                <button onClick={() => setShowReportResultModal(false)}
                  className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.09] transition-all cursor-pointer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleReportResult} className="space-y-5">
              <div>
                <label className={labelCls}>Select Winner <span className="text-[#e85d5d]">*</span></label>
                <div className="space-y-2 mt-2">
                  {[
                    { team: selectedMatch.participant1, key: 'p1' },
                    { team: selectedMatch.participant2, key: 'p2' },
                  ].map(({ team }) => {
                    const id = getTeamId(team?.team);
                    const selected = resultForm.winnerId === id;
                    return (
                      <label key={id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selected ? 'bg-emerald-500/10 border-emerald-500/40' : 'border-white/[0.08] hover:border-white/20 bg-white/[0.02]'
                      }`}>
                        <input type="radio" name="winner" value={id}
                          checked={selected}
                          onChange={(e) => setResultForm({ ...resultForm, winnerId: e.target.value })}
                          className="sr-only" required />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'border-emerald-500 bg-emerald-500' : 'border-white/20'}`}>
                          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className={`font-semibold text-sm ${selected ? 'text-emerald-400' : 'text-white/70'}`}>{team?.teamName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>{selectedMatch.participant1?.teamName} Score</label>
                  <input type="number" min="0" value={resultForm.participant1Score} className={fieldCls}
                    onChange={(e) => setResultForm({ ...resultForm, participant1Score: parseInt(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className={labelCls}>{selectedMatch.participant2?.teamName} Score</label>
                  <input type="number" min="0" value={resultForm.participant2Score} className={fieldCls}
                    onChange={(e) => setResultForm({ ...resultForm, participant2Score: parseInt(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="rounded-lg border border-sky-500/20 bg-sky-500/[0.05] px-4 py-3">
                <p className="text-sky-400 text-xs">
                  {selectedMatch.nextMatchWinner ? (
                    <>Winner auto-advances to Match #{selectedMatch.nextMatchWinner}
                    {selectedMatch.nextMatchLoser && `, loser goes to Match #${selectedMatch.nextMatchLoser} (Losers)`}.</>
                  ) : (
                    <>This is the final match — the winner becomes champion.</>
                  )}
                </p>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowReportResultModal(false)}
                  className="flex-1 py-3 rounded-lg text-sm border border-white/[0.10] text-white/50 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-3 rounded-lg text-sm font-semibold text-white bg-[#e85d5d] hover:bg-[#d94f4f] transition-all cursor-pointer">
                  Submit Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ CONFIRM DIALOGS ══ */}
      {showPublishModal && (
        <ConfirmDialog
          title="Publish Tournament?"
          message={`Publish "${tournament?.name}"? It will become visible to all users and teams can register.`}
          confirmText="Yes, Publish" cancelText="Cancel"
          confirmButtonClass="bg-emerald-500 hover:bg-emerald-600"
          onConfirm={handlePublishTournament}
          onCancel={() => setShowPublishModal(false)}
        />
      )}
      {showResetMatchModal && (
        <ConfirmDialog
          title="Reset Match?"
          message="This will clear the result and remove auto-advanced teams from subsequent matches."
          confirmText="Yes, Reset" cancelText="Cancel"
          confirmButtonClass="bg-red-500 hover:bg-red-600"
          onConfirm={handleResetMatch}
          onCancel={() => { setShowResetMatchModal(false); setMatchToReset(null); }}
        />
      )}
      {showRegenerateBracketModal && (
        <ConfirmDialog
          title={regeneratePreserveResults ? 'Fix Bracket?' : 'Generate Bracket?'}
          message={regeneratePreserveResults
            ? 'Regenerate the bracket structure while preserving existing match results. Winners will be auto-advanced.'
            : 'Completely regenerate the bracket and CLEAR all match results. This cannot be undone.'}
          confirmText={regeneratePreserveResults ? 'Yes, Fix Bracket' : 'Yes, Generate'}
          cancelText="Cancel"
          confirmButtonClass={regeneratePreserveResults ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}
          onConfirm={handleRegenerateBracket}
          onCancel={() => setShowRegenerateBracketModal(false)}
        />
      )}

      <Footer />
    </div>
  );
}

export default function TournamentManagePage() {
  return (
    <Suspense fallback={<div style={{minHeight: '60vh'}} />}>
      <TournamentManagePageInner />
    </Suspense>
  );
}

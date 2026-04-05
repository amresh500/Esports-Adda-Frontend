'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TournamentBracket from '@/components/TournamentBracket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function PublicBracketPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tournamentId = params.id;
  const fromPage = searchParams.get('from');

  // Get the appropriate back navigation based on where user came from
  const handleBack = () => {
    if (fromPage === 'org-profile') {
      router.push('/org-profile');
    } else if (fromPage === 'tournaments') {
      router.push('/tournaments');
    } else {
      router.push(`/tournament/${tournamentId}`);
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

  useEffect(() => {
    fetchTournamentDetails();
    checkPermissions();
  }, [tournamentId]);

  const fetchTournamentDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tournaments/${tournamentId}`);
      setTournament(response.data.data.tournament);
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

      const accountType = localStorage.getItem('accountType');
      if (accountType !== 'organization') {
        setIsOrganizer(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/tournaments/${tournamentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const tournamentData = response.data.data.tournament;
      const orgResponse = await axios.get(`${API_URL}/api/org-auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userOrgId = orgResponse.data.data.organization._id;
      const tournamentOrgId = tournamentData.organizer?._id || tournamentData.organizer;

      setIsOrganizer(userOrgId === tournamentOrgId);
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
        setSuccess('Match result reported! Teams have been auto-advanced to next matches.');
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

  const openReportResultModal = (match: any) => {
    setSelectedMatch(match);
    setResultForm({
      winnerId: '',
      participant1Score: 0,
      participant2Score: 0,
    });
    setShowReportResultModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-xl">Loading bracket...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415]">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="text-red-400 text-xl">{error || 'Tournament not found'}</div>
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

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {fromPage === 'org-profile' ? 'Profile' : fromPage === 'tournaments' ? 'Tournaments' : 'Tournament'}
        </button>

        {/* Tournament Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-8 border border-white/20 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">{tournament.name}</h1>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  {tournament.game === 'Other' ? tournament.customGame : tournament.game}
                </span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                  {tournament.matchmakingType.replace('_', ' ').toUpperCase()}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    tournament.status === 'draft'
                      ? 'bg-gray-500/20 text-gray-300'
                      : tournament.status === 'registration_open'
                      ? 'bg-green-500/20 text-green-300'
                      : tournament.status === 'ongoing'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : tournament.status === 'completed'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {tournament.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Winner Banner */}
        {tournament.status === 'completed' && tournament.winner?.teamName && (
          <div className="bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 backdrop-blur-md rounded-2xl p-4 sm:p-8 border border-yellow-500/40 mb-4 sm:mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-5xl">🏆</div>
                <div>
                  <p className="text-yellow-400 text-sm font-semibold uppercase tracking-wider">Tournament Champion</p>
                  <p className="text-white text-xl sm:text-3xl font-bold">{tournament.winner.teamName}</p>
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

        {/* Tournament Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-6 border border-white/20">
            <p className="text-gray-400 text-xs sm:text-sm mb-1">Teams Registered</p>
            <p className="text-white text-lg sm:text-2xl font-bold">
              {tournament.participants?.length || 0} / {tournament.totalSlots}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-6 border border-white/20">
            <p className="text-gray-400 text-xs sm:text-sm mb-1">Prize Pool</p>
            <p className="text-white text-lg sm:text-2xl font-bold">NPR {tournament.prizePool?.amount?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-6 border border-white/20">
            <p className="text-gray-400 text-xs sm:text-sm mb-1">Team Size</p>
            <p className="text-white text-lg sm:text-2xl font-bold">{tournament.teamSize} Players</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-6 border border-white/20">
            <p className="text-gray-400 text-xs sm:text-sm mb-1">Start Date</p>
            <p className="text-white text-base sm:text-xl font-bold">
              {new Date(tournament.tournamentStartDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Participating Teams */}
        {tournament.participants && tournament.participants.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-8 border border-white/20 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Participating Teams</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {tournament.participants.map((participant: any, index: number) => (
                <div
                  key={participant._id || index}
                  className="bg-white/5 border border-white/20 rounded-lg p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{participant.team?.name || 'Unknown Team'}</p>
                      <p className="text-gray-400 text-sm">[{participant.team?.tag || 'N/A'}]</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tournament Bracket */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-8 border border-white/20 overflow-x-auto">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Tournament Bracket</h2>
            <div className="flex items-center gap-2 sm:gap-3">
              {isOrganizer && (
                <span className="px-4 py-2 bg-green-500/20 border border-green-500 text-green-300 rounded-lg text-sm font-semibold">
                  ⚙️ Organizer View
                </span>
              )}
              <button
                onClick={() => {
                  fetchTournamentDetails();
                }}
                className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all text-sm"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

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

          {tournament.matches && tournament.matches.length > 0 ? (
            <div className="space-y-6">
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
                  <div key={key} className="space-y-3">
                    <h3 className="text-xl font-bold text-white mb-4 capitalize sticky top-0 bg-[#111111]/80 backdrop-blur-sm py-2 px-4 rounded-lg border border-white/10">
                      {bracket === 'main' ? 'Tournament' : bracket.replace('_', ' ')} {bracket !== 'finals' && `- Round ${round}`}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {matches.map((match: any) => {
                        const isByeMatch = match.status === 'completed' &&
                          ((!match.participant1?.team && match.participant2?.team) ||
                           (match.participant1?.team && !match.participant2?.team));
                        const isEmptyMatch = !match.participant1?.team && !match.participant2?.team;

                        if (isEmptyMatch && match.status === 'completed') return null;

                        return (
                        <div
                          key={match.matchNumber}
                          className={`p-5 rounded-lg border transition-all ${
                            isByeMatch
                              ? 'bg-white/3 border-white/5 opacity-60'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {/* Match Header */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold">
                              Match #{match.matchNumber}
                            </span>
                            {isByeMatch ? (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300">
                                BYE
                              </span>
                            ) : (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  match.status === 'completed'
                                    ? 'bg-green-500/20 text-green-300'
                                    : match.status === 'in_progress'
                                    ? 'bg-yellow-500/20 text-yellow-300'
                                    : 'bg-gray-500/20 text-gray-300'
                                }`}
                              >
                                {match.status === 'completed' ? '✓ DONE' : match.status.toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Teams */}
                          <div className="space-y-2 mb-4">
                            <div
                              className={`flex items-center justify-between p-3 rounded transition-all ${
                                getTeamId(match.winner?.team) === getTeamId(match.participant1?.team) && getTeamId(match.winner?.team)
                                  ? 'bg-green-500/20 border-2 border-green-500'
                                  : 'bg-white/5 border border-white/10'
                              }`}
                            >
                              <span className="text-white font-semibold">
                                {match.participant1?.teamName || 'BYE'}
                              </span>
                              {match.status === 'completed' && !isByeMatch && (
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-bold text-lg">
                                    {match.score?.participant1Score || 0}
                                  </span>
                                  {getTeamId(match.winner?.team) === getTeamId(match.participant1?.team) && getTeamId(match.winner?.team) && (
                                    <span className="text-green-400 text-lg">👑</span>
                                  )}
                                </div>
                              )}
                              {isByeMatch && getTeamId(match.winner?.team) === getTeamId(match.participant1?.team) && getTeamId(match.winner?.team) && (
                                <span className="text-purple-300 text-xs font-semibold">Auto-advanced</span>
                              )}
                            </div>

                            <div className="text-center text-gray-400 font-semibold text-sm">VS</div>

                            <div
                              className={`flex items-center justify-between p-3 rounded transition-all ${
                                getTeamId(match.winner?.team) === getTeamId(match.participant2?.team) && getTeamId(match.winner?.team)
                                  ? 'bg-green-500/20 border-2 border-green-500'
                                  : 'bg-white/5 border border-white/10'
                              }`}
                            >
                              <span className="text-white font-semibold">
                                {match.participant2?.teamName || 'BYE'}
                              </span>
                              {match.status === 'completed' && !isByeMatch && (
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-bold text-lg">
                                    {match.score?.participant2Score || 0}
                                  </span>
                                  {getTeamId(match.winner?.team) === getTeamId(match.participant2?.team) && getTeamId(match.winner?.team) && (
                                    <span className="text-green-400 text-lg">👑</span>
                                  )}
                                </div>
                              )}
                              {isByeMatch && getTeamId(match.winner?.team) === getTeamId(match.participant2?.team) && getTeamId(match.winner?.team) && (
                                <span className="text-purple-300 text-xs font-semibold">Auto-advanced</span>
                              )}
                            </div>
                          </div>

                          {/* Report Result Button (Organizer Only) */}
                          {isOrganizer &&
                            match.status === 'pending' &&
                            match.participant1?.team &&
                            match.participant2?.team && (
                              <button
                                onClick={() => openReportResultModal(match)}
                                className="w-full px-4 py-2 bg-green-500/20 border border-green-500 text-green-300 rounded-lg hover:bg-green-500/30 transition-all font-semibold text-sm"
                              >
                                📝 Report Result
                              </button>
                            )}

                          {/* Match Info */}
                          {match.nextMatchWinner && !isByeMatch && (
                            <p className="text-gray-400 text-xs mt-2">
                              Winner → Match #{match.nextMatchWinner}
                            </p>
                          )}
                          {isByeMatch && match.nextMatchWinner && (
                            <p className="text-purple-400 text-xs mt-2">
                              {match.winner?.teamName} → Match #{match.nextMatchWinner}
                            </p>
                          )}
                          {match.nextMatchLoser && (
                            <p className="text-gray-400 text-xs">
                              Loser → Match #{match.nextMatchLoser}
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
              <p className="text-gray-400 text-lg">No bracket generated yet</p>
              <p className="text-gray-500 text-sm mt-2">
                {tournament.participants?.length > 0
                  ? 'Organizer needs to generate the bracket'
                  : 'Waiting for teams to register'}
              </p>
            </div>
          )}
        </div>

        {/* Stream and Discord Links */}
        {(tournament.streamUrl || tournament.discordUrl) && (
          <div className="mt-6 flex gap-4 justify-center">
            {tournament.streamUrl && (
              <a
                href={tournament.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-purple-500/20 border border-purple-500 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all font-semibold"
              >
                📺 Watch Live Stream
              </a>
            )}
            {tournament.discordUrl && (
              <a
                href={tournament.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all font-semibold"
              >
                💬 Join Discord
              </a>
            )}
          </div>
        )}
      </div>

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

      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TournamentBracket from '@/components/TournamentBracket';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function TournamentDetailsPage() {
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
      router.push('/tournaments');
    }
  };

  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchTournamentDetails();
    checkUserPermissions();
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

  const getRegistrationStatus = () => {
    if (!tournament) return { status: 'unknown', label: 'Unknown', color: 'gray' };

    const now = new Date();
    const regStart = new Date(tournament.registrationStartDate);
    const regEnd = new Date(tournament.registrationEndDate);

    if (now < regStart) {
      return { status: 'not_started', label: 'Registration Not Started', color: 'yellow' };
    } else if (now > regEnd) {
      return { status: 'closed', label: 'Registration Closed', color: 'red' };
    } else {
      return { status: 'open', label: 'Registration Open', color: 'green' };
    }
  };

  const checkUserPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const accountType = localStorage.getItem('accountType');

      if (!token) {
        setIsOrganizer(false);
        return;
      }

      if (accountType === 'organization') {
        const response = await axios.get(`${API_URL}/api/org-auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const orgId = response.data.data.organization._id;
        setCurrentUserId(orgId);

        // Check if this organization is the organizer
        const tournamentResponse = await axios.get(`${API_URL}/api/tournaments/${tournamentId}`);
        setIsOrganizer(tournamentResponse.data.data.tournament.organizer === orgId);
      } else {
        setIsOrganizer(false);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setIsOrganizer(false);
    }
  };

  const handleBracketUpdate = async (matches: any[]) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/api/tournaments/${tournamentId}/bracket`,
        { matches },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Bracket updated successfully');
    } catch (error: any) {
      console.error('Failed to update bracket:', error);
      alert(error.response?.data?.message || 'Failed to save bracket changes');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a0a0a]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-xl">Loading tournament details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a0a0a]">
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
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a0a0a]">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {fromPage === 'org-profile' ? 'Profile' : 'Tournaments'}
        </button>

        {/* Tournament Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">{tournament.name}</h1>
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

            {isOrganizer && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => router.push(`/tournament/${tournamentId}/manage`)}
                  className="px-4 py-2 bg-purple-500/20 border border-purple-500 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all"
                >
                  Manage Tournament
                </button>
                <button
                  onClick={() => router.push(`/tournament/${tournamentId}/edit`)}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all"
                >
                  Edit Tournament
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tournament Winner Banner */}
        {tournament.status === 'completed' && tournament.winner?.teamName && (
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

        {/* Tournament Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
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
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Teams Registered</p>
            <p className="text-white text-2xl font-bold">
              {tournament.participants?.length || 0} / {tournament.totalSlots}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Prize Pool</p>
            <p className="text-white text-2xl font-bold">NPR {tournament.prizePool?.amount?.toLocaleString() || 0}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Team Size</p>
            <p className="text-white text-2xl font-bold">{tournament.teamSize} Players</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <p className="text-gray-400 text-sm mb-1">Start Date</p>
            <p className="text-white text-xl font-bold">
              {new Date(tournament.tournamentStartDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Description */}
        {tournament.description && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">About This Tournament</h2>
            <p className="text-gray-300 leading-relaxed">{tournament.description}</p>
          </div>
        )}

        {/* Tournament Details */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Tournament Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Organized By</p>
              <p className="text-white font-semibold">{tournament.organizerName || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Registration Period</p>
              <p className="text-white font-semibold">
                {new Date(tournament.registrationStartDate).toLocaleDateString()} -{' '}
                {new Date(tournament.registrationEndDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Tournament Duration</p>
              <p className="text-white font-semibold">
                {new Date(tournament.tournamentStartDate).toLocaleDateString()} -{' '}
                {new Date(tournament.tournamentEndDate).toLocaleDateString()}
              </p>
            </div>
            {tournament.streamUrl && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Stream</p>
                <a
                  href={tournament.streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 font-semibold"
                >
                  Watch Live →
                </a>
              </div>
            )}
            {tournament.discordUrl && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Discord</p>
                <a
                  href={tournament.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Join Server →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Tournament Bracket */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Tournament Bracket Management</h2>
            {tournament.participants?.length > 0 && isOrganizer && (
              <span className="text-sm text-green-400 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/30">
                ✏️ Edit Mode: Drag teams • Enter scores • Declare winners
              </span>
            )}
            {!isOrganizer && (
              <button
                onClick={() => router.push(`/tournament/${tournamentId}/bracket`)}
                className="px-4 py-2 bg-blue-500/20 border border-blue-500 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all text-sm"
              >
                View Public Bracket
              </button>
            )}
          </div>

          <TournamentBracket
            participants={tournament.participants || []}
            matchmakingType={tournament.matchmakingType}
            isEditable={isOrganizer}
            onBracketUpdate={handleBracketUpdate}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}

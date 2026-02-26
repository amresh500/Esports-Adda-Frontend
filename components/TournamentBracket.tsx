'use client';

import { useState, useEffect } from 'react';

// Participant from API - team is populated with { _id, name, tag }
interface Participant {
  _id?: string;
  team: {
    _id: string;
    name: string;
    tag: string;
  } | string; // Can be string (ObjectId) or populated object
  teamName?: string;
  status?: string;
}

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  team1: Participant | null;
  team2: Participant | null;
  winner: Participant | null;
  score: {
    team1: number;
    team2: number;
  };
}

interface TournamentBracketProps {
  participants: Participant[];
  matchmakingType: string;
  isEditable: boolean;
  onBracketUpdate?: (matches: Match[]) => void;
}

const TournamentBracket = ({
  participants,
  matchmakingType,
  isEditable,
  onBracketUpdate,
}: TournamentBracketProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [draggedTeam, setDraggedTeam] = useState<Participant | null>(null);

  // Helper to get team name from participant (handles both populated and unpopulated)
  const getTeamName = (participant: Participant | null): string => {
    if (!participant) return 'TBD';
    // If teamName is directly available, use it
    if (participant.teamName) return participant.teamName;
    // If team is populated object with name
    if (typeof participant.team === 'object' && participant.team?.name) {
      return participant.team.name;
    }
    return 'TBD';
  };

  // Helper to get team tag from participant
  const getTeamTag = (participant: Participant | null): string => {
    if (!participant) return '';
    // If team is populated object with tag
    if (typeof participant.team === 'object' && participant.team?.tag) {
      return participant.team.tag;
    }
    return '';
  };

  // Helper to get team ID from participant
  const getTeamId = (participant: Participant | null): string => {
    if (!participant) return '';
    if (typeof participant.team === 'object' && participant.team?._id) {
      return participant.team._id;
    }
    if (typeof participant.team === 'string') {
      return participant.team;
    }
    return '';
  };

  useEffect(() => {
    console.log('TournamentBracket - participants received:', participants);
    console.log('TournamentBracket - matchmakingType:', matchmakingType);
    generateBracket();
  }, [participants, matchmakingType]);

  const generateBracket = () => {
    if (matchmakingType === 'single_elimination') {
      generateSingleEliminationBracket();
    } else if (matchmakingType === 'double_elimination') {
      generateDoubleEliminationBracket();
    } else if (matchmakingType === 'round_robin') {
      generateRoundRobinMatches();
    }
  };

  const generateSingleEliminationBracket = () => {
    const numTeams = participants.length;
    if (numTeams === 0) {
      setMatches([]);
      return;
    }

    const rounds = Math.ceil(Math.log2(numTeams));
    const totalMatches = Math.pow(2, rounds) - 1;
    const newMatches: Match[] = [];

    // First round matches
    const firstRoundMatches = Math.ceil(numTeams / 2);
    for (let i = 0; i < firstRoundMatches; i++) {
      const team1 = participants[i * 2] || null;
      const team2 = participants[i * 2 + 1] || null;

      newMatches.push({
        id: `r1-m${i + 1}`,
        round: 1,
        matchNumber: i + 1,
        team1,
        team2,
        winner: null,
        score: { team1: 0, team2: 0 },
      });
    }

    // Generate subsequent rounds (empty initially)
    let matchId = firstRoundMatches;
    for (let round = 2; round <= rounds; round++) {
      const matchesInRound = Math.pow(2, rounds - round);
      for (let m = 0; m < matchesInRound; m++) {
        newMatches.push({
          id: `r${round}-m${m + 1}`,
          round,
          matchNumber: m + 1,
          team1: null,
          team2: null,
          winner: null,
          score: { team1: 0, team2: 0 },
        });
      }
    }

    setMatches(newMatches);
    if (onBracketUpdate) {
      onBracketUpdate(newMatches);
    }
  };

  const generateDoubleEliminationBracket = () => {
    // Similar to single elimination but with winners and losers bracket
    generateSingleEliminationBracket(); // For now, simplified
  };

  const generateRoundRobinMatches = () => {
    const newMatches: Match[] = [];
    let matchId = 0;

    // Every team plays every other team
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        newMatches.push({
          id: `match-${matchId++}`,
          round: 1,
          matchNumber: matchId,
          team1: participants[i],
          team2: participants[j],
          winner: null,
          score: { team1: 0, team2: 0 },
        });
      }
    }

    setMatches(newMatches);
    if (onBracketUpdate) {
      onBracketUpdate(newMatches);
    }
  };

  const handleDragStart = (participant: Participant) => {
    if (isEditable) {
      setDraggedTeam(participant);
    }
  };

  const handleDrop = (matchId: string, slot: 'team1' | 'team2') => {
    if (!isEditable || !draggedTeam) return;

    const updatedMatches = matches.map((match) => {
      if (match.id === matchId) {
        return {
          ...match,
          [slot]: draggedTeam,
        };
      }
      return match;
    });

    setMatches(updatedMatches);
    setDraggedTeam(null);

    if (onBracketUpdate) {
      onBracketUpdate(updatedMatches);
    }
  };

  const handleScoreChange = (matchId: string, team: 'team1' | 'team2', score: number) => {
    if (!isEditable) return;

    const updatedMatches = matches.map((match) => {
      if (match.id === matchId) {
        const newScore = { ...match.score, [team]: score };
        return {
          ...match,
          score: newScore,
        };
      }
      return match;
    });

    setMatches(updatedMatches);
    if (onBracketUpdate) {
      onBracketUpdate(updatedMatches);
    }
  };

  const setWinner = (matchId: string, participant: Participant) => {
    if (!isEditable) return;

    const updatedMatches = matches.map((match) => {
      if (match.id === matchId) {
        return { ...match, winner: participant };
      }
      return match;
    });

    setMatches(updatedMatches);
    if (onBracketUpdate) {
      onBracketUpdate(updatedMatches);
    }
  };

  const renderMatch = (match: Match) => {
    const team1Name = getTeamName(match.team1);
    const team1Tag = getTeamTag(match.team1);
    const team2Name = getTeamName(match.team2);
    const team2Tag = getTeamTag(match.team2);
    const winnerId = getTeamId(match.winner);
    const team1Id = getTeamId(match.team1);
    const team2Id = getTeamId(match.team2);

    return (
      <div
        key={match.id}
        className="bg-white/5 border border-white/20 rounded-lg p-4 min-w-[280px]"
        style={{ marginBottom: '16px' }}
      >
        <div className="text-gray-400 text-xs mb-2">
          Round {match.round} - Match {match.matchNumber}
        </div>

        {/* Team 1 */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg mb-2 ${
            winnerId && winnerId === team1Id
              ? 'bg-green-500/20 border border-green-500'
              : 'bg-white/5 border border-white/10'
          }`}
          draggable={isEditable}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(match.id, 'team1')}
        >
          {match.team1 ? (
            <>
              <div
                draggable={isEditable}
                onDragStart={() => handleDragStart(match.team1!)}
                className={isEditable ? 'cursor-move' : ''}
              >
                <div className="text-white font-semibold">{team1Name}</div>
                {team1Tag && <div className="text-gray-400 text-xs">[{team1Tag}]</div>}
              </div>
              {isEditable ? (
                <input
                  type="number"
                  value={match.score.team1}
                  onChange={(e) => handleScoreChange(match.id, 'team1', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-center"
                  min="0"
                />
              ) : (
                <span className="text-white font-bold text-lg">{match.score.team1}</span>
              )}
            </>
          ) : (
            <div className="text-gray-500 italic">Drop team here or TBD</div>
          )}
        </div>

        {/* Team 2 */}
        <div
          className={`flex items-center justify-between p-3 rounded-lg ${
            winnerId && winnerId === team2Id
              ? 'bg-green-500/20 border border-green-500'
              : 'bg-white/5 border border-white/10'
          }`}
          draggable={isEditable}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(match.id, 'team2')}
        >
          {match.team2 ? (
            <>
              <div
                draggable={isEditable}
                onDragStart={() => handleDragStart(match.team2!)}
                className={isEditable ? 'cursor-move' : ''}
              >
                <div className="text-white font-semibold">{team2Name}</div>
                {team2Tag && <div className="text-gray-400 text-xs">[{team2Tag}]</div>}
              </div>
              {isEditable ? (
                <input
                  type="number"
                  value={match.score.team2}
                  onChange={(e) => handleScoreChange(match.id, 'team2', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-center"
                  min="0"
                />
              ) : (
                <span className="text-white font-bold text-lg">{match.score.team2}</span>
              )}
            </>
          ) : (
            <div className="text-gray-500 italic">Drop team here or TBD</div>
          )}
        </div>

        {/* Declare Winner Button */}
        {isEditable && match.team1 && match.team2 && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setWinner(match.id, match.team1!)}
              className="flex-1 px-3 py-1 bg-green-500/20 border border-green-500 text-green-300 rounded text-sm hover:bg-green-500/30"
            >
              {team1Tag || team1Name} Wins
            </button>
            <button
              onClick={() => setWinner(match.id, match.team2!)}
              className="flex-1 px-3 py-1 bg-green-500/20 border border-green-500 text-green-300 rounded text-sm hover:bg-green-500/30"
            >
              {team2Tag || team2Name} Wins
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderBracketByRounds = () => {
    const rounds = Math.max(...matches.map((m) => m.round), 1);
    return (
      <div className="flex gap-8 overflow-x-auto pb-4">
        {Array.from({ length: rounds }, (_, i) => i + 1).map((round) => (
          <div key={round} className="flex flex-col">
            <h3 className="text-white font-semibold mb-4 text-center">
              {matchmakingType === 'round_robin' ? 'All Matches' : `Round ${round}`}
            </h3>
            <div className="flex flex-col gap-4">
              {matches
                .filter((m) => m.round === round)
                .map((match) => renderMatch(match))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (participants.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No teams registered yet. Brackets will be generated once teams register.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {renderBracketByRounds()}
    </div>
  );
};

export default TournamentBracket;

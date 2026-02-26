'use client';

import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Valorant from '@/components/icons/valorant';
import CS2 from '@/components/icons/cs2';
import Dota2 from '@/components/icons/dota2';
import PUBG from '@/components/icons/pubg';
import LOL from '@/components/icons/lol';
import FreeFire from '@/components/icons/freefire';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getGameIcon = (game: string) => {
  switch (game) {
    case 'Valorant': return <Valorant />;
    case 'CS2': return <CS2 />;
    case 'Dota 2': return <Dota2 />;
    case 'PUBG Mobile': return <PUBG />;
    case 'League of Legends': return <LOL />;
    case 'Free Fire': return <FreeFire />;
    default: return null;
  }
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const EsportsData: NextPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalOrganizations: 0,
    totalPlayers: 0,
    totalMatches: 0,
    totalPrizePool: 0,
    totalTournaments: 0,
    currency: 'NPR',
  });
  const [topOrganizations, setTopOrganizations] = useState<any[]>([]);
  const [topTeams, setTopTeams] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, orgsRes, teamsRes, playersRes] = await Promise.all([
          axios.get(`${API_URL}/api/stats/overview`),
          axios.get(`${API_URL}/api/org-auth/all`),
          axios.get(`${API_URL}/api/teams/`),
          axios.get(`${API_URL}/api/teams/players`),
        ]);

        // Stats
        setStats(statsRes.data.data);

        // Top Organizations (sorted by teams count, top 4)
        const orgs = orgsRes.data.data.organizations || [];
        const sortedOrgs = orgs
          .sort((a: any, b: any) => (b.teams?.length || 0) - (a.teams?.length || 0))
          .slice(0, 4)
          .map((org: any, i: number) => ({
            rank: i + 1,
            name: org.organizationName,
            tag: org.tag,
            teams: org.teams?.length || 0,
            championships: org.stats?.championships || 0,
            logo: org.logo || null,
            country: org.country,
          }));
        setTopOrganizations(sortedOrgs);

        // Top Teams (sorted by wins, top 5)
        const teams = teamsRes.data.data.teams || [];
        const sortedTeams = teams
          .sort((a: any, b: any) => (b.stats?.wins || 0) - (a.stats?.wins || 0))
          .slice(0, 5)
          .map((team: any, i: number) => ({
            rank: i + 1,
            name: team.name,
            tag: team.tag,
            game: team.game,
            logo: team.logo || null,
            orgName: team.organization?.organizationName || null,
            orgTag: team.organization?.tag || null,
            tournamentsPlayed: team.stats?.tournamentsPlayed || 0,
            wins: team.stats?.wins || 0,
          }));
        setTopTeams(sortedTeams);

        // Top Players (top 6)
        const players = playersRes.data.data.players || [];
        const topPlayerList = players.slice(0, 6).map((p: any, i: number) => ({
          rank: i + 1,
          name: p.playerName,
          team: p.team?.name || 'Free Agent',
          game: p.game,
          role: p.role || 'Player',
          inGameRole: p.inGameRole || '-',
        }));
        setTopPlayers(topPlayerList);
      } catch (error) {
        console.error('Error fetching esports data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-gradient text-white">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-400 text-xl">Loading esports data...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-gradient text-white">
      <Header />
      <main className="w-full px-6 py-8 lg:px-22">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto mb-6">
          <h1 className="text-4xl font-bold mb-2">Esports Data</h1>
          <p className="text-lg text-gray-300">
            Comprehensive statistics and rankings for teams, players, and organizations
          </p>
        </div>

        {/* Stats Overview */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <div className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mb-4"></div>
            <div className="text-2xl font-bold mb-1">{formatNumber(stats.totalTeams)}</div>
            <div className="text-sm text-gray-300">Total Teams</div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mb-4"></div>
            <div className="text-2xl font-bold mb-1">{formatNumber(stats.totalOrganizations)}</div>
            <div className="text-sm text-gray-300">Organizations</div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mb-4"></div>
            <div className="text-2xl font-bold mb-1">{formatNumber(stats.totalPlayers)}</div>
            <div className="text-sm text-gray-300">Active Players</div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mb-4"></div>
            <div className="text-2xl font-bold mb-1">{formatNumber(stats.totalMatches)}</div>
            <div className="text-sm text-gray-300">Matches Played</div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mb-4"></div>
            <div className="text-2xl font-bold mb-1">
              {stats.currency} {formatNumber(stats.totalPrizePool)}
            </div>
            <div className="text-sm text-gray-300">Total Prize Pool</div>
          </div>
        </div>

        {/* Organizations and Teams Section */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Top Organizations */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Top Organizations</h2>
            <div className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur-sm">
              {topOrganizations.length > 0 ? (
                topOrganizations.map((org) => (
                  <div
                    key={org.rank}
                    className="flex items-center justify-between py-4 border-b border-white/10 last:border-b-0"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm">
                        #{org.rank}
                      </div>
                      {org.logo ? (
                        <img src={org.logo} alt={org.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center text-xs font-bold">
                          {org.tag}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <div className="font-medium">{org.name}</div>
                        {org.country && (
                          <div className="text-xs text-gray-400">{org.country}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-xs">Teams</span>
                        <span>{org.teams}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-xs">Championships</span>
                        <span className="text-yellow-400">{org.championships}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-8">No organizations found</div>
              )}
            </div>
          </div>

          {/* Top Teams */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Top Teams</h2>
            <div className="bg-white/10 border border-white/20 rounded-xl p-5 backdrop-blur-sm">
              {topTeams.length > 0 ? (
                topTeams.map((team) => (
                  <div
                    key={team.rank}
                    className="flex items-center justify-between py-4 border-b border-white/10 last:border-b-0"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm">
                        #{team.rank}
                      </div>
                      {team.logo ? (
                        <img src={team.logo} alt={team.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-700 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                          {team.tag}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <div className="font-medium">{team.name}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <span className="w-4 h-4 flex items-center justify-center">{getGameIcon(team.game)}</span>
                          {team.game}
                          {team.orgName && (
                            <span className="ml-1 text-purple-400">| {team.orgName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-xs">Tournaments</span>
                        <span>{team.tournamentsPlayed}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-400 text-xs">Wins</span>
                        <span className="text-green-400">{team.wins}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-8">No teams found</div>
              )}
            </div>
          </div>
        </div>

        {/* Top Individual Performers */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Top Players</h2>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-xl overflow-hidden backdrop-blur-sm">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 px-5 py-4 border-b border-white/10 text-sm text-gray-400">
              <div className="col-span-2">Player</div>
              <div>Team</div>
              <div>Game</div>
              <div>Role</div>
              <div>In-Game Role</div>
            </div>

            {/* Table Body */}
            {topPlayers.length > 0 ? (
              topPlayers.map((player) => (
                <div
                  key={player.rank}
                  className="grid grid-cols-6 gap-4 px-5 py-4 border-b border-white/10 last:border-b-0 items-center hover:bg-white/5 transition-colors"
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm">
                      #{player.rank}
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-600 rounded-full"></div>
                    <span className="font-medium">{player.name}</span>
                  </div>
                  <div className="text-gray-300">{player.team}</div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <span className="w-4 h-4 flex items-center justify-center">{getGameIcon(player.game)}</span>
                    {player.game}
                  </div>
                  <div className="text-blue-400">{player.role}</div>
                  <div className="text-green-400">{player.inGameRole}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-8">No players found</div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EsportsData;

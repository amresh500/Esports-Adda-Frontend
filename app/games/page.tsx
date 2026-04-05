"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/LanguageContext";
import Valorant from "@/components/icons/valorant";
import CS2 from "@/components/icons/cs2";
import PUBG from "@/components/icons/pubg";
import Dota2 from "@/components/icons/dota2";
import LOL from "@/components/icons/lol";
import FreeFire from "@/components/icons/freefire";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const GAME_NAMES: Record<number, string> = {
  1: "Valorant",
  2: "CS2",
  3: "PUBG Mobile",
  4: "Dota 2",
  5: "League of Legends",
  6: "Free Fire",
};

export default function GamesPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedGame, setSelectedGame] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "teams" | "organizations" | "players"
  >("teams");
  const [teamsSearch, setTeamsSearch] = useState("");
  const [orgsSearch, setOrgsSearch] = useState("");
  const [playersSearch, setPlayersSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetchedTeams, setFetchedTeams] = useState<any[]>([]);
  const [fetchedOrgs, setFetchedOrgs] = useState<any[]>([]);
  const [fetchedPlayers, setFetchedPlayers] = useState<any[]>([]);
  const [gameCounts, setGameCounts] = useState<
    Record<number, { teams: number; players: number }>
  >({});

  const games = [
    {
      id: 1,
      name: "Valorant",
      color: "from-[#FF4655] to-[#D13639]",
      isNepal: true,
      icon: Valorant,
    },
    {
      id: 2,
      name: "CS2",
      color: "from-[#F89A1E] to-[#D97706]",
      isNepal: true,
      icon: CS2,
    },
    {
      id: 3,
      name: "PUBG Mobile",
      color: "from-[#FFB800] to-[#E09600]",
      isNepal: true,
      icon: PUBG,
    },
    {
      id: 4,
      name: "Dota 2",
      color: "from-[#D32636] to-[#A61F2B]",
      isNepal: true,
      icon: Dota2,
    },
    {
      id: 5,
      name: "League of Legends",
      color: "from-[#0BC6E3] to-[#0891A8]",
      isNepal: false,
      icon: LOL,
    },
    {
      id: 6,
      name: "Free Fire",
      color: "from-[#FF6B3D] to-[#E85428]",
      isNepal: true,
      icon: FreeFire,
    },
  ];

  // Fetch game counts on mount for sidebar
  useEffect(() => {
    const fetchGameCounts = async () => {
      try {
        // Try dedicated game-counts endpoint first
        const res = await axios.get(`${API_URL}/api/stats/game-counts`);
        const serverCounts = res.data.data.counts || {};

        const counts: Record<number, { teams: number; players: number }> = {};

        Object.entries(GAME_NAMES).forEach(([id, name]) => {
          const numId = Number(id);
          counts[numId] = {
            teams: serverCounts[name]?.teams || 0,
            players: serverCounts[name]?.players || 0,
          };
        });

        setGameCounts(counts);
      } catch {
        // Fallback: fetch from teams endpoint and count locally
        try {
          const [teamsRes, playersRes] = await Promise.allSettled([
            axios.get(`${API_URL}/api/teams/`),
            axios.get(`${API_URL}/api/teams/players`),
          ]);

          const allTeams =
            teamsRes.status === "fulfilled"
              ? teamsRes.value.data.data.teams || []
              : [];
          const allPlayers =
            playersRes.status === "fulfilled"
              ? playersRes.value.data.data.players || []
              : [];

          const counts: Record<number, { teams: number; players: number }> =
            {};

          Object.entries(GAME_NAMES).forEach(([id, name]) => {
            const numId = Number(id);
            counts[numId] = {
              teams: allTeams.filter((t: any) => t.game === name).length,
              players: allPlayers.filter((p: any) => p.game === name).length,
            };
          });

          setGameCounts(counts);
        } catch (fallbackError) {
          console.error("Error fetching game counts:", fallbackError);
        }
      }
    };

    fetchGameCounts();
  }, []);

  // Fetch game-specific data when selected game changes
  useEffect(() => {
    const gameName = GAME_NAMES[selectedGame];
    if (!gameName) return;

    const fetchGameData = async () => {
      setLoading(true);
      try {
        const [teamsResult, orgsResult, playersResult] =
          await Promise.allSettled([
            axios.get(
              `${API_URL}/api/teams/?game=${encodeURIComponent(gameName)}`
            ),
            axios.get(`${API_URL}/api/org-auth/all`),
            axios.get(
              `${API_URL}/api/teams/players?game=${encodeURIComponent(
                gameName
              )}`
            ),
          ]);

        // Teams
        if (teamsResult.status === "fulfilled") {
          const teams = (teamsResult.value.data.data.teams || []).map(
            (t: any, i: number) => {
              const gameRoster = t.games?.find(
                (g: any) => g.game === gameName
              );
              const playerCount = gameRoster?.roster?.length || 0;
              return {
                id: t._id,
                name: t.name,
                tag: t.tag,
                region: t.country || "Unknown",
                ranking: i + 1,
                players: playerCount,
                isNepal: t.isNepal || false,
                logo: t.logo || null,
                orgName: t.organization?.organizationName || null,
                orgTag: t.organization?.tag || null,
                wins: t.stats?.wins || 0,
                tournamentsPlayed: t.stats?.tournamentsPlayed || 0,
              };
            }
          );
          setFetchedTeams(teams);
        } else {
          console.error("Error fetching teams:", teamsResult.reason);
          setFetchedTeams([]);
        }

        // Organizations - filter to only those that have teams in this game
        if (orgsResult.status === "fulfilled") {
          const allOrgs =
            orgsResult.value.data.data.organizations || [];
          const gameOrgs = allOrgs
            .map((org: any) => {
              const gameTeams = (org.teams || []).filter(
                (t: any) => t.game === gameName
              );
              return {
                id: org._id,
                name: org.organizationName || org.tag || "Unknown",
                tag: org.tag,
                teams: gameTeams.length,
                teamNames: gameTeams.map((t: any) => t.name),
                totalTeams: org.teams?.length || 0,
                logo: org.logo || null,
                country: org.country,
                isNepal: org.isNepal || false,
              };
            })
            .filter((org: any) => org.teams > 0);
          setFetchedOrgs(gameOrgs);
        } else {
          console.error("Error fetching orgs:", orgsResult.reason);
          setFetchedOrgs([]);
        }

        // Players
        if (playersResult.status === "fulfilled") {
          const players = (
            playersResult.value.data.data.players || []
          ).map((p: any) => ({
            id: p.playerId,
            username: p.playerName,
            team: p.team?.name || "Free Agent",
            role: p.inGameRole || p.role || "Player",
            country: p.country || "Unknown",
            isNepal: p.isNepal || false,
          }));
          setFetchedPlayers(players);
        } else {
          console.error("Error fetching players:", playersResult.reason);
          setFetchedPlayers([]);
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [selectedGame]);

  const filteredTeams = fetchedTeams.filter((team) => {
    const search = teamsSearch.toLowerCase();
    return (
      team.name.toLowerCase().includes(search) ||
      (team.tag && team.tag.toLowerCase().includes(search)) ||
      team.region.toLowerCase().includes(search) ||
      (team.orgName && team.orgName.toLowerCase().includes(search))
    );
  });

  const filteredOrgs = fetchedOrgs.filter((org) => {
    const search = orgsSearch.toLowerCase();
    return (
      org.name?.toLowerCase().includes(search) ||
      (org.tag && org.tag.toLowerCase().includes(search)) ||
      (org.teamNames && org.teamNames.some((n: string) => n.toLowerCase().includes(search)))
    );
  });

  const filteredPlayers = fetchedPlayers.filter(
    (player) =>
      player.username.toLowerCase().includes(playersSearch.toLowerCase()) ||
      player.team.toLowerCase().includes(playersSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415]">
      <Header />

      {/* Hero Section */}
      <div className="px-4 sm:px-8 lg:px-20 py-6 sm:py-8">
        <h1 className="font-plus-jakarta text-2xl sm:text-4xl text-white mb-2">
          {t.games.title}
        </h1>
        <p className="font-plus-jakarta text-sm sm:text-lg text-white/70">
          Explore games, teams, organizations, and top players in the esports
          ecosystem
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 px-4 sm:px-8 lg:px-20 pb-8 lg:h-[calc(100vh-320px)]">
        {/* Left: Games List — horizontal scroll on mobile, vertical on desktop */}
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:w-80 lg:pr-3 pb-2 lg:pb-0">
          <p className="font-arial text-lg sm:text-xl text-white mb-2 flex-shrink-0">{t.tournaments.allGames}</p>
          {games.map((game) => {
            const GameIcon = game.icon;
            const counts = gameCounts[game.id];
            return (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border transition-all duration-300 text-left min-w-[160px] sm:min-w-[200px] lg:min-w-0 lg:w-full flex-shrink-0 ${
                  selectedGame === game.id
                    ? "border-white/40 bg-white/15"
                    : "border-white/20 hover:bg-white/15"
                }`}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${game.color} rounded-lg flex items-center justify-center`}
                  >
                    <GameIcon />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-arial text-lg text-white">
                        {game.name}
                      </p>
                      {game.isNepal && <span className="text-sm">&#127475;&#127477;</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-arial text-xs text-gray-400 mb-1">
                      Players
                    </p>
                    <p className="font-arial text-base text-white">
                      {counts?.players ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="font-arial text-xs text-gray-400 mb-1">
                      Teams
                    </p>
                    <p className="font-arial text-base text-white">
                      {counts?.teams ?? 0}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Game Details with Tabs */}
        <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-4 sm:p-6 flex flex-col overflow-hidden min-h-[400px] lg:min-h-0">
          {/* Tabs */}
          <div className="flex gap-2 mb-4 sm:mb-6 border-b border-white/10 pb-3 sm:pb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("teams")}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-arial text-sm sm:text-base transition-all flex-shrink-0 ${
                activeTab === "teams"
                  ? "bg-white/15 text-white border border-white/30"
                  : "bg-transparent text-gray-400 hover:text-white"
              }`}
            >
              Teams
            </button>
            <button
              onClick={() => setActiveTab("organizations")}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-arial text-sm sm:text-base transition-all flex-shrink-0 ${
                activeTab === "organizations"
                  ? "bg-white/15 text-white border border-white/30"
                  : "bg-transparent text-gray-400 hover:text-white"
              }`}
            >
              Organizations
            </button>
            <button
              onClick={() => setActiveTab("players")}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-arial text-sm sm:text-base transition-all flex-shrink-0 ${
                activeTab === "players"
                  ? "bg-white/15 text-white border border-white/30"
                  : "bg-transparent text-gray-400 hover:text-white"
              }`}
            >
              Players
            </button>

            {/* Community Hub button — navigates to the chat page */}
            <button
              onClick={() =>
                router.push(
                  `/games/${encodeURIComponent(
                    GAME_NAMES[selectedGame]
                  )}/community`
                )
              }
              className="ml-auto px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-arial text-sm sm:text-base bg-gradient-to-r from-[#FF4655] to-[#D13639] text-white hover:from-[#FF5566] hover:to-[#E14748] transition-all flex items-center gap-2 flex-shrink-0"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {t.games.community}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto pr-3">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-gray-400">Loading...</div>
              </div>
            ) : (
              <>
                {/* Teams Tab */}
                {activeTab === "teams" && (
                  <div className="flex flex-col gap-4">
                    {/* Search */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search teams..."
                        value={teamsSearch}
                        onChange={(e) => setTeamsSearch(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white font-arial text-sm placeholder-gray-400 focus:outline-none focus:border-white/40"
                      />
                      <svg
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="#9CA3AF"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    {/* Teams List */}
                    <div className="flex flex-col gap-3">
                      {filteredTeams.length > 0 ? (
                        filteredTeams.map((team) => (
                          <div
                            key={team.id}
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-6 text-center font-arial text-sm text-gray-500 flex-shrink-0">
                                  #{team.ranking}
                                </div>
                                {team.logo ? (
                                  <img
                                    src={team.logo}
                                    alt={team.name}
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#6C5CE7] to-[#5B4CDB] rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                    {team.tag}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-arial text-sm sm:text-base text-white font-semibold truncate">
                                      {team.name}
                                    </p>
                                    {team.tag && (
                                      <span className="font-arial text-xs text-gray-500">
                                        [{team.tag}]
                                      </span>
                                    )}
                                    {team.isNepal && (
                                      <span className="text-sm">&#127475;&#127477;</span>
                                    )}
                                  </div>
                                  <p className="font-arial text-xs text-gray-400 truncate">
                                    {team.region}
                                    {team.orgName && (
                                      <span className="text-purple-400">
                                        {' | '}{team.orgName}
                                        {team.orgTag && <span className="text-purple-500"> [{team.orgTag}]</span>}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-4 sm:gap-5 pl-9 sm:pl-0">
                                <div className="text-left sm:text-right">
                                  <p className="font-arial text-xs text-gray-400">
                                    Players
                                  </p>
                                  <p className="font-arial text-sm text-white">
                                    {team.players}
                                  </p>
                                </div>
                                <div className="text-left sm:text-right">
                                  <p className="font-arial text-xs text-gray-400">
                                    Tournaments
                                  </p>
                                  <p className="font-arial text-sm text-white">
                                    {team.tournamentsPlayed}
                                  </p>
                                </div>
                                <div className="text-left sm:text-right">
                                  <p className="font-arial text-xs text-gray-400">
                                    Wins
                                  </p>
                                  <p className="font-arial text-sm text-[#05DF72]">
                                    {team.wins}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-center py-8">
                          No teams found for this game
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Organizations Tab */}
                {activeTab === "organizations" && (
                  <div className="flex flex-col gap-4">
                    {/* Search */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search organizations..."
                        value={orgsSearch}
                        onChange={(e) => setOrgsSearch(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white font-arial text-sm placeholder-gray-400 focus:outline-none focus:border-white/40"
                      />
                      <svg
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="#9CA3AF"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    {/* Organizations List */}
                    <div className="flex flex-col gap-3">
                      {filteredOrgs.length > 0 ? (
                        filteredOrgs.map((org, idx) => (
                          <div
                            key={org.id}
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-6 text-center font-arial text-sm text-gray-500">
                                  #{idx + 1}
                                </div>
                                {org.logo ? (
                                  <img
                                    src={org.logo}
                                    alt={org.name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gradient-to-br from-[#FF8904] to-[#E67700] rounded-lg flex items-center justify-center text-xs font-bold text-white">
                                    {org.tag}
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-arial text-base text-white font-semibold">
                                      {org.name}
                                    </p>
                                    {org.tag && (
                                      <span className="font-arial text-xs text-gray-500">
                                        [{org.tag}]
                                      </span>
                                    )}
                                    {org.isNepal && (
                                      <span className="text-sm">&#127475;&#127477;</span>
                                    )}
                                  </div>
                                  <p className="font-arial text-xs text-gray-400">
                                    {org.country || 'Esports Organization'}
                                  </p>
                                  {org.teamNames && org.teamNames.length > 0 && (
                                    <p className="font-arial text-xs text-purple-400 mt-0.5">
                                      Teams: {org.teamNames.join(', ')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-5">
                                <div className="text-right">
                                  <p className="font-arial text-xs text-gray-400">
                                    In Game
                                  </p>
                                  <p className="font-arial text-sm text-white">
                                    {org.teams}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-arial text-xs text-gray-400">
                                    Total
                                  </p>
                                  <p className="font-arial text-sm text-gray-300">
                                    {org.totalTeams}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-center py-8">
                          No organizations found for this game
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Players Tab */}
                {activeTab === "players" && (
                  <div className="flex flex-col gap-4">
                    {/* Search */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search players..."
                        value={playersSearch}
                        onChange={(e) => setPlayersSearch(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white font-arial text-sm placeholder-gray-400 focus:outline-none focus:border-white/40"
                      />
                      <svg
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="#9CA3AF"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    {/* Players List */}
                    <div className="flex flex-col gap-3">
                      {filteredPlayers.length > 0 ? (
                        filteredPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B6B] to-[#EE5A6F] rounded-full" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-arial text-base text-white">
                                      {player.username}
                                    </p>
                                    {player.isNepal && (
                                      <span className="text-sm">&#127475;&#127477;</span>
                                    )}
                                  </div>
                                  <p className="font-arial text-xs text-gray-400">
                                    {player.role}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-4">
                                <div className="text-right">
                                  <p className="font-arial text-xs text-gray-400">
                                    Team
                                  </p>
                                  <p className="font-arial text-xs text-white">
                                    {player.team}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-arial text-xs text-gray-400">
                                    Country
                                  </p>
                                  <p className="font-arial text-xs text-[#05DF72]">
                                    {player.country}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-center py-8">
                          No players found for this game
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

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

  /* ── Search input shared style ── */
  const searchInputCls = "w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.10] rounded-[var(--radius-md)] text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#e85d5d]/50 focus:bg-white/[0.07] transition-all duration-200 pr-10";

  /* ── Row card shared style ── */
  const rowCardCls = "group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3.5 rounded-[var(--radius-md)] border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.13] transition-all duration-200 cursor-pointer";

  /* ── Stat cell ── */
  const StatCell = ({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) => (
    <div className="text-right min-w-[48px]">
      <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${accent ? "text-[#05DF72]" : "text-white/85"}`}>{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header />

      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <h1 className="font-['Russo_One'] text-2xl sm:text-4xl text-white mb-1">
          {t.games.title}
        </h1>
        <p className="text-white/45 text-sm sm:text-base">
          Explore games, teams, organizations, and top players in the esports ecosystem
        </p>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-5 px-4 sm:px-6 pb-10 lg:h-[calc(100vh-240px)]">

        {/* ── Left: Game selector ── */}
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:w-72 lg:flex-shrink-0 pb-1 lg:pb-0">
          <p className="font-['Russo_One'] text-xs text-white/40 uppercase tracking-widest mb-1 hidden lg:block">
            {t.tournaments.allGames}
          </p>

          {games.map((game) => {
            const GameIcon = game.icon;
            const counts   = gameCounts[game.id];
            const active   = selectedGame === game.id;
            return (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`text-left min-w-[160px] sm:min-w-[190px] lg:min-w-0 lg:w-full flex-shrink-0 p-3.5 rounded-[var(--radius-lg)] border transition-all duration-200 cursor-pointer ${
                  active
                    ? "border-[#e85d5d]/35 bg-[#e85d5d]/[0.08]"
                    : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.14]"
                }`}
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className={`w-10 h-10 bg-gradient-to-br ${game.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <GameIcon />
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${active ? "text-white" : "text-white/75"}`}>
                      {game.name}
                    </p>
                    {game.isNepal && <span className="text-xs flex-shrink-0">🇳🇵</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4 pl-[52px]">
                  <div>
                    <p className="text-[10px] text-white/35 uppercase tracking-wider">Players</p>
                    <p className="text-sm text-white/70 font-medium">{counts?.players ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/35 uppercase tracking-wider">Teams</p>
                    <p className="text-sm text-white/70 font-medium">{counts?.teams ?? 0}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Right: Content panel ── */}
        <div className="flex-1 card p-0 flex flex-col overflow-hidden min-h-[420px] lg:min-h-0">

          {/* Tab bar */}
          <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-white/[0.07] overflow-x-auto flex-shrink-0">
            {(["teams", "organizations", "players"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 flex-shrink-0 rounded-t-lg cursor-pointer capitalize relative ${
                  activeTab === tab
                    ? "text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e85d5d] rounded-t" />
                )}
              </button>
            ))}

            {/* Community button */}
            <button
              onClick={() => router.push(`/games/${encodeURIComponent(GAME_NAMES[selectedGame])}/community`)}
              className="ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#e85d5d]/10 border border-[#e85d5d]/25 text-[#e85d5d] hover:bg-[#e85d5d]/18 transition-all duration-200 flex-shrink-0 mb-2 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {t.games.community}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex flex-col gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton h-14 rounded-[var(--radius-md)]" />
                ))}
              </div>
            ) : (
              <>
                {/* ── Teams ── */}
                {activeTab === "teams" && (
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <input type="text" placeholder="Search teams..." value={teamsSearch}
                        onChange={(e) => setTeamsSearch(e.target.value)}
                        className={searchInputCls} />
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </div>

                    <div className="flex flex-col gap-2">
                      {filteredTeams.length > 0 ? filteredTeams.map((team) => (
                        <div key={team.id} className={rowCardCls}>
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="w-7 text-center text-xs text-white/25 flex-shrink-0 font-medium">
                              #{team.ranking}
                            </span>
                            {team.logo ? (
                              <img src={team.logo} alt={team.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-white/[0.08]" />
                            ) : (
                              <div className="w-9 h-9 bg-gradient-to-br from-[#6C5CE7] to-[#5B4CDB] rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                                {team.tag}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-sm text-white font-semibold truncate">{team.name}</span>
                                {team.tag && <span className="text-xs text-white/30">[{team.tag}]</span>}
                                {team.isNepal && <span className="text-xs">🇳🇵</span>}
                              </div>
                              <p className="text-xs text-white/35 truncate">
                                {team.region}
                                {team.orgName && <span className="text-purple-400/70"> · {team.orgName}{team.orgTag && ` [${team.orgTag}]`}</span>}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-4 pl-10 sm:pl-0">
                            <StatCell label="Players" value={team.players} />
                            <StatCell label="Events" value={team.tournamentsPlayed} />
                            <StatCell label="Wins" value={team.wins} accent />
                          </div>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center py-16 text-white/30">
                          <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          <p className="text-sm">No teams found for this game</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Organizations ── */}
                {activeTab === "organizations" && (
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <input type="text" placeholder="Search organizations..." value={orgsSearch}
                        onChange={(e) => setOrgsSearch(e.target.value)}
                        className={searchInputCls} />
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </div>

                    <div className="flex flex-col gap-2">
                      {filteredOrgs.length > 0 ? filteredOrgs.map((org, idx) => (
                        <div key={org.id} className={rowCardCls}>
                          <div className="flex items-center gap-3 flex-1">
                            <span className="w-7 text-center text-xs text-white/25 flex-shrink-0 font-medium">#{idx + 1}</span>
                            {org.logo ? (
                              <img src={org.logo} alt={org.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-white/[0.08]" />
                            ) : (
                              <div className="w-9 h-9 bg-gradient-to-br from-[#FF8904] to-[#E67700] rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                                {org.tag}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-sm text-white font-semibold">{org.name}</span>
                                {org.tag && <span className="text-xs text-white/30">[{org.tag}]</span>}
                                {org.isNepal && <span className="text-xs">🇳🇵</span>}
                              </div>
                              <p className="text-xs text-white/35">{org.country || "Esports Organization"}</p>
                              {org.teamNames?.length > 0 && (
                                <p className="text-xs text-purple-400/60 truncate">Teams: {org.teamNames.join(", ")}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <StatCell label="In Game" value={org.teams} />
                            <StatCell label="Total" value={org.totalTeams} />
                          </div>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center py-16 text-white/30">
                          <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/></svg>
                          <p className="text-sm">No organizations found for this game</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Players ── */}
                {activeTab === "players" && (
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <input type="text" placeholder="Search players..." value={playersSearch}
                        onChange={(e) => setPlayersSearch(e.target.value)}
                        className={searchInputCls} />
                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </div>

                    <div className="flex flex-col gap-2">
                      {filteredPlayers.length > 0 ? filteredPlayers.map((player) => (
                        <div key={player.id} className={rowCardCls}>
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-9 h-9 bg-gradient-to-br from-[#e85d5d]/30 to-[#441415] rounded-full border border-[#e85d5d]/20 flex items-center justify-center text-[10px] font-bold text-white/60 flex-shrink-0">
                              {player.username?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm text-white font-semibold truncate">{player.username}</span>
                                {player.isNepal && <span className="text-xs">🇳🇵</span>}
                              </div>
                              <p className="text-xs text-white/35">{player.role}</p>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <StatCell label="Team" value={player.team} />
                            <StatCell label="Country" value={player.country} accent />
                          </div>
                        </div>
                      )) : (
                        <div className="flex flex-col items-center py-16 text-white/30">
                          <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                          <p className="text-sm">No players found for this game</p>
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

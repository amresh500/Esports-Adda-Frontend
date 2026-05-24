"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import api from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/LanguageContext";

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

const EsportsData: NextPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeams: 0, totalOrganizations: 0, totalPlayers: 0,
    totalMatches: 0, totalPrizePool: 0, totalTournaments: 0, currency: "NPR",
  });
  const [topOrgs,     setTopOrgs]     = useState<any[]>([]);
  const [topTeams,    setTopTeams]    = useState<any[]>([]);
  const [topPlayers,  setTopPlayers]  = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/stats/overview"),
      api.get("/org-auth/all"),
      api.get("/teams/"),
      api.get("/teams/players"),
    ]).then(([statsRes, orgsRes, teamsRes, playersRes]) => {
      setStats(statsRes.data.data);

      const orgs = (orgsRes.data.data.organizations || [])
        .sort((a: any, b: any) => (b.teams?.length || 0) - (a.teams?.length || 0))
        .slice(0, 5)
        .map((o: any, i: number) => ({
          rank: i + 1,
          name: o.organizationName, tag: o.tag, logo: o.logo || null,
          country: o.country, teams: o.teams?.length || 0,
          championships: o.stats?.championships || 0,
        }));
      setTopOrgs(orgs);

      const teams = (teamsRes.data.data.teams || [])
        .sort((a: any, b: any) => (b.stats?.wins || 0) - (a.stats?.wins || 0))
        .slice(0, 6)
        .map((t: any, i: number) => ({
          rank: i + 1,
          name: t.name, tag: t.tag, game: t.game, logo: t.logo || null,
          orgName: t.organization?.organizationName || null,
          tournamentsPlayed: t.stats?.tournamentsPlayed || 0,
          wins: t.stats?.wins || 0,
        }));
      setTopTeams(teams);

      const players = (playersRes.data.data.players || [])
        .slice(0, 8)
        .map((p: any, i: number) => ({
          rank: i + 1,
          name: p.playerName, team: p.team?.name || "Free Agent",
          game: p.game, role: p.inGameRole || p.role || "Player",
        }));
      setTopPlayers(players);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  /* ── shared avatar placeholder ── */
  const Avatar = ({ name, tag, size = "sm" }: { name: string; tag?: string; size?: "sm" | "lg" }) => {
    const dim = size === "lg" ? "w-10 h-10 text-xs" : "w-8 h-8 text-[10px]";
    return (
      <div className={`${dim} rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center font-bold text-white/60 flex-shrink-0`}>
        {(tag || name)?.[0]?.toUpperCase()}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen">
      <Header />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#e85d5d]/30 border-t-[#e85d5d] animate-spin" />
          <p className="text-white/35 text-sm">{t.common.loading}</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Page title ── */}
        <div className="mb-8">
          <h1 className="font-['Russo_One'] text-3xl sm:text-4xl text-white mb-1">{t.esportsData.title}</h1>
          <p className="text-white/40 text-sm">{t.esportsData.subtitle}</p>
        </div>

        {/* ── Stats overview ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.08] mb-10">
          {[
            { label: t.common.teams,                   value: fmt(stats.totalTeams) },
            { label: t.home.stats.organizations,        value: fmt(stats.totalOrganizations) },
            { label: t.home.stats.activePlayers,        value: fmt(stats.totalPlayers) },
            { label: "Matches Played",                  value: fmt(stats.totalMatches) },
            { label: t.tournaments.totalPrizePool,      value: `${stats.currency} ${fmt(stats.totalPrizePool)}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#111111]/90 px-4 py-5 text-center">
              <p className="font-['Russo_One'] text-2xl text-[#e85d5d] mb-0.5">{value}</p>
              <p className="text-white/35 text-[11px] uppercase tracking-wider leading-snug">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Orgs + Teams ── */}
        <div className="grid lg:grid-cols-2 gap-5 mb-10">

          {/* Top Organizations */}
          <div>
            <h2 className="font-['Russo_One'] text-base text-white/80 uppercase tracking-widest mb-3">Top Organizations</h2>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              {topOrgs.length > 0 ? topOrgs.map((org, i) => (
                <div key={org.rank} className={`flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors ${i < topOrgs.length - 1 ? "border-b border-white/[0.05]" : ""}`}>
                  <span className="w-6 text-center text-xs text-white/25 font-medium flex-shrink-0">#{org.rank}</span>
                  {org.logo
                    ? <img src={org.logo} alt={org.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-white/[0.08]" />
                    : <Avatar name={org.name} tag={org.tag} />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-white/85 text-sm font-semibold truncate">{org.name}</p>
                    {org.country && <p className="text-white/30 text-xs">{org.country}</p>}
                  </div>
                  <div className="flex gap-5 text-right flex-shrink-0">
                    <div>
                      <p className="text-white/25 text-[10px] uppercase tracking-wider">Teams</p>
                      <p className="text-white/70 text-sm font-semibold">{org.teams}</p>
                    </div>
                    <div>
                      <p className="text-white/25 text-[10px] uppercase tracking-wider">Titles</p>
                      <p className="text-amber-400 text-sm font-semibold">{org.championships}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center py-12 text-white/25">
                  <p className="text-sm">No organizations yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Teams */}
          <div>
            <h2 className="font-['Russo_One'] text-base text-white/80 uppercase tracking-widest mb-3">{t.esportsData.topTeams}</h2>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              {topTeams.length > 0 ? topTeams.map((team, i) => (
                <div key={team.rank} className={`flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors ${i < topTeams.length - 1 ? "border-b border-white/[0.05]" : ""}`}>
                  <span className="w-6 text-center text-xs text-white/25 font-medium flex-shrink-0">#{team.rank}</span>
                  {team.logo
                    ? <img src={team.logo} alt={team.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-white/[0.08]" />
                    : <Avatar name={team.name} tag={team.tag} />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-white/85 text-sm font-semibold truncate">{team.name}{team.tag && <span className="text-white/30 font-normal"> [{team.tag}]</span>}</p>
                    <p className="text-white/30 text-xs">{team.game}{team.orgName && ` · ${team.orgName}`}</p>
                  </div>
                  <div className="flex gap-5 text-right flex-shrink-0">
                    <div>
                      <p className="text-white/25 text-[10px] uppercase tracking-wider">Events</p>
                      <p className="text-white/70 text-sm font-semibold">{team.tournamentsPlayed}</p>
                    </div>
                    <div>
                      <p className="text-white/25 text-[10px] uppercase tracking-wider">Wins</p>
                      <p className="text-emerald-400 text-sm font-semibold">{team.wins}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center py-12 text-white/25">
                  <p className="text-sm">No teams yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Top Players ── */}
        <div>
          <h2 className="font-['Russo_One'] text-base text-white/80 uppercase tracking-widest mb-3">{t.esportsData.topPlayers}</h2>
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            {/* Header row */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/[0.06] text-[11px] text-white/30 uppercase tracking-widest">
              <div className="col-span-1">#</div>
              <div className="col-span-4">{t.esportsData.player}</div>
              <div className="col-span-3">{t.esportsData.team}</div>
              <div className="col-span-2">{t.tournament.game}</div>
              <div className="col-span-2">Role</div>
            </div>

            {topPlayers.length > 0 ? topPlayers.map((p, i) => (
              <div key={p.rank}
                className={`flex sm:grid sm:grid-cols-12 items-center gap-3 sm:gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition-colors ${i < topPlayers.length - 1 ? "border-b border-white/[0.05]" : ""}`}>
                <span className="w-6 text-center text-xs text-white/25 font-medium flex-shrink-0 sm:col-span-1">#{p.rank}</span>
                <div className="flex items-center gap-2.5 flex-1 min-w-0 sm:col-span-4">
                  <div className="w-8 h-8 rounded-full bg-[#e85d5d]/10 border border-[#e85d5d]/20 flex items-center justify-center text-[10px] font-bold text-[#e85d5d]/80 flex-shrink-0">
                    {p.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-white/85 text-sm font-semibold truncate">{p.name}</span>
                </div>
                <span className="hidden sm:block text-white/45 text-sm truncate sm:col-span-3">{p.team}</span>
                <span className="hidden sm:block text-white/45 text-sm truncate sm:col-span-2">{p.game}</span>
                <span className="hidden sm:block text-sky-400/80 text-sm sm:col-span-2">{p.role}</span>
                {/* Mobile: show team + game inline */}
                <span className="sm:hidden text-white/35 text-xs truncate">{p.team} · {p.game}</span>
              </div>
            )) : (
              <div className="flex flex-col items-center py-14 text-white/25">
                <p className="text-sm">No player data yet</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default EsportsData;

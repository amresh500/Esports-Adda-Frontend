"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

type PerGame = Record<string, {
  matches: number; wins: number; losses: number; winRate: number; mvps: number;
  totalKills: number; totalDeaths: number; totalAssists: number; totalDamage: number;
  avgKills: number; avgDeaths: number; avgAssists: number; avgDamage: number;
  avgRating: number; kdRatio: number; kdaRatio: number;
}>;

type Recent = {
  _id: string;
  matchNumber: number;
  game: string;
  kills: number; deaths: number; assists: number; rating: number;
  isMVP: boolean; won: boolean;
  createdAt: string;
  tournament?: { _id: string; name: string } | null;
}[];

type GameDetail = {
  game: string;
  aggregate: PerGame[string];
  recent: Recent;
  averages: { avgKills: number; avgDeaths: number; avgAssists: number; avgDamage: number; avgRating: number };
};

const ACCENT = "#e85d5d";
const GAME_TINT: Record<string, string> = {
  "Valorant": "#FF4655", "CS2": "#F0A030", "PUBG Mobile": "#F5A623",
  "Dota 2": "#C23C2A", "League of Legends": "#0BC4E4", "Free Fire": "#FF6600",
  "Mobile Legends": "#1E90FF", "Apex Legends": "#DA292A", "Call of Duty": "#7CFC00",
  "Rainbow Six Siege": "#1C9BE6",
};

export default function PlayerStatsTab({ playerId }: { playerId: string }) {
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<string[]>([]);
  const [perGame, setPerGame] = useState<PerGame>({});
  const [recent, setRecent] = useState<Recent>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [detail, setDetail] = useState<GameDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!playerId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/stats/player/${playerId}`);
        if (cancelled) return;
        const d = res.data.data;
        setGames(d.games);
        setPerGame(d.perGame);
        setRecent(d.recent);
        if (d.games.length > 0) setSelectedGame(d.games[0]);
      } catch (err) {
        console.error("stats fetch error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [playerId]);

  useEffect(() => {
    if (!playerId || !selectedGame) return;
    let cancelled = false;
    setDetailLoading(true);
    (async () => {
      try {
        const res = await api.get(`/stats/player/${playerId}/game/${encodeURIComponent(selectedGame)}`);
        if (!cancelled) setDetail(res.data.data);
      } catch (err) {
        console.error("game detail error:", err);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [playerId, selectedGame]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#e85d5d]/30 border-t-[#e85d5d] animate-spin" />
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-12 text-center">
        <p className="text-white/35 text-sm mb-1">No match stats yet</p>
        <p className="text-white/25 text-xs">Compete in a tournament and your performance will appear here.</p>
      </div>
    );
  }

  const totalMatches = Object.values(perGame).reduce((acc, g) => acc + g.matches, 0);
  const totalWins   = Object.values(perGame).reduce((acc, g) => acc + g.wins, 0);
  const totalMVPs   = Object.values(perGame).reduce((acc, g) => acc + g.mvps, 0);
  const overallKD =
    Object.values(perGame).reduce((acc, g) => acc + g.totalKills, 0) /
    Math.max(1, Object.values(perGame).reduce((acc, g) => acc + g.totalDeaths, 0));

  // K/D bar chart data
  const kdData = games.map((g) => ({
    name: g.length > 12 ? g.slice(0, 12) + "…" : g,
    fullName: g,
    "K/D": perGame[g].kdRatio,
    fill: GAME_TINT[g] || ACCENT,
  }));

  // Win rate trend (from recent matches, ordered oldest first)
  const winTrendData = (detail?.recent || []).slice().reverse().map((m, i) => ({
    name: `M${i + 1}`,
    Rating: m.rating,
    Kills: m.kills,
    Deaths: m.deaths,
    won: m.won,
  }));

  // Radar — player vs game avg
  const radarData = detail ? [
    { stat: "Kills",   You: detail.aggregate.avgKills,   Average: detail.averages.avgKills   },
    { stat: "Assists", You: detail.aggregate.avgAssists, Average: detail.averages.avgAssists },
    { stat: "Rating",  You: detail.aggregate.avgRating,  Average: detail.averages.avgRating  },
    { stat: "Damage",  You: detail.aggregate.avgDamage / 100, Average: detail.averages.avgDamage / 100 },
    { stat: "Survival", You: Math.max(0, 10 - detail.aggregate.avgDeaths), Average: Math.max(0, 10 - detail.averages.avgDeaths) },
  ] : [];

  return (
    <div className="space-y-5">

      {/* Overall summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Total Matches" value={totalMatches.toString()} />
        <SummaryCard label="Wins" value={totalWins.toString()} accent="emerald" />
        <SummaryCard label="MVPs" value={totalMVPs.toString()} accent="amber" />
        <SummaryCard label="Overall K/D" value={overallKD.toFixed(2)} accent="red" />
      </div>

      {/* K/D bar chart by game */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h3 className="font-['Russo_One'] text-sm text-white/85">K/D Ratio per Game</h3>
        </div>
        <div className="p-5">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={kdData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} />
              <Tooltip
                cursor={{ fill: "rgba(232,93,93,0.05)" }}
                contentStyle={{ background: "#161618", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: 4 }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar dataKey="K/D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Game selector */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex flex-wrap items-center gap-3">
          <h3 className="font-['Russo_One'] text-sm text-white/85">Detailed Breakdown</h3>
          <div className="ml-auto flex gap-1 flex-wrap">
            {games.map((g) => {
              const tint = GAME_TINT[g] || ACCENT;
              const active = selectedGame === g;
              return (
                <button key={g} onClick={() => setSelectedGame(g)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${active ? "" : "hover:bg-white/[0.05]"}`}
                  style={active ? { background: `${tint}25`, borderColor: `${tint}50`, color: tint }
                                : { borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}>
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        {detailLoading || !detail ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-[#e85d5d]/30 border-t-[#e85d5d] animate-spin" />
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* Per-game KPIs */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              <KpiCell label="Matches"  value={detail.aggregate.matches.toString()} />
              <KpiCell label="Win Rate" value={`${detail.aggregate.winRate}%`} tint="emerald" />
              <KpiCell label="Avg K"    value={detail.aggregate.avgKills.toString()} />
              <KpiCell label="Avg D"    value={detail.aggregate.avgDeaths.toString()} />
              <KpiCell label="Avg A"    value={detail.aggregate.avgAssists.toString()} />
              <KpiCell label="Rating"   value={detail.aggregate.avgRating.toString()} tint="amber" />
            </div>

            {/* Two-column: trend + radar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-4">
                <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">Last {winTrendData.length} matches — Rating trend</p>
                {winTrendData.length === 0 ? (
                  <p className="text-white/25 text-xs py-8 text-center">No recent matches</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={winTrendData} margin={{ top: 5, right: 16, bottom: 5, left: -16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} domain={[0, 10]} />
                      <Tooltip
                        contentStyle={{ background: "#161618", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                      />
                      <Line type="monotone" dataKey="Rating" stroke={ACCENT} strokeWidth={2}
                        dot={{ fill: ACCENT, strokeWidth: 0, r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="rounded-lg border border-white/[0.05] bg-white/[0.015] p-4">
                <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">You vs Game Average</p>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData} outerRadius={80}>
                    <PolarGrid stroke="rgba(255,255,255,0.07)" />
                    <PolarAngleAxis dataKey="stat" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <PolarRadiusAxis stroke="rgba(255,255,255,0.15)" tick={false} axisLine={false} />
                    <Radar name="You" dataKey="You" stroke={ACCENT} fill={ACCENT} fillOpacity={0.35} strokeWidth={2} />
                    <Radar name="Average" dataKey="Average" stroke="rgba(255,255,255,0.5)" fill="rgba(255,255,255,0.5)" fillOpacity={0.1} strokeWidth={1.5} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }} />
                    <Tooltip
                      contentStyle={{ background: "#161618", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent matches table */}
      {recent.length > 0 && (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h3 className="font-['Russo_One'] text-sm text-white/85">Recent Matches</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02]">
                <tr className="text-white/35 text-[10px] uppercase tracking-widest">
                  <th className="text-left px-4 py-3 font-semibold">Tournament</th>
                  <th className="text-left px-3 py-3 font-semibold">Game</th>
                  <th className="text-center px-3 py-3 font-semibold">K</th>
                  <th className="text-center px-3 py-3 font-semibold">D</th>
                  <th className="text-center px-3 py-3 font-semibold">A</th>
                  <th className="text-center px-3 py-3 font-semibold">Rating</th>
                  <th className="text-center px-3 py-3 font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((m) => (
                  <tr key={m._id} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white/70 truncate max-w-[200px]">
                      {m.tournament?.name || "—"}
                      {m.isMVP && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">MVP</span>}
                    </td>
                    <td className="px-3 py-3 text-white/50 text-xs">{m.game}</td>
                    <td className="px-3 py-3 text-center text-white/80 tabular-nums">{m.kills}</td>
                    <td className="px-3 py-3 text-center text-white/80 tabular-nums">{m.deaths}</td>
                    <td className="px-3 py-3 text-center text-white/80 tabular-nums">{m.assists}</td>
                    <td className="px-3 py-3 text-center text-[#e85d5d] font-semibold tabular-nums">{m.rating.toFixed(1)}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${m.won ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-white/[0.04] text-white/40 border-white/10"}`}>
                        {m.won ? "WIN" : "LOSS"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: "emerald" | "amber" | "red" }) {
  const colorCls =
    accent === "emerald" ? "text-emerald-400" :
    accent === "amber"   ? "text-amber-400" :
    accent === "red"     ? "text-[#e85d5d]" : "text-white";
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-4">
      <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-1.5">{label}</p>
      <p className={`font-['Russo_One'] text-2xl ${colorCls} tabular-nums`}>{value}</p>
    </div>
  );
}

function KpiCell({ label, value, tint }: { label: string; value: string; tint?: "emerald" | "amber" }) {
  const colorCls =
    tint === "emerald" ? "text-emerald-400" :
    tint === "amber"   ? "text-amber-400" : "text-white/90";
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-3 text-center">
      <p className="text-white/30 text-[9px] uppercase tracking-widest font-semibold mb-1">{label}</p>
      <p className={`font-['Russo_One'] text-base ${colorCls} tabular-nums leading-none`}>{value}</p>
    </div>
  );
}

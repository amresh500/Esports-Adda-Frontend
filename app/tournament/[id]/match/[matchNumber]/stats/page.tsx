"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToastContainer from "@/components/ToastContainer";
import { useToast } from "@/hooks/useToast";

type RosterRow = {
  playerId: string;
  playerUsername: string;
  teamId: string;
  teamName: string;
  side: "p1" | "p2";
  existing: null | {
    kills: number; deaths: number; assists: number;
    damageDealt: number; rating: number; isMVP: boolean; won: boolean;
  };
};

type MatchPayload = {
  game: string;
  match: {
    matchNumber: number;
    status: string;
    participant1: { teamId: string; teamName: string; won: boolean };
    participant2: { teamId: string; teamName: string; won: boolean };
    roster: RosterRow[];
  };
};

type StatRow = {
  playerId: string;
  playerUsername: string;
  teamId: string;
  teamName: string;
  side: "p1" | "p2";
  won: boolean;
  kills: number; deaths: number; assists: number;
  damageDealt: number; rating: number; isMVP: boolean;
};

export default function MatchStatsEntryPage() {
  const params = useParams();
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const tournamentId = params.id as string;
  const matchNumber = params.matchNumber as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<MatchPayload | null>(null);
  const [rows, setRows] = useState<StatRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/tournaments/${tournamentId}/matches/${matchNumber}/players`);
        if (cancelled) return;
        const payload: MatchPayload = res.data.data;
        setData(payload);
        setRows(payload.match.roster.map((r) => ({
          playerId: r.playerId,
          playerUsername: r.playerUsername,
          teamId: r.teamId,
          teamName: r.teamName,
          side: r.side,
          won: r.side === "p1" ? payload.match.participant1.won : payload.match.participant2.won,
          kills:       r.existing?.kills       ?? 0,
          deaths:      r.existing?.deaths      ?? 0,
          assists:     r.existing?.assists     ?? 0,
          damageDealt: r.existing?.damageDealt ?? 0,
          rating:      r.existing?.rating      ?? 0,
          isMVP:       r.existing?.isMVP       ?? false,
        })));
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load match");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tournamentId, matchNumber]);

  const updateRow = (idx: number, patch: Partial<StatRow>) => {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      // Only one MVP allowed
      if (patch.isMVP === true) {
        next.forEach((r, i) => { if (i !== idx) r.isMVP = false; });
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (rows.length === 0) {
      showError("No players to submit stats for");
      return;
    }
    setSaving(true);
    try {
      await api.post(`/tournaments/${tournamentId}/matches/${matchNumber}/stats`, {
        stats: rows.map((r) => ({
          playerId: r.playerId,
          playerUsername: r.playerUsername,
          teamId: r.teamId,
          teamName: r.teamName,
          kills: r.kills,
          deaths: r.deaths,
          assists: r.assists,
          damageDealt: r.damageDealt,
          rating: r.rating,
          isMVP: r.isMVP,
          won: r.won,
        })),
      });
      showSuccess("Stats saved successfully");
      setTimeout(() => router.push(`/tournament/${tournamentId}/manage`), 800);
    } catch (err: any) {
      showError(err.response?.data?.message || "Failed to save stats");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #111111 0%, #110a0a 100%)" }}>
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 rounded-full border-2 border-[#e85d5d]/30 border-t-[#e85d5d] animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #111111 0%, #110a0a 100%)" }}>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-red-400 text-lg">{error || "Match not found"}</p>
          <button onClick={() => router.push(`/tournament/${tournamentId}/manage`)} className="btn-ghost px-6 py-3 text-sm cursor-pointer">
            Go Back
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const groupedBySide = (side: "p1" | "p2") => rows.map((r, i) => ({ row: r, idx: i })).filter((x) => x.row.side === side);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #111111 0%, #110a0a 100%)" }}>
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <button onClick={() => router.push(`/tournament/${tournamentId}/manage`)}
          className="mb-6 flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm cursor-pointer group">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Manage
        </button>

        {/* Header card */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 mb-6">
          <p className="text-[#e85d5d] text-[11px] font-bold uppercase tracking-[0.18em] mb-2">Match Stats Entry</p>
          <h1 className="font-['Russo_One'] text-2xl text-white mb-1">Match #{data.match.matchNumber} · {data.game}</h1>
          <p className="text-white/45 text-sm">
            <span className={data.match.participant1.won ? "text-emerald-400 font-semibold" : "text-white/60"}>
              {data.match.participant1.teamName}
            </span>
            <span className="mx-3 text-white/30">vs</span>
            <span className={data.match.participant2.won ? "text-emerald-400 font-semibold" : "text-white/60"}>
              {data.match.participant2.teamName}
            </span>
          </p>
        </div>

        {(["p1", "p2"] as const).map((side) => {
          const teamName = side === "p1" ? data.match.participant1.teamName : data.match.participant2.teamName;
          const won = side === "p1" ? data.match.participant1.won : data.match.participant2.won;
          const sideRows = groupedBySide(side);
          if (sideRows.length === 0) return null;
          return (
            <div key={side} className="mb-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
              <div className={`px-5 py-3 border-b border-white/[0.06] flex items-center justify-between ${won ? "bg-emerald-500/[0.06]" : ""}`}>
                <h2 className="font-['Russo_One'] text-sm text-white">{teamName}</h2>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${won ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-white/[0.05] text-white/50 border border-white/10"}`}>
                  {won ? "WINNER" : "LOSER"}
                </span>
              </div>
              <div className="p-4 space-y-3">
                {sideRows.map(({ row, idx }) => (
                  <div key={row.playerId} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-[#e85d5d]/15 border border-[#e85d5d]/30 flex items-center justify-center text-[#e85d5d] text-xs font-bold flex-shrink-0">
                          {row.playerUsername?.[0]?.toUpperCase() || "?"}
                        </span>
                        <p className="text-white/85 text-sm font-semibold truncate">{row.playerUsername}</p>
                      </div>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <input type="checkbox" checked={row.isMVP}
                          onChange={(e) => updateRow(idx, { isMVP: e.target.checked })}
                          className="accent-[#e85d5d]" />
                        <span className={row.isMVP ? "text-[#e85d5d] font-bold" : "text-white/50"}>MVP</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <StatField label="Kills"   value={row.kills}       onChange={(v) => updateRow(idx, { kills: v })} />
                      <StatField label="Deaths"  value={row.deaths}      onChange={(v) => updateRow(idx, { deaths: v })} />
                      <StatField label="Assists" value={row.assists}     onChange={(v) => updateRow(idx, { assists: v })} />
                      <StatField label="Damage"  value={row.damageDealt} onChange={(v) => updateRow(idx, { damageDealt: v })} step={100} />
                      <StatField label="Rating"  value={row.rating}      onChange={(v) => updateRow(idx, { rating: v })} step={0.1} max={10} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Submit footer */}
        <div className="sticky bottom-4 mt-8 rounded-2xl border border-[#e85d5d]/20 bg-[#161618]/95 backdrop-blur-md px-5 py-4 flex items-center justify-between gap-4 shadow-2xl">
          <p className="text-white/50 text-sm">
            <span className="text-white font-semibold">{rows.length}</span> player{rows.length === 1 ? "" : "s"} · 1 MVP allowed
          </p>
          <button onClick={handleSubmit} disabled={saving}
            className="btn-brand px-6 py-2.5 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
            {saving ? "Saving…" : "Save Stats"}
          </button>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Footer />
    </div>
  );
}

function StatField({ label, value, onChange, step = 1, max }: {
  label: string; value: number; onChange: (v: number) => void; step?: number; max?: number;
}) {
  return (
    <div>
      <label className="block text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-1">{label}</label>
      <input
        type="number"
        min={0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          onChange(Number.isFinite(n) ? n : 0);
        }}
        className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] focus:border-[#e85d5d]/40 focus:bg-white/[0.06] outline-none text-white text-sm font-semibold tabular-nums transition-colors"
      />
    </div>
  );
}

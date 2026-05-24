'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TournamentBracket from '@/components/TournamentBracket';
import { useLanguage } from '@/lib/LanguageContext';


/* ── Per-game visual config ─────────────────────────────────────── */
const GAME_VISUALS: Record<string, {
  accent: string; glow: string; bg: string; border: string;
  heroImg: string; logoImg: string; particles: string[];
}> = {
  'Valorant': {
    accent: '#FF4655', glow: 'rgba(255,70,85,0.35)', bg: 'rgba(255,70,85,0.08)', border: 'rgba(255,70,85,0.25)',
    heroImg: 'https://cdn.akamai.steamstatic.com/apps/dota2/images/dota_react/backgrounds/greyfull.jpg',
    logoImg: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Valorant_logo_-_pink_color_version.svg',
    particles: ['▲','◆','✦','▸'],
  },
  'CS2': {
    accent: '#F0A030', glow: 'rgba(240,160,48,0.35)', bg: 'rgba(240,160,48,0.08)', border: 'rgba(240,160,48,0.25)',
    heroImg: 'https://cdn.akamai.steamstatic.com/steam/apps/730/library_hero.jpg',
    logoImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Counter-Strike_Global_Offensive_logo.svg/512px-Counter-Strike_Global_Offensive_logo.svg.png',
    particles: ['⬡','◈','✦','▸'],
  },
  'PUBG Mobile': {
    accent: '#F5A623', glow: 'rgba(245,166,35,0.35)', bg: 'rgba(245,166,35,0.08)', border: 'rgba(245,166,35,0.25)',
    heroImg: 'https://cdn.akamai.steamstatic.com/steam/apps/578080/library_hero.jpg',
    logoImg: '',
    particles: ['◉','▲','✦','●'],
  },
  'Dota 2': {
    accent: '#C23C2A', glow: 'rgba(194,60,42,0.35)', bg: 'rgba(194,60,42,0.08)', border: 'rgba(194,60,42,0.25)',
    heroImg: 'https://cdn.akamai.steamstatic.com/apps/dota2/images/dota_react/backgrounds/greyfull.jpg',
    logoImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Dota_2_Logo.png/480px-Dota_2_Logo.png',
    particles: ['✦','◆','▲','⬟'],
  },
  'League of Legends': {
    accent: '#0BC4E4', glow: 'rgba(11,196,228,0.35)', bg: 'rgba(11,196,228,0.08)', border: 'rgba(11,196,228,0.25)',
    heroImg: 'https://cdn.akamai.steamstatic.com/steam/apps/359550/library_hero.jpg',
    logoImg: '',
    particles: ['✦','◈','⬡','▸'],
  },
  'Free Fire': {
    accent: '#FF6600', glow: 'rgba(255,102,0,0.35)', bg: 'rgba(255,102,0,0.08)', border: 'rgba(255,102,0,0.25)',
    heroImg: 'https://cdn.akamai.steamstatic.com/steam/apps/578080/library_hero.jpg',
    logoImg: '',
    particles: ['▲','◉','✦','▸'],
  },
  'Mobile Legends': {
    accent: '#1E90FF', glow: 'rgba(30,144,255,0.35)', bg: 'rgba(30,144,255,0.08)', border: 'rgba(30,144,255,0.25)',
    heroImg: 'https://cdn.akamai.steamstatic.com/steam/apps/359550/library_hero.jpg',
    logoImg: '',
    particles: ['◆','✦','▸','⬡'],
  },
  'Apex Legends': {
    accent: '#DA292A', glow: 'rgba(218,41,42,0.35)', bg: 'rgba(218,41,42,0.08)', border: 'rgba(218,41,42,0.25)',
    heroImg: 'https://cdn.akamai.steamstatic.com/steam/apps/1172470/library_hero.jpg',
    logoImg: '',
    particles: ['▲','◆','✦','●'],
  },
  'Call of Duty': {
    accent: '#7CFC00', glow: 'rgba(124,252,0,0.35)', bg: 'rgba(124,252,0,0.08)', border: 'rgba(124,252,0,0.25)',
    heroImg: 'https://cdn.akamai.steamstatic.com/steam/apps/1938090/library_hero.jpg',
    logoImg: '',
    particles: ['◉','▲','✦','▸'],
  },
  'Rainbow Six Siege': {
    accent: '#1C9BE6', glow: 'rgba(28,155,230,0.35)', bg: 'rgba(28,155,230,0.08)', border: 'rgba(28,155,230,0.25)',
    heroImg: 'https://cdn.akamai.steamstatic.com/steam/apps/359550/library_hero.jpg',
    logoImg: '',
    particles: ['◈','✦','▸','⬡'],
  },
};

const defaultVisuals = {
  accent: '#e85d5d', glow: 'rgba(232,93,93,0.35)', bg: 'rgba(232,93,93,0.08)', border: 'rgba(232,93,93,0.25)',
  heroImg: '', logoImg: '',
  particles: ['✦','◆','▲','◉'],
};

function getVisuals(game: string) { return GAME_VISUALS[game] ?? defaultVisuals; }

/* ── Floating particle component ────────────────────────────────── */
function Particles({ color, symbols }: { color: string; symbols: string[] }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 18 }).map((_, i) => {
        const symbol = symbols[i % symbols.length];
        const size = 10 + (i % 5) * 4;
        const left = (i * 37 + 11) % 100;
        const delay = (i * 0.4) % 6;
        const dur = 8 + (i % 5) * 2;
        const opacity = 0.06 + (i % 4) * 0.04;
        return (
          <span key={i} className="absolute select-none animate-float"
            style={{
              left: `${left}%`, bottom: '-20px', fontSize: `${size}px`,
              color, opacity,
              animationDuration: `${dur}s`, animationDelay: `${delay}s`,
              animationName: `floatUp`,
            }}>
            {symbol}
          </span>
        );
      })}
    </div>
  );
}

/* ── Status config ──────────────────────────────────────────────── */
const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  draft:                { label: 'Draft',               color: 'text-white/40',   dot: 'bg-white/30' },
  registration_open:    { label: 'Registration Open',   color: 'text-emerald-400', dot: 'bg-emerald-400' },
  registration_closed:  { label: 'Reg. Closed',         color: 'text-amber-400',  dot: 'bg-amber-400' },
  ongoing:              { label: 'Live',                 color: 'text-[#e85d5d]',  dot: 'bg-[#e85d5d] animate-pulse' },
  completed:            { label: 'Completed',            color: 'text-sky-400',    dot: 'bg-sky-400' },
  cancelled:            { label: 'Cancelled',            color: 'text-white/30',   dot: 'bg-white/20' },
  overdue:              { label: 'Overdue',              color: 'text-orange-400', dot: 'bg-orange-400' },
};

export default function TournamentDetailsPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tournamentId = params.id;
  const fromPage = searchParams.get('from');
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  const handleBack = () => router.push(fromPage === 'org-profile' ? '/org-profile' : '/tournaments');

  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOrganizer, setIsOrganizer] = useState(false);

  /* parallax scroll */
  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetchTournamentDetails();
    checkUserPermissions();
  }, [tournamentId]);

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

  const getRegistrationStatus = () => {
    if (!tournament) return { status: 'unknown', label: 'Unknown', color: 'gray' };
    const now = new Date();
    if (now < new Date(tournament.registrationStartDate)) return { status: 'not_started', label: 'Registration Not Started', color: 'yellow' };
    if (now > new Date(tournament.registrationEndDate))   return { status: 'closed',      label: 'Registration Closed',      color: 'red' };
    return { status: 'open', label: 'Registration Open', color: 'green' };
  };

  const checkUserPermissions = async () => {
    try {
      if (localStorage.getItem('accountType') !== 'organization') { setIsOrganizer(false); return; }
      const response = await api.get(`/org-auth/me`);
      const orgId = response.data.data.organization._id;
      const tr = await api.get(`/tournaments/${tournamentId}`);
      setIsOrganizer(tr.data.data.tournament.organizer === orgId);
    } catch { setIsOrganizer(false); }
  };

  const handleBracketUpdate = async (matches: any[]) => {
    try {
      await api.patch(`/tournaments/${tournamentId}/bracket`, { matches });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save bracket changes');
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #111111 0%, #110a0a 100%)' }}>
      <Header />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#e85d5d]/30 border-t-[#e85d5d] animate-spin" />
          <p className="text-white/35 text-sm">Loading tournament…</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (error || !tournament) return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #111111 0%, #110a0a 100%)' }}>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-400 text-lg">{error || 'Tournament not found'}</p>
        <button onClick={handleBack} className="btn-ghost px-6 py-3 text-sm cursor-pointer">Go Back</button>
      </div>
      <Footer />
    </div>
  );

  const gameName = tournament.game === 'Other' ? (tournament.customGame || 'Other') : tournament.game;
  const v = getVisuals(gameName);
  const statusCfg = STATUS_CONFIG[tournament.status] ?? { label: tournament.status, color: 'text-white/50', dot: 'bg-white/30' };
  const regStatus = getRegistrationStatus();
  const fillPct = tournament.totalSlots > 0
    ? Math.round((tournament.participants?.length || 0) / tournament.totalSlots * 100)
    : 0;
  const parallaxOffset = mounted ? scrollY * 0.35 : 0;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #111111 0%, #110a0a 100%)' }}>
      <Header />

      {/* ═══════════════════════════════════════════════════════════
          HERO BANNER — parallax background + particles + scanlines
      ═══════════════════════════════════════════════════════════ */}
      <div ref={heroRef} className="relative overflow-hidden" style={{ minHeight: '480px' }}>

        {/* Parallax BG image */}
        {v.heroImg && (
          <div className="absolute inset-0" style={{ transform: `translateY(${parallaxOffset}px)`, willChange: 'transform' }}>
            <div className="absolute inset-0 scale-110"
              style={{
                backgroundImage: `url(${v.heroImg})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'blur(2px) brightness(0.18) saturate(1.4)',
              }} />
          </div>
        )}

        {/* Dark overlay gradient */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(135deg, #0d0d0d 0%, rgba(13,13,13,0.7) 40%, ${v.accent}12 100%)`
        }} />

        {/* Scanline texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)', backgroundSize: '100% 3px' }} />

        {/* Animated grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: `linear-gradient(${v.accent}08 1px,transparent 1px),linear-gradient(90deg,${v.accent}08 1px,transparent 1px)`, backgroundSize: '60px 60px' }} />

        {/* Radial glow */}
        <div className="absolute top-0 right-0 w-[700px] h-[500px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top right, ${v.glow} 0%, transparent 65%)`, opacity: 0.5 }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse at bottom left, ${v.glow} 0%, transparent 70%)`, opacity: 0.25 }} />

        {/* Floating particles */}
        <Particles color={v.accent} symbols={v.particles} />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${v.accent} 30%, ${v.accent} 70%, transparent 100%)` }} />

        {/* Bottom fade into page */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #0d0d0d)' }} />

        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20">

          {/* Back */}
          <button onClick={handleBack}
            className="mb-8 flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm cursor-pointer group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {fromPage === 'org-profile' ? 'Profile' : 'Tournaments'}
          </button>

          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-8">

            {/* ── Game art thumbnail ── */}
            <div className="relative flex-shrink-0 hidden sm:block">
              <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-2xl overflow-hidden border-2 shadow-2xl"
                style={{ borderColor: `${v.accent}50`, boxShadow: `0 0 40px ${v.glow}, 0 20px 60px rgba(0,0,0,0.6)` }}>
                {v.heroImg ? (
                  <img src={v.heroImg} alt={gameName} className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.85) saturate(1.3)' }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-['Russo_One'] text-5xl"
                    style={{ background: `linear-gradient(135deg, ${v.accent}25, ${v.accent}08)`, color: v.accent }}>
                    {gameName.charAt(0)}
                  </div>
                )}
                {/* Shine sweep */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: `linear-gradient(135deg, ${v.accent}20 0%, transparent 50%, rgba(255,255,255,0.06) 100%)` }} />
              </div>
              {/* Animated ring */}
              <div className="absolute -inset-2 rounded-2xl border opacity-30 animate-pulse"
                style={{ borderColor: v.accent }} />
            </div>

            {/* ── Title block ── */}
            <div className="flex-1 min-w-0">
              {/* Game pill */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest border"
                  style={{ color: v.accent, background: v.bg, borderColor: v.border }}>
                  {gameName}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.10] text-white/50">
                  {tournament.matchmakingType.replace(/_/g, ' ').toUpperCase()}
                </span>
                {/* Live status badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-white/[0.08] ${statusCfg.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                  {statusCfg.label}
                </span>
              </div>

              <h1 className="font-['Russo_One'] text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-3"
                style={{ textShadow: `0 0 60px ${v.glow}` }}>
                {tournament.name}
              </h1>

              <p className="text-white/40 text-sm">
                Organized by <span className="text-white/70 font-semibold">{tournament.organizerName || 'Unknown'}</span>
                {tournament.requirements?.isNepalOnly && (
                  <span className="ml-3 text-amber-400/80">🇳🇵 Nepal Only</span>
                )}
              </p>

              {/* Organizer actions */}
              {isOrganizer && (
                <div className="flex gap-2 flex-wrap mt-4">
                  <button onClick={() => router.push(`/tournament/${tournamentId}/manage`)}
                    className="btn-brand px-4 py-2 text-sm cursor-pointer">
                    Manage Tournament
                  </button>
                  <button onClick={() => router.push(`/tournament/${tournamentId}/edit`)}
                    className="btn-ghost px-4 py-2 text-sm cursor-pointer">
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* ── Prize pool callout ── */}
            {(tournament.prizePool?.amount > 0) && (
              <div className="flex-shrink-0 text-center px-6 py-4 rounded-2xl border"
                style={{ background: `linear-gradient(135deg, ${v.accent}15, ${v.accent}05)`, borderColor: `${v.accent}30`,
                  boxShadow: `0 0 30px ${v.glow}` }}>
                <p className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: v.accent }}>Prize Pool</p>
                <p className="font-['Russo_One'] text-3xl text-white leading-none">
                  NPR {tournament.prizePool.amount.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CONTENT
      ═══════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-6">

        {/* ── Winner banner ── */}
        {tournament.status === 'completed' && tournament.winner?.teamName && (
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/30"
            style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.10) 0%, rgba(245,158,11,0.05) 100%)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(251,191,36,0.03) 0px, rgba(251,191,36,0.03) 1px, transparent 1px, transparent 12px)' }} />
            <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
                  style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
                  🏆
                </div>
                <div>
                  <p className="text-amber-400/70 text-[11px] font-bold uppercase tracking-[0.18em] mb-1">{t.tournament.champion}</p>
                  <p className="font-['Russo_One'] text-3xl text-white">{tournament.winner.teamName}</p>
                </div>
              </div>
              {tournament.runnerUp?.teamName && (
                <div className="flex items-center gap-4 opacity-80">
                  <span className="text-3xl">🥈</span>
                  <div>
                    <p className="text-white/40 text-[11px] uppercase tracking-widest mb-0.5">{t.tournament.runnerUp}</p>
                    <p className="font-['Russo_One'] text-xl text-white/80">{tournament.runnerUp.teamName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px rounded-2xl overflow-hidden border border-white/[0.06]">
          {/* Registration status */}
          <StatCard
            label="Registration"
            accent={v.accent}
            content={
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  regStatus.color === 'green' ? 'bg-emerald-400 animate-pulse' :
                  regStatus.color === 'red'   ? 'bg-red-400' : 'bg-amber-400'}`} />
                <span className={`text-sm font-semibold ${
                  regStatus.color === 'green' ? 'text-emerald-400' :
                  regStatus.color === 'red'   ? 'text-red-400' : 'text-amber-400'}`}>
                  {regStatus.label}
                </span>
              </div>
            }
          />
          {/* Slots */}
          <StatCard label={t.tournaments.registered} accent={v.accent}
            content={
              <div>
                <p className="font-['Russo_One'] text-2xl text-white leading-none mt-1">
                  {tournament.participants?.length || 0}
                  <span className="text-white/30 text-base font-sans">/{tournament.totalSlots}</span>
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${fillPct}%`, background: v.accent }} />
                </div>
              </div>
            }
          />
          {/* Prize */}
          <StatCard label={t.tournament.prizePool} accent={v.accent}
            content={
              <p className="font-['Russo_One'] text-xl text-white leading-none mt-1">
                {tournament.prizePool?.amount > 0 ? `NPR ${tournament.prizePool.amount.toLocaleString()}` : '—'}
              </p>
            }
          />
          {/* Team size */}
          <StatCard label={t.tournament.teamSize} accent={v.accent}
            content={<p className="font-['Russo_One'] text-2xl text-white leading-none mt-1">{tournament.teamSize}v{tournament.teamSize}</p>}
          />
          {/* Start date */}
          <StatCard label="Starts" accent={v.accent}
            content={
              <p className="font-['Russo_One'] text-lg text-white leading-none mt-1">
                {new Date(tournament.tournamentStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            }
          />
        </div>

        {/* ── Two-column info ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Description + Details (2/3) */}
          <div className="lg:col-span-2 space-y-5">

            {tournament.description && (
              <InfoCard title="About This Tournament" accent={v.accent}>
                <p className="text-white/55 text-sm leading-relaxed">{tournament.description}</p>
              </InfoCard>
            )}

            <InfoCard title="Tournament Details" accent={v.accent}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                <DetailRow label={t.tournament.organizer} value={tournament.organizerName || 'Unknown'} accent={v.accent} />
                <DetailRow label={t.tournament.registrationPeriod}
                  value={`${new Date(tournament.registrationStartDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${new Date(tournament.registrationEndDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`}
                  accent={v.accent} />
                <DetailRow label={t.tournament.tournamentDates}
                  value={`${new Date(tournament.tournamentStartDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${new Date(tournament.tournamentEndDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`}
                  accent={v.accent} />
                <DetailRow label="Entry Fee"
                  value={tournament.entryFee?.amount > 0 ? `NPR ${tournament.entryFee.amount.toLocaleString()}` : 'Free'}
                  accent={v.accent} />
                {tournament.requirements?.minRank && (
                  <DetailRow label="Min. Rank" value={tournament.requirements.minRank} accent={v.accent} />
                )}
              </div>
              {tournament.entryFee?.paymentInstructions && (
                <div className="mt-5 pt-5 border-t border-white/[0.05]">
                  <p className="text-white/30 text-[10px] uppercase tracking-widest mb-2">Payment Instructions</p>
                  <p className="text-white/55 text-sm leading-relaxed">{tournament.entryFee.paymentInstructions}</p>
                </div>
              )}
            </InfoCard>
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-4">

            {/* Quick links card */}
            {(tournament.streamUrl || tournament.discordUrl) && (
              <InfoCard title="Quick Links" accent={v.accent}>
                <div className="space-y-3">
                  {tournament.streamUrl && (
                    <a href={tournament.streamUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.07] hover:border-purple-500/40 hover:bg-purple-500/[0.06] transition-all group cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white/70 text-sm font-semibold group-hover:text-white transition-colors">Watch Live</p>
                        <p className="text-white/30 text-xs truncate">{tournament.streamUrl}</p>
                      </div>
                      <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  {tournament.discordUrl && (
                    <a href={tournament.discordUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.07] hover:border-indigo-500/40 hover:bg-indigo-500/[0.06] transition-all group cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.035.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white/70 text-sm font-semibold group-hover:text-white transition-colors">Join Discord</p>
                        <p className="text-white/30 text-xs truncate">{tournament.discordUrl}</p>
                      </div>
                      <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </InfoCard>
            )}

            {/* Participants card */}
            <InfoCard title={`Participants · ${tournament.participants?.length || 0}/${tournament.totalSlots}`} accent={v.accent}>
              {tournament.participants?.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                  {tournament.participants.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                      <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ background: v.bg, color: v.accent, border: `1px solid ${v.border}` }}>
                        {i + 1}
                      </span>
                      <p className="text-white/75 text-sm font-semibold truncate">{p.teamName || p.name || `Team ${i + 1}`}</p>
                      {p.seed && <span className="ml-auto text-white/25 text-xs flex-shrink-0">#{p.seed}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8 gap-2 text-white/20">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197" />
                  </svg>
                  <p className="text-sm">No teams registered yet</p>
                </div>
              )}
            </InfoCard>
          </div>
        </div>

        {/* ── Bracket ── */}
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: `${v.accent}20` }}>
          {/* Bracket header with game accent */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-5 border-b"
            style={{ background: `linear-gradient(135deg, ${v.accent}10 0%, transparent 100%)`, borderColor: `${v.accent}15` }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: v.bg, border: `1px solid ${v.border}` }}>
                <svg className="w-4 h-4" style={{ color: v.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="font-['Russo_One'] text-white text-base">Tournament Bracket</h2>
              {isOrganizer && tournament.participants?.length > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full border" style={{ color: v.accent, background: v.bg, borderColor: v.border }}>
                  Edit Mode
                </span>
              )}
            </div>
            {!isOrganizer && (
              <button onClick={() => router.push(`/tournament/${tournamentId}/bracket`)}
                className="btn-ghost px-4 py-2 text-sm cursor-pointer">
                {t.tournaments.viewBracket} →
              </button>
            )}
          </div>
          <div className="p-4 sm:p-6" style={{ background: '#0a0a0a' }}>
            <TournamentBracket
              participants={tournament.participants || []}
              matchmakingType={tournament.matchmakingType}
              isEditable={isOrganizer}
              onBracketUpdate={handleBracketUpdate}
            />
          </div>
        </div>
      </div>

      {/* float-up keyframe injected once */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px) rotate(0deg);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.8; }
          100% { transform: translateY(-700px) rotate(180deg); opacity: 0; }
        }
        .animate-float { animation-timing-function: linear; animation-iteration-count: infinite; }
      `}</style>

      <Footer />
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */
function StatCard({ label, content }: { label: string; content: React.ReactNode; accent?: string }) {
  return (
    <div className="px-5 py-4 bg-white/[0.025] hover:bg-white/[0.04] transition-colors duration-200 col-span-1">
      <p className="text-white/30 text-[10px] uppercase tracking-[0.15em] font-semibold">{label}</p>
      {content}
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.06]">
        <h2 className="font-['Russo_One'] text-sm text-white/70 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string; accent?: string }) {
  return (
    <div>
      <p className="text-white/30 text-[10px] uppercase tracking-widest mb-1">{label}</p>
      <p className="text-white/80 text-sm font-semibold">{value}</p>
    </div>
  );
}

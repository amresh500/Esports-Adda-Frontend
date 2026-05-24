"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/LanguageContext";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

/* ── Scroll-reveal hook ─────────────────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── Scroll parallax hook ───────────────────────────────────────── */
function useParallax() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return y;
}

/* ── 3D mouse parallax hook ─────────────────────────────────────── */
function useMouseParallax() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetRef.current = {
        x: (e.clientX / window.innerWidth  - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tick = () => {
      const cur = currentRef.current;
      const tgt = targetRef.current;
      const nx = lerp(cur.x, tgt.x, 0.06);
      const ny = lerp(cur.y, tgt.y, 0.06);
      if (Math.abs(nx - cur.x) > 0.0001 || Math.abs(ny - cur.y) > 0.0001) {
        currentRef.current = { x: nx, y: ny };
        setPos({ x: nx, y: ny });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);
  return pos;
}

/* ── Scroll-triggered text fill hook ────────────────────────────── */
function useScrollFill() {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      // Starts filling when element enters at bottom, completes at 40% from top
      const start = windowH * 0.9;
      const end   = windowH * 0.4;
      const raw   = (start - rect.top) / (start - end);
      setProgress(Math.min(1, Math.max(0, raw)));
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);
  return { ref, progress };
}

/* ── Count-up hook (fires once on visibility) ───────────────────── */
function useCountUp(target: number, duration = 1200, active = false) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!active || started.current || target === 0) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, target, duration]);
  return value;
}

/* ── Game data ──────────────────────────────────────────────────── */
const GAMES = [
  { name: "Valorant",       accent: "#FF4655", img: "https://images.igdb.com/igdb/image/upload/t_1080p/co2mvt.jpg" },
  { name: "CS2",            accent: "#F0A030", img: "https://cdn.akamai.steamstatic.com/steam/apps/730/library_hero.jpg" },
  { name: "PUBG Mobile",    accent: "#F5A623", img: "https://cdn.akamai.steamstatic.com/steam/apps/578080/library_hero.jpg" },
  { name: "Dota 2",         accent: "#C23C2A", img: "https://cdn.akamai.steamstatic.com/steam/apps/570/library_hero.jpg" },
  { name: "Mobile Legends", accent: "#1E90FF", img: "https://wallpapers.com/images/hd/hero-lineup-with-mobile-legends-logo-4k07rbknmu8mk334.jpg" },
  { name: "Apex Legends",   accent: "#DA292A", img: "https://cdn.akamai.steamstatic.com/steam/apps/1172470/library_hero.jpg" },
  { name: "Free Fire",      accent: "#FF6600", img: "https://dl.dir.freefiremobile.com/common/web_event/official2.ff.garena.all/202210/ce405ad07404fecfb3196b77822aec8b.jpg" },
  { name: "Call of Duty",   accent: "#7CFC00", img: "https://cdn.akamai.steamstatic.com/steam/apps/1938090/library_hero.jpg" },
];

/* ── Icons ──────────────────────────────────────────────────────── */
function TrophyIcon({ className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
    </svg>
  );
}
function ArrowRight({ className = "w-4 h-4" }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

/* ── Tournament row ─────────────────────────────────────────────── */
function UpdateRow({ label, status }: { label: string; status: "live" | "upcoming" | "completed" }) {
  const dotColor = status === "live" ? "bg-[#e85d5d] animate-pulse" : status === "upcoming" ? "bg-amber-400" : "bg-white/20";
  const badge = status === "live" ? "badge badge-red" : status === "upcoming" ? "badge badge-amber" : "badge badge-green";
  const text  = status === "live" ? "Live" : status === "upcoming" ? "Upcoming" : "Ended";
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-white/[0.05] last:border-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
        <span className="text-white/65 text-sm truncate">{label}</span>
      </div>
      <span className={badge}>{text}</span>
    </div>
  );
}

/* ── Feature card ───────────────────────────────────────────────── */
function FeatureCard({ img, title, desc, accent, delay }: { img: string; title: string; desc: string; accent?: boolean; delay: number }) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={`group relative rounded-xl border transition-all duration-500 overflow-hidden ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${
        accent
          ? "border-[#e85d5d]/20 hover:border-[#e85d5d]/40"
          : "border-white/[0.07] hover:border-white/[0.14]"
      }`}>
      {/* Background image with brand-aware overlay */}
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.45) saturate(1.15)" }} />
      {/* Bottom-to-top dark gradient for text legibility */}
      <div className="absolute inset-0"
        style={{ background: accent
          ? "linear-gradient(to top, rgba(13,13,13,0.96) 0%, rgba(13,13,13,0.78) 45%, rgba(232,93,93,0.18) 100%)"
          : "linear-gradient(to top, rgba(13,13,13,0.96) 0%, rgba(13,13,13,0.78) 45%, rgba(0,0,0,0.2) 100%)" }} />
      {/* Hover accent radial */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: accent
          ? "radial-gradient(ellipse at center, rgba(232,93,93,0.22) 0%, transparent 65%)"
          : "radial-gradient(ellipse at center, rgba(255,255,255,0.07) 0%, transparent 65%)" }} />
      {/* Left border glow on hover */}
      <div className={`absolute left-0 top-0 bottom-0 w-[2px] transition-opacity duration-300 opacity-0 group-hover:opacity-100 rounded-l-xl ${accent ? "bg-[#e85d5d]" : "bg-white/40"}`} />
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${accent ? "bg-gradient-to-r from-transparent via-[#e85d5d] to-transparent" : "bg-gradient-to-r from-transparent via-white/30 to-transparent"}`} />

      {/* Content */}
      <div className="relative p-6 min-h-[180px] flex flex-col justify-end">
        <h3 className={`font-['Russo_One'] text-white text-lg mb-1.5 leading-snug transition-transform duration-300 group-hover:-translate-y-0.5 ${accent ? "drop-shadow-[0_2px_8px_rgba(232,93,93,0.4)]" : ""}`}>{title}</h3>
        <p className="text-white/65 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ── Game card ──────────────────────────────────────────────────── */
function GameCard({ name, accent, img, index }: { name: string; accent: string; img: string; index: number }) {
  const { ref, visible } = useReveal(0.1);
  return (
    <Link href="/games" ref={ref as any}
      style={{ transitionDelay: `${index * 60}ms` }}
      className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl" style={{ border: `1px solid ${accent}25` }}>
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
          style={{ backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center top",
            filter: "brightness(0.28) saturate(1.2)" }} />
        <div className="absolute inset-0"
          style={{ background: `linear-gradient(to top, ${accent}50 0%, transparent 55%)` }} />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(ellipse at center, ${accent}20 0%, transparent 70%)` }} />
        <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="font-['Russo_One'] text-white text-xs leading-tight group-hover:translate-y-[-2px] transition-transform duration-300">
            {name}
          </p>
          <div className="w-6 h-0.5 mt-1.5 rounded-full transition-all duration-300 group-hover:w-10"
            style={{ background: accent }} />
        </div>
        <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: accent }} />
      </div>
    </Link>
  );
}

/* ── Scroll-fill heading ─────────────────────────────────────────── */
function FillHeading({ children, className = "" }: { children: string; className?: string }) {
  const { ref, progress } = useScrollFill();
  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      {/* Ghost (unfilled) text */}
      <span className="font-['Russo_One'] text-white/15 select-none" aria-hidden="true">{children}</span>
      {/* Filled text — clip-path reveals left to right */}
      <span
        className="font-['Russo_One'] text-white absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` }}
        aria-hidden="true"
      >{children}</span>
      {/* Screen-reader accessible version */}
      <span className="sr-only">{children}</span>
    </div>
  );
}

/* ── Animated stat counter cell ─────────────────────────────────── */
function StatCell({ raw, label, active, delay }: { raw: string; label: string; active: boolean; delay: number }) {
  // Parse the numeric part (e.g. "12K+" → 12, "5+" → 5, "—" → 0)
  const numeric = parseInt(raw.replace(/[^0-9]/g, ""), 10) || 0;
  const suffix  = raw.replace(/[0-9]/g, "").replace("—", "");
  const counted = useCountUp(numeric, 1400, active);
  const display = raw === "—" ? "—" : `${counted}${suffix}`;
  return (
    <div className={`bg-[#111111]/85 backdrop-blur-sm px-5 py-5 text-center group hover:bg-[#e85d5d]/[0.04] transition-colors duration-300 stat-reveal ${active ? "" : "[animation-play-state:paused]"}`}
      style={{ animationDelay: `${delay}ms`, animationPlayState: active ? "running" : "paused" }}>
      <p className="font-['Russo_One'] text-2xl sm:text-3xl text-[#e85d5d] mb-0.5 tabular-nums transition-all duration-300">{display}</p>
      <p className="text-white/40 text-xs sm:text-sm tracking-wide">{label}</p>
    </div>
  );
}

/* ── Stat value formatter ───────────────────────────────────────── */
function formatStatValue(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}K+`;
  if (n > 0) return `${n}+`;
  return `${n}`;
}

/* ── Section label + fill heading block ─────────────────────────── */
function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  const { ref, visible } = useReveal(0.2);
  return (
    <div ref={ref} className={`text-center mb-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <p className="text-[#e85d5d] text-[11px] font-bold uppercase tracking-[0.18em] mb-3">{eyebrow}</p>
      <FillHeading className="text-2xl sm:text-3xl block">{title}</FillHeading>
      {sub && <p className="text-white/40 text-sm max-w-sm mx-auto mt-3 leading-relaxed">{sub}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const { t } = useLanguage();
  const scrollY = useParallax();
  const mouse = useMouseParallax();
  const [heroVisible, setHeroVisible] = useState(false);
  const statsReveal   = useReveal(0.2);
  const updatesReveal = useReveal(0.15);
  const gamesReveal   = useReveal(0.1);

  const [stats, setStats] = useState([
    { value: "—", label: "Players" },
    { value: "—", label: "Teams" },
    { value: "—", label: "Tournaments" },
    { value: "—", label: "Organizations" },
  ]);
  const [recent, setRecent]   = useState<{ label: string; status: "live"|"upcoming"|"completed" }[]>([]);
  const [upcoming, setUpcoming] = useState<{ label: string; status: "live"|"upcoming"|"completed" }[]>([]);
  const { accountType, mounted } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    api.get("/stats/overview").then((res) => {
      const d = res.data.data;
      setStats([
        { value: formatStatValue(d.totalPlayers),       label: "Players" },
        { value: formatStatValue(d.totalTeams),         label: "Teams" },
        { value: formatStatValue(d.totalTournaments),   label: "Tournaments" },
        { value: formatStatValue(d.totalOrganizations), label: "Organizations" },
      ]);
    }).catch(() => {});

    api.get("/tournaments").then((res) => {
      const all: any[] = res.data.data.tournaments || [];
      const toStatus = (s: string): "live"|"upcoming"|"completed" =>
        s === "ongoing" ? "live" :
        ["completed","cancelled","overdue"].includes(s) ? "completed" : "upcoming";

      setRecent([...all.filter(t => t.status === "ongoing"), ...all.filter(t => ["completed","cancelled","overdue"].includes(t.status))]
        .slice(0, 3).map(t => ({ label: t.name, status: toStatus(t.status) })));
      setUpcoming(all.filter(t => ["registration_open","registration_closed","draft"].includes(t.status))
        .slice(0, 3).map(t => ({ label: t.name, status: "upcoming" as const })));
    }).catch(() => {});
  }, []);

  const features = [
    { img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80", title: t.about.feature1Title, desc: t.about.feature1Desc, accent: true },
    { img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80", title: t.about.feature3Title, desc: t.about.feature3Desc },
    { img: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80", title: t.about.feature2Title, desc: t.about.feature2Desc },
    { img: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&q=80", title: t.team.title,          desc: t.team.createFirst },
  ];

  /* What-we-offer items */
  const offerItems = [
    { icon: "🏆", label: "Tournament Hosting",  sub: "Create & manage brackets" },
    { icon: "👤", label: "Player Profiles",      sub: "Stats, history, achievements" },
    { icon: "🤝", label: "Team Management",      sub: "Roster, roles & invites" },
    { icon: "🏢", label: "Org Dashboard",        sub: "Run your esports org" },
    { icon: "📊", label: "Esports Analytics",    sub: "Live data & standings" },
    { icon: "🔔", label: "Live Notifications",   sub: "Match alerts in real-time" },
    { icon: "🎮", label: "11+ Games Supported",  sub: "From Valorant to Free Fire" },
    { icon: "🇳🇵", label: "Nepal Community",      sub: "Built for NP esports" },
  ];

  return (
    <>
      <style>{`
        @keyframes hero-fade-up   { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes hero-fade-in   { from { opacity:0; } to { opacity:1; } }
        @keyframes orb-drift-a    { 0%,100%{transform:translate(0,0) scale(1);}  50%{transform:translate(40px,-30px) scale(1.08);} }
        @keyframes orb-drift-b    { 0%,100%{transform:translate(0,0) scale(1);}  50%{transform:translate(-35px,25px) scale(1.05);} }
        @keyframes orb-drift-c    { 0%,100%{transform:translate(0,0) scale(1);}  50%{transform:translate(20px,40px) scale(1.06);} }
        @keyframes grid-pan       { from{background-position:0 0;} to{background-position:40px 40px;} }
        @keyframes scanline-sweep { 0%{top:-8%;} 100%{top:108%;} }
        @keyframes counter-up     { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
        @keyframes border-glow    { 0%,100%{box-shadow:0 0 0 0 rgba(232,93,93,0);} 50%{box-shadow:0 0 0 2px rgba(232,93,93,0.25);} }
        @keyframes float-badge    { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-6px);} }
        @keyframes ticker         { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
        @keyframes ticker-rev     { 0%{transform:translateX(-50%);} 100%{transform:translateX(0);} }
        @keyframes line-grow      { from{transform:scaleX(0);} to{transform:scaleX(1);} }
        @keyframes char-pop       { from{opacity:0;transform:translateY(8px) scale(0.9);} to{opacity:1;transform:translateY(0) scale(1);} }
        @keyframes offer-in       { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        @keyframes pulse-ring     { 0%{transform:scale(1);opacity:0.6;} 100%{transform:scale(1.8);opacity:0;} }
        @keyframes shine-sweep    { 0%{background-position:200% center;} 100%{background-position:-200% center;} }

        .hero-word  { display:inline-block; opacity:0; animation:hero-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
        .hero-accent-word {
          display:inline-block; opacity:0;
          background: linear-gradient(100deg, #e85d5d 20%, #ff9a8b 45%, #ffffff 50%, #ff9a8b 55%, #e85d5d 80%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: hero-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) forwards,
                     shine-sweep 3.5s linear 1.2s infinite;
        }
        .hero-sub   { opacity:0; animation:hero-fade-in 0.7s ease forwards; }
        .hero-btns  { opacity:0; animation:hero-fade-in 0.6s ease forwards; }
        .orb-a { animation:orb-drift-a 9s ease-in-out infinite; }
        .orb-b { animation:orb-drift-b 12s ease-in-out infinite; }
        .orb-c { animation:orb-drift-c 15s ease-in-out infinite; }
        .grid-bg {
          background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: grid-pan 8s linear infinite;
        }
        .scanline {
          position:absolute; left:0; right:0; height:8%;
          background: linear-gradient(to bottom, transparent, rgba(232,93,93,0.04), transparent);
          animation: scanline-sweep 5s linear infinite;
          pointer-events:none;
        }
        .stat-reveal { opacity:0; animation:counter-up 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .cta-pulse   { animation:border-glow 3s ease-in-out infinite; }
        .badge-float { animation:float-badge 3s ease-in-out infinite; }
        .ticker-track { display:flex; animation:ticker 30s linear infinite; }
        .ticker-track:hover { animation-play-state:paused; }
        .ticker-rev   { display:flex; animation:ticker-rev 40s linear infinite; }
        .line-reveal  { transform-origin:left; animation:line-grow 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .offer-card   { opacity:0; animation:offer-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .pulse-ring::after {
          content:''; position:absolute; inset:0; border-radius:9999px;
          border:1px solid currentColor;
          animation:pulse-ring 2s ease-out infinite;
        }
      `}</style>

      <div className="min-h-screen text-white">
        <Header />

        <main>

          {/* ══════════════════════════════════════════════════════════
              HERO
          ══════════════════════════════════════════════════════════ */}
          <section className="relative overflow-hidden min-h-[90vh] flex items-center">

            {/* Depth layer 1: background art */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
              style={{ transform: `translate3d(${mouse.x * -16}px, ${mouse.y * -16 + scrollY * 0.2}px, 0)`, willChange: "transform" }}>
              <div className="absolute right-0 top-0 bottom-0 w-[55%] hidden lg:block">
                <div className="absolute inset-0"
                  style={{ backgroundImage: `url(https://cdn.akamai.steamstatic.com/steam/apps/730/library_hero.jpg)`,
                    backgroundSize: "cover", backgroundPosition: "center",
                    filter: "brightness(0.2) saturate(1.3)" }} />
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(to right, #0d0d0d 0%, rgba(13,13,13,0.85) 30%, rgba(13,13,13,0.3) 100%)" }} />
                <div className="absolute inset-0 opacity-30"
                  style={{ background: "linear-gradient(135deg, rgba(232,93,93,0.15) 0%, transparent 60%)" }} />
              </div>
            </div>

            {/* Depth layer 2: orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true"
              style={{ transform: `translate3d(${mouse.x * -28}px, ${mouse.y * -28}px, 0)`, willChange: "transform" }}>
              <div className="orb-a absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#e85d5d]/[0.07] blur-[90px]" />
              <div className="orb-b absolute bottom-1/4 left-1/3 w-96 h-56 rounded-full bg-[#441415]/40 blur-[100px]" />
              <div className="orb-c absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-[#e85d5d]/[0.04] blur-[70px]" />
            </div>

            {/* Depth layer 3: floating game cards */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
              style={{ transform: `translate3d(${mouse.x * -44}px, ${mouse.y * -44}px, 0)`, willChange: "transform" }}>
              {[
                { game: GAMES[0], top: "10%",  right: "7%",  w: "200px", h: "120px", rot: "-4deg", delay: "0.3s" },
                { game: GAMES[2], top: "40%",  right: "22%", w: "180px", h: "108px", rot: "3deg",  delay: "0.6s" },
                { game: GAMES[4], top: "63%",  right: "5%",  w: "190px", h: "114px", rot: "-2deg", delay: "0.9s" },
                { game: GAMES[6], top: "20%",  right: "34%", w: "160px", h: "96px",  rot: "5deg",  delay: "1.2s" },
              ].map(({ game, top, right, w, h, rot, delay }, i) => (
                <div key={i} className="absolute hidden lg:block hero-sub rounded-xl overflow-hidden shadow-2xl"
                  style={{ top, right, width: w, height: h, transform: `rotate(${rot})`,
                    animationDelay: delay, border: `1px solid ${game.accent}35`,
                    boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px ${game.accent}20` }}>
                  <div className="absolute inset-0"
                    style={{ backgroundImage: `url(${game.img})`, backgroundSize: "cover",
                      backgroundPosition: "center top", filter: "brightness(0.45) saturate(1.4)" }} />
                  <div className="absolute inset-0"
                    style={{ background: `linear-gradient(to top, ${game.accent}55 0%, transparent 65%)` }} />
                  <div className="absolute bottom-2 left-3">
                    <p className="font-['Russo_One'] text-white text-[10px] leading-tight">{game.name}</p>
                    <div className="w-4 h-[2px] mt-0.5 rounded-full" style={{ background: game.accent }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Grid + scanline */}
            <div className="grid-bg absolute inset-0 pointer-events-none opacity-60" aria-hidden="true" />
            <div className="scanline" aria-hidden="true" />

            {/* Hero content */}
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 lg:py-40 w-full">
              <div className="max-w-xl lg:max-w-2xl">

                {/* Eyebrow — character pop-in */}
                {heroVisible && (
                  <div className="badge-float inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e85d5d]/10 border border-[#e85d5d]/25 mb-7">
                    <span className="relative w-1.5 h-1.5 pulse-ring">
                      <span className="absolute inset-0 rounded-full bg-[#e85d5d]" />
                    </span>
                    <span className="text-[#e85d5d] text-xs font-semibold tracking-[0.12em] uppercase">
                      {"Nepal's Premier Esports Platform".split("").map((ch, i) => (
                        <span key={i} className="inline-block"
                          style={{
                            opacity: 0,
                            animation: `char-pop 0.4s cubic-bezier(0.16,1,0.3,1) forwards`,
                            animationDelay: `${i * 32}ms`,
                            whiteSpace: "pre",
                          }}>
                          {ch}
                        </span>
                      ))}
                    </span>
                  </div>
                )}

                {/* Headline */}
                <h1 className="font-['Russo_One'] text-5xl sm:text-6xl md:text-7xl mb-6 leading-[1.05]">
                  {heroVisible && (() => {
                    const lines = t.home.heroTitle.split("\n");
                    return lines.map((line, li) => (
                      <span key={li} className="block">
                        {line.split(" ").map((word, wi) => {
                          const globalIdx = lines.slice(0, li).join(" ").split(" ").filter(Boolean).length + wi;
                          const isAccentLine = li === lines.length - 1;
                          return (
                            <span key={wi} className={`hero-word ${isAccentLine ? "hero-accent-word" : "text-white"}`}
                              style={{ animationDelay: `${globalIdx * 90}ms` }}>
                              {word}{" "}
                            </span>
                          );
                        })}
                      </span>
                    ));
                  })()}
                </h1>

                {/* Animated underline below headline */}
                {heroVisible && (
                  <div className="mb-6 h-px w-24 bg-gradient-to-r from-[#e85d5d] to-transparent line-reveal"
                    style={{ animationDelay: "500ms" }} aria-hidden="true" />
                )}

                {/* Subtext */}
                {heroVisible && (
                  <p className="hero-sub text-white/50 text-base sm:text-lg leading-relaxed mb-10 max-w-md"
                    style={{ animationDelay: "380ms" }}>
                    {t.home.heroSubtitle}
                  </p>
                )}

                {/* CTAs */}
                {heroVisible && mounted && (
                  <div className="hero-btns flex flex-col sm:flex-row items-start gap-3"
                    style={{ animationDelay: "480ms" }}>
                    <Link href="/tournaments"
                      className="btn-brand inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold">
                      Browse Tournaments <ArrowRight />
                    </Link>
                    {accountType === "player" ? (
                      <Link href="/profile" className="btn-ghost inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold">My Profile</Link>
                    ) : accountType === "organization" ? (
                      <Link href="/org-profile" className="btn-ghost inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold">Org Dashboard</Link>
                    ) : (
                      <Link href="/signup" className="btn-ghost inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold">Create Account</Link>
                    )}
                  </div>
                )}

                {/* Trust signals */}
                {heroVisible && (
                  <div className="hero-sub flex flex-wrap gap-5 mt-10" style={{ animationDelay: "600ms" }}>
                    {[
                      { icon: "🎮", text: "11+ Supported Games" },
                      { icon: "🏆", text: "Live Tournaments" },
                      { icon: "🇳🇵", text: "Nepal Community" },
                    ].map(({ icon, text }, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-white/35 text-xs">
                        <span>{icon}</span>
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
              style={{ background: "linear-gradient(to bottom, transparent, #0d0d0d)" }} />
          </section>

          {/* ══════════════════════════════════════════════════════════
              STATS BAR
          ══════════════════════════════════════════════════════════ */}
          <section className="px-4 sm:px-6 mb-20">
            <div className="max-w-5xl mx-auto">
              <div ref={statsReveal.ref}
                className="grid grid-cols-2 md:grid-cols-4 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] gap-px">
                {stats.map((s, i) => (
                  <StatCell key={i} raw={s.value} label={s.label} active={statsReveal.visible} delay={i * 80} />
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              WHAT WE OFFER — identity strip
          ══════════════════════════════════════════════════════════ */}
          {(() => {
            const r = useReveal(0.15);
            return (
              <section className="px-4 sm:px-6 mb-24" ref={r.ref}>
                <div className="max-w-5xl mx-auto">
                  {/* Section label with animated reveal lines */}
                  <div className={`flex items-center gap-4 mb-8 transition-all duration-700 ${r.visible ? "opacity-100" : "opacity-0"}`}>
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#e85d5d]/40" />
                    <p className="text-[#e85d5d] text-[11px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">What Esports Adda Offers</p>
                    <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#e85d5d]/40" />
                  </div>

                  {/* Card grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {offerItems.map((item, i) => (
                      <div key={i} className="offer-card group relative rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-4 hover:border-[#e85d5d]/30 hover:bg-[#e85d5d]/[0.04] transition-all duration-300 cursor-default"
                        style={{ animationDelay: r.visible ? `${i * 55}ms` : "9999s", animationPlayState: r.visible ? "running" : "paused" }}>
                        <div className="text-xl mb-2">{item.icon}</div>
                        <p className="font-['Russo_One'] text-white text-xs leading-snug mb-0.5">{item.label}</p>
                        <p className="text-white/35 text-[11px] leading-snug">{item.sub}</p>
                        {/* hover accent line */}
                        <div className="absolute bottom-0 left-4 right-4 h-px bg-[#e85d5d]/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                      </div>
                    ))}
                  </div>

                  {/* Scrolling game name strip */}
                  <div className="mt-6 overflow-hidden rounded-lg border border-white/[0.05] bg-white/[0.02] py-2.5">
                    <div className="ticker-track whitespace-nowrap">
                      {[...GAMES, ...GAMES].map((g, i) => (
                        <span key={i} className="inline-flex items-center gap-2 mx-6 text-xs font-semibold"
                          style={{ color: g.accent }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: g.accent }} />
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            );
          })()}

          {/* ══════════════════════════════════════════════════════════
              GAMES SHOWCASE
          ══════════════════════════════════════════════════════════ */}
          <section className="px-4 sm:px-6 mb-24" ref={gamesReveal.ref}>
            <div className="max-w-5xl mx-auto">
              <div className={`flex items-end justify-between mb-8 transition-all duration-700 ${gamesReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                <div>
                  <p className="text-[#e85d5d] text-[11px] font-bold uppercase tracking-[0.18em] mb-1">Supported Games</p>
                  <FillHeading className="text-2xl sm:text-3xl">Play Your Game</FillHeading>
                </div>
                <Link href="/games"
                  className="text-white/40 hover:text-white text-sm flex items-center gap-1.5 transition-colors group">
                  All Games <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {GAMES.map((g, i) => (
                  <GameCard key={g.name} name={g.name} accent={g.accent} img={g.img} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              LATEST UPDATES
          ══════════════════════════════════════════════════════════ */}
          <section className="px-4 sm:px-6 mb-20" ref={updatesReveal.ref}>
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <span className={`h-px flex-1 bg-gradient-to-r from-transparent to-white/[0.08] transition-all duration-1000 ${updatesReveal.visible ? "opacity-100" : "opacity-0"}`} />
                <h2 className={`font-['Russo_One'] text-xl sm:text-2xl text-white transition-all duration-700 ${updatesReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                  {t.home.latestUpdates}
                </h2>
                <span className={`h-px flex-1 bg-gradient-to-l from-transparent to-white/[0.08] transition-all duration-1000 ${updatesReveal.visible ? "opacity-100" : "opacity-0"}`} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className={`card p-5 transition-all duration-700 delay-100 ${updatesReveal.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-[#e85d5d]/10 border border-[#e85d5d]/20 flex items-center justify-center text-[#e85d5d]">
                      <TrophyIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-['Russo_One'] text-sm text-white/80">{t.home.latestUpdates}</span>
                  </div>
                  {recent.length > 0
                    ? recent.map((r, i) => <UpdateRow key={i} {...r} />)
                    : <p className="text-white/30 text-sm py-2">No recent tournaments</p>}
                </div>
                <div className={`card p-5 transition-all duration-700 delay-200 ${updatesReveal.visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                      <TrophyIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-['Russo_One'] text-sm text-white/80">{t.home.upcomingTournaments}</span>
                  </div>
                  {upcoming.length > 0
                    ? upcoming.map((u, i) => <UpdateRow key={i} {...u} />)
                    : <p className="text-white/30 text-sm py-2">No upcoming tournaments</p>}
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              FEATURES
          ══════════════════════════════════════════════════════════ */}
          <section className="px-4 sm:px-6 mb-20">
            <div className="max-w-5xl mx-auto">
              <SectionHead
                eyebrow="Platform"
                title={t.about.features}
                sub="Everything you need to compete in Nepal's esports scene."
              />
              <div className="grid sm:grid-cols-2 gap-3">
                {features.map((f, i) => (
                  <FeatureCard key={i} img={f.img} title={f.title} desc={f.desc} accent={!!f.accent} delay={i * 80} />
                ))}
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════
              CTA BANNER
          ══════════════════════════════════════════════════════════ */}
          {(() => {
            const r = useReveal();
            return (
              <section className="px-4 sm:px-6 mb-10" ref={r.ref}>
                <div className="max-w-5xl mx-auto">
                  <div className={`relative overflow-hidden rounded-2xl border border-[#e85d5d]/20 px-8 sm:px-12 py-12 sm:py-16 text-center cta-pulse transition-all duration-700 ${r.visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]"}`}
                    style={{ background: "linear-gradient(135deg, rgba(232,93,93,0.08) 0%, rgba(13,13,13,0.95) 60%)" }}>

                    {/* Game art strip */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                      {GAMES.slice(0, 4).map((g, i) => (
                        <div key={i} className="absolute top-0 bottom-0 w-1/4 opacity-[0.06]"
                          style={{ left: `${i * 25}%`,
                            backgroundImage: `url(${g.img})`,
                            backgroundSize: "cover", backgroundPosition: "center",
                            filter: "saturate(1.5)" }} />
                      ))}
                      <div className="absolute inset-0"
                        style={{ background: "linear-gradient(135deg, rgba(13,13,13,0.97) 0%, rgba(13,13,13,0.85) 100%)" }} />
                    </div>

                    {/* Scrolling game name watermark strip */}
                    <div className="absolute bottom-3 left-0 right-0 overflow-hidden pointer-events-none opacity-[0.07]">
                      <div className="ticker-rev whitespace-nowrap">
                        {[...GAMES, ...GAMES, ...GAMES].map((g, i) => (
                          <span key={i} className="inline-block mx-4 font-['Russo_One'] text-[10px] uppercase tracking-widest text-white">{g.name}</span>
                        ))}
                      </div>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-72 h-36 rounded-full bg-[#e85d5d]/[0.08] blur-[70px]" />
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-[#e85d5d]/70 to-transparent" />

                    <div className="relative">
                      <p className="text-[#e85d5d] text-[11px] font-bold uppercase tracking-[0.18em] mb-3">
                        {accountType ? "Welcome Back" : "Join the Community"}
                      </p>
                      <h2 className="font-['Russo_One'] text-2xl sm:text-3xl text-white mb-3">
                        {accountType ? "Welcome Back!" : "Ready to Compete?"}
                      </h2>
                      <p className="text-white/45 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                        {accountType
                          ? "Jump back into the action — browse tournaments and track your progress."
                          : "Join players and organizations already building their legacy on Esports Adda."}
                      </p>
                      {accountType === "player" ? (
                        <Link href="/tournaments" className="btn-brand inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold">
                          Browse Tournaments <ArrowRight />
                        </Link>
                      ) : accountType === "organization" ? (
                        <Link href="/organizer/dashboard" className="btn-brand inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold">
                          Go to Dashboard <ArrowRight />
                        </Link>
                      ) : (
                        <Link href="/signup" className="btn-brand inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold">
                          Get Started <ArrowRight />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            );
          })()}

        </main>

        <Footer />
      </div>
    </>
  );
}

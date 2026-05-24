"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import api from "@/lib/api";

function formatNum(n: number) {
  if (n >= 1000) return `${Math.floor(n / 1000)}K+`;
  if (n > 0) return `${n}+`;
  return "—";
}

export default function AboutPage() {
  const { t } = useLanguage();
  const { isLoggedIn } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get("/stats/overview").then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  const features = [
    {
      title: t.about.feature1Title,
      desc: t.about.feature1Desc,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
        </svg>
      ),
    },
    {
      title: "Player Profiles",
      desc: "Build your competitive identity. Showcase ranks across games, log achievements, and connect your streaming and social accounts.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
    {
      title: "Team Management",
      desc: "Form rosters for multiple games, assign roles — Captain, Coach, Manager — and track your team's tournament history in one place.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197" />
        </svg>
      ),
    },
    {
      title: "Organization Hub",
      desc: "Run a professional esports org. Coordinate teams across games, manage staff roles and departments, and build your brand.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      ),
    },
    {
      title: t.about.feature4Title,
      desc: t.about.feature4Desc,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
        </svg>
      ),
    },
    {
      title: t.about.feature3Title,
      desc: t.about.feature3Desc,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
  ];

  const pillars = [
    {
      title: "Nepal First",
      desc: "Built for the Nepali esports scene — tournaments, teams, and talent are highlighted with local context and Nepali language support.",
      icon: "🇳🇵",
    },
    {
      title: "All-in-One",
      desc: "Profiles, teams, tournaments, live streams, and stats in one platform. No more juggling separate tools for each part of your esports journey.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
    },
    {
      title: "Pro-Grade Tools",
      desc: "Bracket generation, match reporting, payment verification, staff roles, and admin controls — everything a serious organizer or team needs.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
        </svg>
      ),
    },
  ];

  const supported = ["Valorant","CS2","PUBG Mobile","Dota 2","League of Legends","Free Fire","Mobile Legends","Apex Legends","Call of Duty","Rainbow Six Siege","Other"];

  return (
    <div className="min-h-screen">
      <Header />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-4 sm:px-6 pt-16 pb-20 text-center">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e85d5d]/50 to-transparent" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#e85d5d]/[0.06] blur-[100px] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e85d5d]/10 border border-[#e85d5d]/25 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e85d5d] animate-pulse" />
            <span className="text-[#e85d5d] text-xs font-semibold tracking-[0.12em] uppercase">Nepal's Esports Platform</span>
          </div>
          <h1 className="font-['Russo_One'] text-4xl sm:text-6xl text-white mb-5 leading-tight">
            {t.about.title}
          </h1>
          <p className="text-white/50 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            {t.about.missionText}
          </p>
        </div>
      </section>

      {/* ── Live stats from API ── */}
      <section className="px-4 sm:px-6 mb-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.08]">
            {[
              { label: "Players",       value: stats ? formatNum(stats.totalPlayers)       : "—" },
              { label: "Teams",         value: stats ? formatNum(stats.totalTeams)          : "—" },
              { label: "Tournaments",   value: stats ? formatNum(stats.totalTournaments)    : "—" },
              { label: "Organizations", value: stats ? formatNum(stats.totalOrganizations)  : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#111111]/90 px-5 py-6 text-center">
                <p className="font-['Russo_One'] text-3xl text-[#e85d5d] mb-1">{value}</p>
                <p className="text-white/40 text-xs uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="px-4 sm:px-6 mb-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] px-8 py-10 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#e85d5d]/60 to-transparent" />
            <div className="absolute top-0 right-0 w-64 h-40 rounded-full bg-[#e85d5d]/[0.05] blur-[80px] pointer-events-none" />
            <div className="relative">
              <p className="text-[#e85d5d] text-xs font-bold uppercase tracking-widest mb-3">{t.about.mission}</p>
              <p className="text-white/65 text-base sm:text-lg leading-relaxed">{t.about.missionText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="px-4 sm:px-6 mb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-['Russo_One'] text-2xl sm:text-3xl text-white text-center mb-10">{t.about.features}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((f, i) => (
              <div key={i} className="group rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-[#e85d5d]/30 hover:bg-[#e85d5d]/[0.03] transition-all duration-300 p-5">
                <div className="w-9 h-9 rounded-lg bg-[#e85d5d]/10 border border-[#e85d5d]/20 flex items-center justify-center text-[#e85d5d] mb-4 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="font-['Russo_One'] text-white text-sm mb-2">{f.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Supported games ── */}
      <section className="px-4 sm:px-6 mb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-['Russo_One'] text-2xl sm:text-3xl text-white text-center mb-8">Supported Games</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {supported.map((game) => (
              <span key={game} className="px-4 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/60 text-sm hover:border-white/20 hover:text-white/80 transition-all duration-200">
                {game}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Esports Adda ── */}
      <section className="px-4 sm:px-6 mb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-['Russo_One'] text-2xl sm:text-3xl text-white text-center mb-8">{t.about.vision}</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {pillars.map((p, i) => (
              <div key={i} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-6 text-center hover:border-white/[0.14] transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/70 mx-auto mb-4 text-xl">
                  {typeof p.icon === "string" ? p.icon : p.icon}
                </div>
                <h3 className="font-['Russo_One'] text-white text-base mb-2">{p.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA (guests only) ── */}
      {!isLoggedIn && (
        <section className="px-4 sm:px-6 mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl border border-[#e85d5d]/20 bg-[#e85d5d]/[0.05] px-8 py-12 text-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-[#e85d5d]/70 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-36 rounded-full bg-[#e85d5d]/[0.07] blur-[70px]" />
              </div>
              <div className="relative">
                <h2 className="font-['Russo_One'] text-2xl sm:text-3xl text-white mb-3">{t.about.feature2Title}</h2>
                <p className="text-white/45 mb-7 max-w-sm mx-auto text-sm leading-relaxed">{t.about.feature2Desc}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/signup" className="btn-brand inline-flex items-center justify-center px-7 py-3 text-sm font-semibold">
                    {t.auth.signup}
                  </Link>
                  <Link href="/tournaments" className="btn-ghost inline-flex items-center justify-center px-7 py-3 text-sm font-semibold">
                    {t.home.exploreTournaments}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

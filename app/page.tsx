"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-primary-gradient text-white">
      <Header />

      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-[#e85d5d] mb-4 sm:mb-6 whitespace-pre-line">
            {t.home.heroTitle}
          </h1>
          <p className="text-gray-300 max-w-2xl text-sm sm:text-lg mb-6 sm:mb-8 px-2">
            {t.home.heroSubtitle}
          </p>
        </section>

        {/* Updates Section */}
        <section className="px-4 sm:px-6 py-8 sm:py-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 underline underline-offset-8 decoration-[#e85d5d]">
            {t.home.latestUpdates}
          </h2>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Recent Tournaments */}
            <div className="bg-white/5 backdrop-blur-[3.1px] rounded-[20px] shadow-[4px_4px_21.2px_rgba(0,0,0,0.25)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎮</span>
                <h3 className="text-xl font-semibold">{t.home.latestUpdates}</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-300">
                  <span>🎯</span>
                  <span>Nepal's Gen-G Cup PUBG Mobile</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span>🎯</span>
                  <span>Nepal's Gen-G Cup Counter Strike</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span>✓</span>
                  <span>Nepal's Gen-G Cup Valorant</span>
                </li>
              </ul>
            </div>

            {/* Upcoming Tournaments */}
            <div className="bg-white/5 backdrop-blur-[3.1px] rounded-[20px] shadow-[4px_4px_21.2px_rgba(0,0,0,0.25)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📊</span>
                <h3 className="text-xl font-semibold">{t.home.upcomingTournaments}</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-300">
                  <span>🎮</span>
                  <span>Nepal's Gen-G Cup ML88</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span>🔥</span>
                  <span>Nepal's Gen-G Cup Free Fire</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span>🎮</span>
                  <span>Nepal's Gen-G Cup LOL</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 sm:px-6 py-8 sm:py-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-center mb-2 sm:mb-4">
            {t.about.features}
          </h2>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white/5 backdrop-blur-[3.1px] rounded-[20px] shadow-[4px_4px_21.2px_rgba(0,0,0,0.25)] p-8">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-2xl font-bold mb-3">{t.about.feature1Title}</h3>
              <p className="text-gray-300">{t.about.feature1Desc}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-[3.1px] rounded-[20px] shadow-[4px_4px_21.2px_rgba(0,0,0,0.25)] p-8">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-2xl font-bold mb-3">{t.about.feature3Title}</h3>
              <p className="text-gray-300">{t.about.feature3Desc}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-[3.1px] rounded-[20px] shadow-[4px_4px_21.2px_rgba(0,0,0,0.25)] p-8">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-2xl font-bold mb-3">{t.about.feature2Title}</h3>
              <p className="text-gray-300">{t.about.feature2Desc}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-[3.1px] rounded-[20px] shadow-[4px_4px_21.2px_rgba(0,0,0,0.25)] p-8">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-2xl font-bold mb-3">{t.team.title}</h3>
              <p className="text-gray-300">{t.team.createFirst}</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

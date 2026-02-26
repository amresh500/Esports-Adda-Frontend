import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-primary-gradient text-white">
      <Header />
      
      <main className="flex flex-col">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#e85d5d] mb-6">
            Organize Epic Esports
            <br />
            Tournaments
          </h1>
          <p className="text-gray-300 max-w-2xl text-lg mb-8">
            The competitive gaming hub built for Nepal. Track stats, host tournaments, and dominate across all platforms. Where performance analytics meets community-driven esports.
          </p>
        </section>

        {/* Updates Section */}
        <section className="px-6 py-12">
          <h2 className="text-4xl font-bold text-center mb-12 underline underline-offset-8 decoration-[#e85d5d]">
            Updates
          </h2>
          
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Recent Tournaments */}
            <div className="bg-white/5 backdrop-blur-[3.1px] rounded-[20px] shadow-[4px_4px_21.2px_rgba(0,0,0,0.25)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎮</span>
                <h3 className="text-xl font-semibold">Recent tournaments</h3>
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
                <h3 className="text-xl font-semibold">Upcoming tournaments</h3>
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
        <section className="px-6 py-12">
          <h2 className="text-4xl font-bold text-center mb-4">
            Everything You Need to Run
          </h2>
          <p className="text-3xl font-semibold text-center text-[#e85d5d] mb-12">
            Pro Tournaments
          </p>
          
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Tournament Management */}
            <div className="bg-white/5 backdrop-blur-[3.1px] rounded-[20px] shadow-[4px_4px_21.2px_rgba(0,0,0,0.25)] p-8">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-2xl font-bold mb-3">Tournament Management</h3>
              <p className="text-gray-300">
                Create and manage tournaments with ease. Brackets, scheduling, and more
              </p>
            </div>

            {/* Statistics Tracking */}
            <div className="bg-white/5 backdrop-blur-[3.1px] rounded-[20px] shadow-[4px_4px_21.2px_rgba(0,0,0,0.25)] p-8">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-2xl font-bold mb-3">Statistics Tracking</h3>
              <p className="text-gray-300">
                Track player performance, match history, and detailed analytics for every game.
              </p>
            </div>

            {/* Real-Time Updates */}
            <div className="bg-white/5 backdrop-blur-[3.1px] rounded-[20px] shadow-[4px_4px_21.2px_rgba(0,0,0,0.25)] p-8">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-2xl font-bold mb-3">Real-Time Updates</h3>
              <p className="text-gray-300">
                Live match updates, instant notifications.
              </p>
            </div>

            {/* Team Management */}
            <div className="bg-white/5 backdrop-blur-[3.1px] rounded-[20px] shadow-[4px_4px_21.2px_rgba(0,0,0,0.25)] p-8">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-2xl font-bold mb-3">Team Management</h3>
              <p className="text-gray-300">
                Organize teams, manage rosters, and coordinate with your squad seamlessly.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

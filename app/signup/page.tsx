'use client';

import Google from "@/components/icons/google";
import Logo from "@/components/icons/logo";
import Valorant from "@/components/icons/valorant";
import CS2 from "@/components/icons/cs2";
import PUBG from "@/components/icons/pubg";
import Dota2 from "@/components/icons/dota2";
import LOL from "@/components/icons/lol";
import FreeFire from "@/components/icons/freefire";
import MLBB from "@/components/icons/mlbb";
import ApexLegends from "@/components/icons/apexlegend";
import CallOfDuty from "@/components/icons/callofduty";
import RainbowSixSiege from "@/components/icons/rainbbowsixsiege";

import { useState } from "react";
import Link from "next/link";
import { authAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const GAMES = [
  "Valorant",
  "CS2",
  "PUBG Mobile",
  "Dota 2",
  "League of Legends",
  "Free Fire",
  "Mobile Legends",
  "Apex Legends",
  "Call of Duty",
  "Rainbow Six Siege",
  "Other",
];

// Game icon mapping
const GAME_ICONS: { [key: string]: React.ComponentType<any> } = {
  "Valorant": Valorant,
  "CS2": CS2,
  "PUBG Mobile": PUBG,
  "Dota 2": Dota2,
  "League of Legends": LOL,
  "Free Fire": FreeFire,
  "Mobile Legends": MLBB,
  "Apex Legends": ApexLegends,
  "Call of Duty": CallOfDuty,
  "Rainbow Six Siege": RainbowSixSiege,
};

const COUNTRIES = [
  "Nepal",
  "India",
  "Bangladesh",
  "Pakistan",
  "Sri Lanka",
  "USA",
  "UK",
  "Canada",
  "Australia",
  "Other",
];

const RANK_OPTIONS: { [key: string]: string[] } = {
  Valorant: ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Ascendant", "Immortal", "Radiant"],
  CS2: ["Silver", "Gold Nova", "Master Guardian", "Legendary Eagle", "Supreme", "Global Elite"],
  "PUBG Mobile": ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Crown", "Ace", "Conqueror"],
  "Dota 2": ["Herald", "Guardian", "Crusader", "Archon", "Legend", "Ancient", "Divine", "Immortal"],
  "League of Legends": ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Challenger"],
  "Free Fire": ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Heroic", "Grand Master"],
  "Mobile Legends": ["Warrior", "Elite", "Master", "Grandmaster", "Epic", "Legend", "Mythic", "Mythical Glory"],
  "Apex Legends": ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Predator"],
  "Call of Duty": ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Crimson", "Iridescent", "Top 250"],
  "Rainbow Six Siege": ["Copper", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Champion"],
  Other: ["Unranked", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Challenger"],
};

const SignUpPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(0); // Start with step 0 for account type selection

  // Step 0: Account Type Selection
  const [accountType, setAccountType] = useState<"player" | "organization" | "">("");

  // Step 1: Basic Info
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // For players
  const [organizationName, setOrganizationName] = useState(""); // For organizations
  const [tag, setTag] = useState(""); // For organizations
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2: Profile/Organization Details
  const [realName, setRealName] = useState(""); // For players
  const [description, setDescription] = useState(""); // For organizations
  const [country, setCountry] = useState("");
  const [isNepal, setIsNepal] = useState(false);

  // Step 3: Games (for players only)
  const [selectedGames, setSelectedGames] = useState<
    Array<{ game: string; rank: string; role?: string; inGameName?: string; isPrimary: boolean }>
  >([]);
  const [currentGame, setCurrentGame] = useState("");
  const [currentRank, setCurrentRank] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [currentInGameName, setCurrentInGameName] = useState("");
  const [customGameName, setCustomGameName] = useState("");
  const [customRank, setCustomRank] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNextStep = () => {
    setError("");

    if (step === 0) {
      if (!accountType) {
        setError("Please select an account type");
        return;
      }
      setStep(1);
    } else if (step === 1) {
      // Validate based on account type
      if (accountType === "player") {
        if (!email || !username || !password || !confirmPassword) {
          setError("Please fill in all fields");
          return;
        }
      } else {
        if (!email || !organizationName || !tag || !password || !confirmPassword) {
          setError("Please fill in all fields");
          return;
        }
        if (tag.length < 2 || tag.length > 10) {
          setError("Tag must be between 2 and 10 characters");
          return;
        }
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (accountType === "player") {
        if (!realName || !country) {
          setError("Please fill in all required fields");
          return;
        }
        setStep(3);
      } else {
        // Organizations don't need step 3
        if (!country) {
          setError("Please select a country");
          return;
        }
        handleSignUp(); // Directly sign up organizations
      }
    }
  };

  const handlePreviousStep = () => {
    setError("");
    if (step === 0) return;
    setStep(step - 1);
  };

  const handleAddGame = () => {
    let gameName = currentGame;
    let gameRank = currentRank;

    // Handle "Other" game with custom inputs
    if (currentGame === "Other") {
      if (!customGameName.trim() || !customRank.trim()) {
        setError("Please enter both game name and rank");
        return;
      }
      gameName = customGameName.trim();
      gameRank = customRank.trim();
    } else {
      if (!currentGame || !currentRank) {
        setError("Please select both game and rank");
        return;
      }
    }

    if (selectedGames.some((g) => g.game === gameName)) {
      setError("Game already added");
      return;
    }

    setSelectedGames([
      ...selectedGames,
      {
        game: gameName,
        rank: gameRank,
        role: currentRole || undefined,
        inGameName: currentInGameName || undefined,
        isPrimary: selectedGames.length === 0
      },
    ]);
    setCurrentGame("");
    setCurrentRank("");
    setCurrentRole("");
    setCurrentInGameName("");
    setCustomGameName("");
    setCustomRank("");
    setError("");
  };

  const handleRemoveGame = (gameName: string) => {
    setSelectedGames(selectedGames.filter((g) => g.game !== gameName));
  };

  const handleSetPrimary = (gameName: string) => {
    setSelectedGames(
      selectedGames.map((g) => ({
        ...g,
        isPrimary: g.game === gameName,
      }))
    );
  };

  const handleSignUp = async () => {
    setError("");
    setSuccess("");

    if (accountType === "player" && selectedGames.length === 0) {
      setError("Please add at least one game");
      return;
    }

    setLoading(true);
    try {
      if (accountType === "player") {
        // Create player account
        const signupResponse = await authAPI.signup({
          email,
          username,
          password,
          confirmPassword,
          profileData: {
            realName,
            country,
            isNepal,
            games: selectedGames,
          },
        });

        if (!signupResponse.success) {
          setError(signupResponse.message || "Signup failed");
          setLoading(false);
          return;
        }

        setSuccess("Player account created successfully! Please verify your email to login.");
      } else {
        // Create organization account
        const response = await axios.post(`${API_URL}/api/org-auth/signup`, {
          email,
          password,
          confirmPassword,
          organizationName,
          tag: tag.toUpperCase(),
          country,
          isNepal,
          description,
        });

        setSuccess("Organization account created successfully! Please verify your email to login.");
      }

      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    console.log("Sign up with Google");
  };

  const getTotalSteps = () => {
    return accountType === "player" ? 4 : 3; // 0: Type, 1: Basic, 2: Details, 3: Games (player only)
  };

  return (
    <div className="min-h-screen w-full bg-primary-gradient flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Logo */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-3">
        <Logo width={69} height={60} />
        <div className="font-plus-jakarta text-white text-lg sm:text-[20px] font-medium leading-tight">
          Esports<br />Adda
        </div>
      </div>

      {/* Sign Up Card */}
      <div className="w-full max-w-[650px] mx-auto">
        <div className="bg-white/5 backdrop-blur-[3.1px] rounded-[20px] shadow-[4px_4px_21.2px_rgba(0,0,0,0.25)] p-6 sm:p-8 md:p-10">
          {/* Progress Indicator */}
          {accountType && (
            <div className="flex items-center justify-center mb-6 gap-2">
              {Array.from({ length: getTotalSteps() }).map((_, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= index
                        ? "bg-white text-black"
                        : "bg-white/20 text-white/50"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < getTotalSteps() - 1 && (
                    <div
                      className={`w-12 h-1 ${
                        step > index ? "bg-white" : "bg-white/20"
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step Title */}
          <h1 className="text-white text-center font-inter text-3xl sm:text-4xl lg:text-[36px] font-bold tracking-[-0.72px] mb-2">
            {step === 0 && "Choose Account Type"}
            {step === 1 && "Create Account"}
            {step === 2 && (accountType === "player" ? "Profile Details" : "Organization Details")}
            {step === 3 && "Your Games"}
          </h1>
          <p className="text-white/70 text-center mb-6">
            {step === 0 && "Are you a player or an organization?"}
            {step === 1 && "Let's start with the basics"}
            {step === 2 && (accountType === "player" ? "Tell us about yourself" : "Tell us about your organization")}
            {step === 3 && "What games do you play?"}
          </p>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg mb-4">
              <p className="text-red-500 text-sm font-inter">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500 rounded-lg mb-4">
              <p className="text-green-500 text-sm font-inter">{success}</p>
            </div>
          )}

          {/* Step 0: Account Type Selection */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setAccountType("player")}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    accountType === "player"
                      ? "bg-white/10 border-white"
                      : "bg-white/5 border-white/20 hover:border-white/40"
                  }`}
                >
                  <div className="text-4xl mb-3">🎮</div>
                  <h3 className="text-white font-bold text-xl mb-2">Player Account</h3>
                  <p className="text-white/70 text-sm">
                    For individual gamers who want to showcase their skills, join teams, and participate in tournaments
                  </p>
                </button>

                <button
                  onClick={() => setAccountType("organization")}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    accountType === "organization"
                      ? "bg-white/10 border-white"
                      : "bg-white/5 border-white/20 hover:border-white/40"
                  }`}
                >
                  <div className="text-4xl mb-3">🏢</div>
                  <h3 className="text-white font-bold text-xl mb-2">Organization Account</h3>
                  <p className="text-white/70 text-sm">
                    For esports organizations managing multiple teams, staff, and tournament streams
                  </p>
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-white font-plus-jakarta text-base">
                  Already have an account?{" "}
                </span>
                <Link
                  href="/login"
                  className="text-white font-plus-jakarta text-base font-bold hover:underline transition-all"
                >
                  Log In
                </Link>
              </div>

              <button
                onClick={handleNextStep}
                disabled={!accountType}
                className="w-full bg-transparent border-2 border-white rounded-lg py-4 text-white font-plus-jakarta text-lg font-semibold hover:bg-white/10 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Google Sign Up Button - Only for players */}
              {accountType === "player" && (
                <>
                  <button
                    onClick={handleGoogleSignUp}
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] hover:bg-gray-50 active:scale-[0.98] transition-all duration-200"
                  >
                    <Google height={24} width={24}/>
                    <span className="font-plus-jakarta text-gray-800 text-base font-semibold">
                      Sign Up with Google
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-[1px] bg-[#D9D9D9]"></div>
                    <span className="text-[#D1D6E2] font-inter text-sm">or with e-mail</span>
                    <div className="flex-1 h-[1px] bg-[#D9D9D9]"></div>
                  </div>
                </>
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-4 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
              />

              {accountType === "player" ? (
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-4 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                />
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Organization Name"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full px-3.5 py-4 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                  />
                  <input
                    type="text"
                    placeholder="Organization Tag (e.g., TSM, FNC)"
                    value={tag}
                    onChange={(e) => setTag(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-4 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 uppercase"
                    maxLength={10}
                  />
                  <p className="text-white/60 text-sm -mt-3">Tag must be 2-10 characters</p>
                </>
              )}

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-4 pr-12 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-4 pr-12 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handlePreviousStep}
                  className="flex-1 bg-white/10 border-2 border-white/30 rounded-lg py-4 text-white font-plus-jakarta text-lg font-semibold hover:bg-white/20 active:scale-[0.98] transition-all duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 bg-transparent border-2 border-white rounded-lg py-4 text-white font-plus-jakarta text-lg font-semibold hover:bg-white/10 active:scale-[0.98] transition-all duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Profile/Organization Details */}
          {step === 2 && (
            <div className="space-y-5">
              {accountType === "player" ? (
                <input
                  type="text"
                  placeholder="Real Name *"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  className="w-full px-3.5 py-4 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                />
              ) : (
                <textarea
                  placeholder="Organization Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-4 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                  maxLength={2000}
                />
              )}

              <div>
                <label className="block text-white mb-2 font-inter">Country *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COUNTRIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCountry(c);
                        setIsNepal(c === "Nepal");
                      }}
                      className={`px-4 py-3 rounded-lg font-inter text-sm transition-all ${
                        country === c
                          ? "bg-white text-black font-semibold"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handlePreviousStep}
                  className="flex-1 bg-white/10 border-2 border-white/30 rounded-lg py-4 text-white font-plus-jakarta text-lg font-semibold hover:bg-white/20 active:scale-[0.98] transition-all duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={loading}
                  className="flex-1 bg-transparent border-2 border-white rounded-lg py-4 text-white font-plus-jakarta text-lg font-semibold hover:bg-white/10 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {accountType === "organization"
                    ? (loading ? "Creating Account..." : "Complete Sign Up")
                    : "Next"
                  }
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Games (Players Only) */}
          {step === 3 && accountType === "player" && (
            <div className="space-y-5">
              <div>
                <label className="block text-white mb-2 font-inter">What games do you play?</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-white/5 rounded-lg">
                  {GAMES.map((game) => {
                    const GameIcon = GAME_ICONS[game];
                    return (
                      <button
                        key={game}
                        type="button"
                        onClick={() => setCurrentGame(game)}
                        disabled={selectedGames.some((g) => g.game === game)}
                        className={`px-3 py-2 rounded-lg font-inter text-sm transition-all flex items-center gap-2 ${
                          currentGame === game
                            ? "bg-white text-black font-semibold"
                            : selectedGames.some((g) => g.game === game)
                            ? "bg-white/5 text-white/30 cursor-not-allowed"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {GameIcon && (
                          <span className={currentGame === game ? "text-black" : "text-white"}>
                            <GameIcon width={16} height={16} />
                          </span>
                        )}
                        <span className="flex-1 text-left">{game}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {currentGame && currentGame !== "Other" && (
                <div>
                  <label className="block text-white mb-2 font-inter">
                    What's your rank in {currentGame}?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-white/5 rounded-lg">
                    {RANK_OPTIONS[currentGame]?.map((rank) => (
                      <button
                        key={rank}
                        type="button"
                        onClick={() => setCurrentRank(rank)}
                        className={`px-3 py-2 rounded-lg font-inter text-sm transition-all ${
                          currentRank === rank
                            ? "bg-white text-black font-semibold"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {rank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Role and IGN fields - shown when game is selected */}
              {currentGame && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-2 font-inter">
                      Role (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Duelist, AWPer, IGL, Support"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      className="w-full px-3.5 py-3 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-inter">
                      In-Game Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Your IGN"
                      value={currentInGameName}
                      onChange={(e) => setCurrentInGameName(e.target.value)}
                      className="w-full px-3.5 py-3 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                    />
                  </div>
                </div>
              )}

              {currentGame === "Other" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-2 font-inter">
                      What game do you play?
                    </label>
                    <input
                      type="text"
                      placeholder="Enter game name (e.g., Fortnite, Overwatch)"
                      value={customGameName}
                      onChange={(e) => setCustomGameName(e.target.value)}
                      className="w-full px-3.5 py-3 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-white mb-2 font-inter">
                      What's your rank in this game?
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your rank (e.g., Gold, Diamond, Champion)"
                      value={customRank}
                      onChange={(e) => setCustomRank(e.target.value)}
                      className="w-full px-3.5 py-3 bg-white border border-gray-300 rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] text-gray-500 font-inter text-base placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30"
                    />
                  </div>
                </div>
              )}

              {((currentGame && currentRank) || (currentGame === "Other" && customGameName && customRank)) && (
                <button
                  onClick={handleAddGame}
                  className="w-full bg-green-600 border-2 border-green-500 rounded-lg py-3 text-white font-plus-jakarta text-base font-semibold hover:bg-green-700 active:scale-[0.98] transition-all duration-200"
                >
                  + Add {currentGame === "Other" ? customGameName || "Game" : currentGame}
                </button>
              )}

              {/* Selected Games */}
              {selectedGames.length > 0 && (
                <div className="mt-4">
                  <label className="block text-white mb-2 font-inter">Your Games</label>
                  <div className="space-y-2">
                    {selectedGames.map((game) => {
                      const GameIcon = GAME_ICONS[game.game];
                      return (
                        <div
                          key={game.game}
                          className="bg-white/10 border border-white/20 rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex-1 flex items-center gap-3">
                            {GameIcon && (
                              <GameIcon width={20} height={20} />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-white font-semibold">{game.game}</h3>
                                {game.isPrimary && (
                                  <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                                    PRIMARY
                                  </span>
                                )}
                              </div>
                              <p className="text-white/70 text-sm">Rank: {game.rank}</p>
                              {game.role && (
                                <p className="text-white/70 text-sm">Role: {game.role}</p>
                              )}
                              {game.inGameName && (
                                <p className="text-white/70 text-sm">IGN: {game.inGameName}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!game.isPrimary && (
                              <button
                                onClick={() => handleSetPrimary(game.game)}
                                className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold"
                              >
                                Set Primary
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveGame(game.game)}
                              className="text-red-400 hover:text-red-300 text-sm font-semibold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handlePreviousStep}
                  className="flex-1 bg-white/10 border-2 border-white/30 rounded-lg py-4 text-white font-plus-jakarta text-lg font-semibold hover:bg-white/20 active:scale-[0.98] transition-all duration-200"
                >
                  Back
                </button>
                <button
                  onClick={handleSignUp}
                  disabled={loading || selectedGames.length === 0}
                  className="flex-1 bg-transparent border-2 border-white rounded-lg py-4 text-white font-plus-jakarta text-lg font-semibold hover:bg-white/10 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Account..." : "Complete Sign Up"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

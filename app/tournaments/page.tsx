'use client';

import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import Image from "next/image";
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const Tournaments: NextPage = () => {
  const [selectedGame, setSelectedGame] = useState('All Games');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [prizePoolRange, setPrizePoolRange] = useState({ min: 0, max: 1000000 });
  const [entryFeeRange, setEntryFeeRange] = useState({ min: 0, max: 10000 });
  const [showGameDropdown, setShowGameDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPrizePoolDropdown, setShowPrizePoolDropdown] = useState(false);
  const [showEntryFeeDropdown, setShowEntryFeeDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('Start Date');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [allTournaments, setAllTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedTournamentId, setSelectedTournamentId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [currentUserOrgId, setCurrentUserOrgId] = useState<string | null>(null);

  // Fetch tournaments from API
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tournaments`);
        const tournaments = response.data.data.tournaments || [];

        // Transform API data to match the component's format
        const transformedTournaments = tournaments.map((tournament: any) => ({
          id: tournament._id,
          game: tournament.game === "Other" ? tournament.customGame : tournament.game,
          title: tournament.name,
          status: tournament.status === "registration_open" ? "Upcoming" :
                  tournament.status === "registration_closed" ? "Registration Closed" :
                  tournament.status === "ongoing" ? "Ongoing" :
                  tournament.status === "completed" ? "Completed" : "Upcoming",
          rawStatus: tournament.status,
          description: tournament.description || "",
          teams: {
            current: tournament.participants?.length || 0,
            max: tournament.totalSlots
          },
          date: new Date(tournament.tournamentStartDate).toISOString().split('T')[0],
          time: new Date(tournament.tournamentStartDate).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          prizePool: tournament.prizePool?.amount || 0,
          entryFee: 0, // Can be added to tournament model later
          iconBg: '#FB2C36', // Default color
          startDate: new Date(tournament.tournamentStartDate),
          organizerName: tournament.organizerName,
          organizerId: tournament.organizer?._id || tournament.organizer,
          matchmakingType: tournament.matchmakingType,
          streamUrl: tournament.streamUrl,
          discordUrl: tournament.discordUrl,
          participants: tournament.participants || [],
          registrationStartDate: tournament.registrationStartDate,
          registrationEndDate: tournament.registrationEndDate,
          winner: tournament.winner || null,
        }));

        setAllTournaments(transformedTournaments);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        setLoading(false);
      }
    };

    const fetchUserTeams = async () => {
      try {
        const token = localStorage.getItem("token");
        const accountType = localStorage.getItem("accountType");

        if (token) {
          if (accountType === "player") {
            const response = await axios.get(`${API_URL}/api/profile/my`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const teams = response.data.data.profile.teams || [];
            console.log("Player teams loaded:", teams);
            setUserTeams(teams);
          } else if (accountType === "organization") {
            const response = await axios.get(`${API_URL}/api/org-auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const org = response.data.data.organization;
            const teams = org.teams || [];
            console.log("Organization teams loaded:", teams);
            setUserTeams(teams);
            setCurrentUserOrgId(org._id);
          }
        }
      } catch (error) {
        console.error("Error fetching user teams:", error);
      }
    };

    fetchTournaments();
    fetchUserTeams();
  }, []);

  const handleJoinTournament = (tournamentId: string) => {
    const token = localStorage.getItem("token");
    const accountType = localStorage.getItem("accountType");

    if (!token) {
      setRegistrationError("Please login to register for tournaments");
      return;
    }

    if (accountType !== "player" && accountType !== "organization") {
      setRegistrationError("Only players and organizations can register for tournaments");
      return;
    }

    if (userTeams.length === 0) {
      const errorMsg = accountType === "player"
        ? "You need to be part of a team to register"
        : "Your organization needs to have a team to register";
      setRegistrationError(errorMsg);
      return;
    }

    setSelectedTournamentId(tournamentId);
    setSelectedTeamId(userTeams[0]._id);
    setShowRegistrationModal(true);
    setRegistrationError("");
  };

  const handleRegisterTeam = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = `${API_URL}/api/tournaments/${selectedTournamentId}/register`;

      console.log("Registering team:", {
        url,
        tournamentId: selectedTournamentId,
        teamId: selectedTeamId,
        hasToken: !!token,
        API_URL
      });

      const response = await axios.post(
        url,
        { teamId: selectedTeamId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Registration successful:", response.data);
      setRegistrationSuccess("Team registered successfully!");
      setShowRegistrationModal(false);

      // Refresh tournaments
      const tournamentsResponse = await axios.get(`${API_URL}/api/tournaments`);
      const tournaments = tournamentsResponse.data.data.tournaments || [];
      const transformedTournaments = tournaments.map((tournament: any) => ({
        id: tournament._id,
        game: tournament.game === "Other" ? tournament.customGame : tournament.game,
        title: tournament.name,
        status: tournament.status === "registration_open" ? "Upcoming" :
                tournament.status === "ongoing" ? "Ongoing" :
                tournament.status === "completed" ? "Completed" : "Upcoming",
        description: tournament.description || "",
        teams: {
          current: tournament.participants?.length || 0,
          max: tournament.totalSlots
        },
        date: new Date(tournament.tournamentStartDate).toISOString().split('T')[0],
        time: new Date(tournament.tournamentStartDate).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        prizePool: tournament.prizePool?.amount || 0,
        entryFee: 0,
        iconBg: '#FB2C36',
        startDate: new Date(tournament.tournamentStartDate),
        organizerName: tournament.organizerName,
        matchmakingType: tournament.matchmakingType,
        streamUrl: tournament.streamUrl,
        discordUrl: tournament.discordUrl,
        participants: tournament.participants || [],
      }));
      setAllTournaments(transformedTournaments);

      setTimeout(() => setRegistrationSuccess(""), 3000);
    } catch (error: any) {
      console.error("Registration error - Full error object:", error);
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);

      if (error.response) {
        // Server responded with error
        console.error("Server error response:", error.response.data);
        console.error("Server error status:", error.response.status);

        // Try to extract error message from various possible formats
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          (typeof error.response.data === 'string' ? error.response.data : null) ||
          `Registration failed with status ${error.response.status}`;

        setRegistrationError(errorMessage);
      } else if (error.request) {
        // Request was made but no response
        console.error("No response received:", error.request);
        setRegistrationError("No response from server. Please check if the backend is running.");
      } else {
        // Something else happened
        console.error("Request setup error:", error.message);
        setRegistrationError("Failed to send request: " + error.message);
      }
    }
  };

  const isUserTeamRegistered = (tournament: any) => {
    if (!userTeams.length) return false;
    const userTeamIds = userTeams.map(team => team._id);
    return tournament.participants?.some((p: any) => userTeamIds.includes(p.team));
  };

  const handleViewDetails = (tournament: any) => {
    setSelectedTournament(tournament);
    setShowDetailsModal(true);
  };

  const competitiveGames = [
    'All Games',
    'Valorant',
    'Counter-Strike 2',
    'CS:GO',
    'Dota 2',
    'League of Legends',
    'PUBG Mobile',
    'PUBG',
    'Free Fire',
    'Call of Duty',
    'Apex Legends',
    'Fortnite',
    'Overwatch 2',
    'Rainbow Six Siege',
    'Rocket League'
  ];

  const statusOptions = ['All Status', 'Upcoming', 'Ongoing', 'Completed'];

  const prizePoolRanges = [
    { label: 'Any Amount', min: 0, max: 1000000 },
    { label: 'Under NPR 25,000', min: 0, max: 25000 },
    { label: 'NPR 25,000 - 50,000', min: 25000, max: 50000 },
    { label: 'NPR 50,000 - 100,000', min: 50000, max: 100000 },
    { label: 'NPR 100,000+', min: 100000, max: 1000000 }
  ];

  const entryFeeRanges = [
    { label: 'All', min: 0, max: 10000 },
    { label: 'Free', min: 0, max: 0 },
    { label: 'Under NPR 500', min: 0, max: 500 },
    { label: 'NPR 500 - 1,000', min: 500, max: 1000 },
    { label: 'NPR 1,000+', min: 1000, max: 10000 }
  ];

  const sortOptions = ['Start Date', 'Prize Pool (High to Low)', 'Prize Pool (Low to High)', 'Entry Fee', 'Teams Registered'];

  // Filter tournaments
  const filteredTournaments = allTournaments.filter(tournament => {
    // Game filter
    if (selectedGame !== 'All Games' && tournament.game !== selectedGame) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'All Status' && tournament.status !== selectedStatus) {
      return false;
    }

    // Prize Pool filter
    if (tournament.prizePool < prizePoolRange.min || tournament.prizePool > prizePoolRange.max) {
      return false;
    }

    // Entry Fee filter
    const selectedRange = entryFeeRanges.find(r => r.min === entryFeeRange.min && r.max === entryFeeRange.max);
    if (selectedRange?.label === 'Free') {
      if (tournament.entryFee !== 0) return false;
    } else if (tournament.entryFee < entryFeeRange.min || tournament.entryFee > entryFeeRange.max) {
      return false;
    }

    return true;
  });

  // Sort tournaments
  const sortedTournaments = [...filteredTournaments].sort((a, b) => {
    switch (sortBy) {
      case 'Start Date':
        return a.startDate.getTime() - b.startDate.getTime();
      case 'Prize Pool (High to Low)':
        return b.prizePool - a.prizePool;
      case 'Prize Pool (Low to High)':
        return a.prizePool - b.prizePool;
      case 'Entry Fee':
        return a.entryFee - b.entryFee;
      case 'Teams Registered':
        return b.teams.current - a.teams.current;
      default:
        return 0;
    }
  });

  const getStatusBadgeStyle = (status: string) => {
    switch(status) {
      case 'Upcoming':
        return { backgroundColor: 'rgba(0, 201, 80, 0.2)', borderColor: 'rgba(0, 201, 80, 0.3)', color: '#7BF1A8' };
      case 'Ongoing':
        return { backgroundColor: 'rgba(240, 177, 0, 0.2)', borderColor: 'rgba(240, 177, 0, 0.3)', color: '#FFDF20' };
      case 'Completed':
        return { backgroundColor: 'rgba(155, 155, 155, 0.2)', borderColor: 'rgba(155, 155, 155, 0.3)', color: '#CCCCCC' };
      default:
        return { backgroundColor: 'rgba(0, 201, 80, 0.2)', borderColor: 'rgba(0, 201, 80, 0.3)', color: '#7BF1A8' };
    }
  };

  const getGameIcon = (game: string) => {
    switch(game) {
      case 'Valorant':
        return (
          <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.1939 1.64566C18.1638 1.65993 18.138 1.68181 18.1189 1.70913C15.5307 4.94384 12.9434 8.17854 10.3572 11.4132C10.2754 11.4844 10.3381 11.6335 10.4482 11.6159C12.3133 11.6182 14.1776 11.6159 16.0428 11.6167C16.1233 11.6208 16.2036 11.6056 16.2771 11.5724C16.3505 11.5391 16.4149 11.4887 16.4649 11.4255L18.2421 9.20554C18.3233 9.09829 18.3625 8.965 18.3522 8.83084C18.3506 6.47784 18.3522 4.1256 18.3499 1.7726C18.3621 1.68848 18.2734 1.61584 18.1939 1.64566ZM0.0588806 1.65636C-1.768e-06 1.68542 0.00229235 1.75731 0.000762939 1.81313C0.00178255 4.16435 0.00203745 6.51582 0.00152765 8.86754C-0.0035164 8.99646 0.0395474 9.12266 0.122351 9.2216L5.9647 16.5245C6.05647 16.6408 6.20023 16.7157 6.35088 16.7134C8.22823 16.7134 10.1056 16.7157 11.9829 16.7134C12.0915 16.7287 12.1527 16.5804 12.0716 16.5108C8.15253 11.6052 4.22576 6.70342 0.305881 1.79707C0.244704 1.72519 0.172822 1.58907 0.0596453 1.65636H0.0588806Z" fill="white"/>
          </svg>
        );
      case 'CS:GO':
      case 'Counter-Strike 2':
        return (
          <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.6018 2.47384C16.5995 2.47408 16.5972 2.47381 16.595 2.47305C16.5929 2.47229 16.5909 2.47106 16.5893 2.46945C16.5877 2.46783 16.5865 2.46588 16.5857 2.46373C16.585 2.46158 16.5847 2.45928 16.5849 2.45702C16.5865 2.39507 16.588 2.17407 16.5888 2.13278C16.5888 2.03413 16.4794 1.99284 16.4266 2.06931L16.2515 2.32396C16.25 2.32661 16.2478 2.32876 16.245 2.33012C16.2423 2.33148 16.2392 2.332 16.2362 2.3316H11.2274C11.2227 2.33171 11.218 2.33088 11.2136 2.32916C11.2092 2.32745 11.2052 2.32489 11.2018 2.32162C11.1983 2.31835 11.1956 2.31445 11.1937 2.31012C11.1918 2.3058 11.1908 2.30115 11.1907 2.29643L11.1808 2.16107C11.1807 2.15569 11.1818 2.15036 11.184 2.14546C11.1862 2.14055 11.1895 2.13619 11.1936 2.13269C11.1977 2.12919 11.2025 2.12663 11.2076 2.12519C11.2128 2.12375 11.2183 2.12347 11.2236 2.12437L11.4798 2.14884C11.4906 2.14972 11.5013 2.14674 11.5101 2.14044C11.519 2.13415 11.5253 2.12493 11.5279 2.11443L11.7145 1.35813C11.7159 1.34968 11.7143 1.34101 11.7102 1.33352C11.706 1.32603 11.6995 1.32016 11.6916 1.31684L11.518 1.25184C11.513 1.25008 11.5085 1.24703 11.505 1.24301C11.5015 1.23899 11.4991 1.23412 11.4981 1.2289C11.4668 1.09813 11.2098 0.217193 9.97405 0.0206632C9.37222 -0.074925 8.9784 0.181251 8.76811 0.386193C8.67488 0.477704 8.59691 0.583554 8.53716 0.699722L8.46299 0.86184C8.44771 0.920734 8.43597 0.980487 8.42781 1.04078L8.46681 1.79172C8.46707 1.80433 8.47016 1.81671 8.47585 1.82797C8.48154 1.83922 8.48969 1.84904 8.49969 1.85672L8.7704 1.97372L8.62052 2.22225C8.61802 2.23107 8.61271 2.23883 8.60539 2.24435C8.59807 2.24987 8.58915 2.25285 8.57999 2.25284C8.57999 2.25284 8.26111 2.26049 8.10434 2.26813C7.80916 2.2796 7.15228 2.63902 6.66822 3.67366L6.11458 4.85896C6.10999 4.86869 6.10257 4.87682 6.0933 4.88227C6.08402 4.88773 6.07331 4.89026 6.06258 4.88955L5.62058 4.89031C5.59381 4.89031 5.56475 4.91172 5.55328 4.93619L4.86658 6.88237C4.86135 6.89607 4.85981 6.91091 4.86209 6.92539C4.86437 6.93988 4.8704 6.95352 4.87958 6.96496L5.35905 7.26472C5.36535 7.27005 5.3701 7.27699 5.37279 7.2848C5.37548 7.2926 5.37602 7.30099 5.37434 7.30907L5.12352 8.04854C5.12033 8.06522 5.11438 8.08124 5.10593 8.09596L4.77328 8.38807C4.75916 8.39968 4.74967 8.41596 4.74652 8.43396L4.28922 9.60396C4.28662 9.61405 4.28066 9.62296 4.27232 9.62921C4.26398 9.63547 4.25376 9.6387 4.24334 9.63837L3.9864 9.6399C3.95525 9.63997 3.92525 9.65171 3.90232 9.6728C3.87939 9.69389 3.86519 9.7228 3.86252 9.75384L3.70881 11.5035L3.69658 11.596L3.57575 12.2904C3.57077 12.3064 3.56182 12.3208 3.54975 12.3324L3.12305 12.659C2.89472 12.8872 2.69751 13.1446 2.53652 13.4244L1.11416 16.4251C1.07732 16.5021 1.057 16.586 1.05452 16.6714L1.15546 16.8511C1.15699 16.9153 1.13099 17.1998 1.10193 17.2564L0.624752 18.0899C0.619615 18.0999 0.616747 18.1109 0.61635 18.1221C0.615954 18.1334 0.618039 18.1446 0.622458 18.1549L0.645399 18.2084L0.717281 18.3514L2.16334 18.353C2.25358 18.3614 2.35222 18.2459 2.35528 18.1235L2.43405 17.1317L2.4134 16.9826L5.17093 13.7464C5.24358 13.6592 5.34069 13.504 5.38963 13.4022L6.70416 10.504C6.71172 10.4882 6.72239 10.4741 6.73553 10.4626C6.74867 10.451 6.76401 10.4422 6.78063 10.4367L6.86399 10.41C6.88869 10.402 6.91523 10.4016 6.94017 10.4088C6.96511 10.416 6.98732 10.4305 7.00393 10.4505C7.11864 10.5889 7.38934 11.0477 7.52087 11.2397C7.63022 11.3987 8.17087 12.1803 8.4064 12.438C8.47216 12.5091 8.67328 12.5894 8.76275 12.6444C8.777 12.6529 8.78737 12.6666 8.79166 12.6826C8.79594 12.6986 8.7938 12.7156 8.78569 12.7301L7.99805 14.1127L7.6501 15.7461C7.63791 15.784 7.62871 15.8229 7.62258 15.8623L7.30752 16.9964C7.30981 17.1401 7.20046 17.2151 7.19052 17.3841L7.07581 18.213C7.07571 18.219 7.0768 18.225 7.07901 18.2306C7.08122 18.2362 7.08452 18.2414 7.08871 18.2457C7.0929 18.25 7.0979 18.2535 7.10343 18.2559C7.10896 18.2583 7.1149 18.2596 7.12093 18.2597L9.06634 18.2704C9.13873 18.2699 9.21163 18.2683 9.28505 18.2658L9.3424 18.2604C9.43722 18.2482 9.77293 18.2023 9.91593 18.1457C9.9804 18.1258 10.0397 18.0918 10.0895 18.0463C10.231 17.898 10.2425 17.8337 10.2448 17.742C10.2426 17.7141 10.2353 17.6869 10.2233 17.6617C10.2124 17.645 10.1963 17.6324 10.1775 17.6257L9.27511 17.3535C9.21692 17.3358 9.16597 17.2999 9.12981 17.251L8.8874 16.8916C8.88222 16.8792 8.88077 16.8656 8.88321 16.8525C8.88566 16.8393 8.8919 16.8271 8.90117 16.8174L9.37375 16.3517C9.38986 16.3363 9.40239 16.3175 9.41046 16.2967L10.8665 12.8647C10.9345 12.6467 10.9116 12.402 10.8665 12.1428C10.8328 11.9516 10.3419 11.1288 10.2134 10.9009L9.22999 9.17954C9.16958 9.07402 9.08469 9.07784 9.05563 8.96849L8.99981 8.11354C8.99868 8.10919 8.99852 8.10464 8.99934 8.10022C9.00017 8.09579 9.00196 8.09161 9.00459 8.08795C9.00722 8.0843 9.01062 8.08128 9.01455 8.07909C9.01849 8.07691 9.02285 8.07561 9.02734 8.07531L9.27969 8.0539C9.29144 8.05263 9.30273 8.04865 9.31268 8.04228C9.32263 8.03591 9.33097 8.02732 9.33705 8.01719L10.2142 6.36925C10.2198 6.35806 10.2226 6.34565 10.2224 6.33312C10.2221 6.32058 10.2188 6.30831 10.2126 6.29737L10.0329 6.0756C10.0271 6.06539 10.0239 6.05384 10.0238 6.04206C10.0236 6.03027 10.0265 6.01865 10.0322 6.00831L10.3013 5.71772C10.3068 5.70836 10.3157 5.70152 10.3261 5.69866C10.3366 5.6958 10.3477 5.69715 10.3572 5.70243L11.0714 6.10466C11.115 6.1288 11.1638 6.14193 11.2136 6.1429C11.4125 6.14213 11.7382 6.02513 11.908 5.92113C11.9526 5.89318 11.9892 5.8542 12.0143 5.80796L12.3645 4.98972C12.3691 4.97902 12.3852 4.98055 12.3875 4.99202L12.4846 5.44702C12.4858 5.4536 12.4884 5.45986 12.4922 5.4654C12.496 5.47095 12.5008 5.47566 12.5065 5.47924C12.5121 5.48283 12.5185 5.48521 12.5251 5.48624C12.5317 5.48728 12.5385 5.48694 12.545 5.48525L13.5773 5.25584C13.5903 5.25291 13.6015 5.24501 13.6087 5.23385C13.6158 5.22269 13.6183 5.20916 13.6156 5.19619L13.3716 4.16843C13.3701 4.16139 13.3699 4.1541 13.3712 4.147C13.3726 4.1399 13.3753 4.13315 13.3793 4.12713L13.4787 3.9719C13.4912 3.95254 13.5008 3.9314 13.507 3.90919L13.6286 3.35478C13.63 3.34777 13.6339 3.34148 13.6394 3.33701C13.645 3.33254 13.652 3.33017 13.6592 3.33031L16.513 3.33413C16.5225 3.33445 16.5319 3.33283 16.5406 3.32937C16.5494 3.32591 16.5574 3.32068 16.564 3.31402C16.5707 3.30735 16.5759 3.29938 16.5794 3.29061C16.5829 3.28183 16.5845 3.27244 16.5842 3.26302V2.77819C16.584 2.77599 16.5844 2.77378 16.5852 2.77172C16.586 2.76967 16.5873 2.76781 16.5889 2.76629C16.5905 2.76476 16.5924 2.7636 16.5945 2.76288C16.5966 2.76216 16.5988 2.76191 16.601 2.76213H17.7014C17.7108 2.76193 17.7197 2.75806 17.7263 2.75134C17.7329 2.74462 17.7366 2.73559 17.7366 2.72619V2.50825C17.7366 2.49885 17.7329 2.48982 17.7263 2.4831C17.7197 2.47638 17.7108 2.47251 17.7014 2.47231H16.6002L16.6018 2.47384Z" fill="white"/>
          </svg>
        );
      case 'Dota 2':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.81722 23.6071L9.47122 23.3131L9.00322 23.2731C8.41922 23.2251 8.14722 23.1721 7.81722 23.0411L7.55922 22.9381L7.28122 23.0481C7.04522 23.1431 6.46722 23.2291 6.02822 23.2361C6.00422 23.2361 5.96422 23.1801 5.93922 23.1111C5.91122 23.0411 5.86222 22.9741 5.82422 22.9611C5.78922 22.9491 5.52722 23.0071 5.23722 23.0941L4.71222 23.2521L4.52322 23.1611C4.28522 23.0451 4.18522 23.0471 3.78722 23.1681C3.48422 23.2621 3.44622 23.2641 3.20322 23.2121C2.84022 23.1361 2.53722 23.1411 1.85422 23.2381C1.11022 23.3441 1.09422 23.3441 0.87522 23.1941C0.759659 23.1043 0.615269 23.0599 0.46922 23.0691C0.26622 23.0691 0.24422 23.0601 0.22122 22.9651C0.211838 22.8706 0.226635 22.7753 0.26422 22.6881C0.37622 22.4101 0.42022 21.7361 0.43222 20.1251L0.44422 18.6201L0.65522 18.6351L0.86322 18.6501L0.89522 17.7801C0.91122 17.3021 0.92722 16.6111 0.93022 16.2461L0.93522 15.5861L0.82322 15.5061C0.51822 15.2831 0.53222 15.3151 0.40522 14.5881C0.335412 14.1809 0.28668 13.7704 0.25922 13.3581C0.23422 12.8261 0.23622 12.8111 0.33422 12.7001L0.43422 12.5861L0.68222 12.7991C0.82022 12.9161 0.93722 12.9931 0.94822 12.9691C0.98422 12.8561 0.87122 11.5081 0.81322 11.3381C0.775087 11.2396 0.752811 11.1356 0.74722 11.0301C0.74722 10.9621 0.67922 10.7781 0.59422 10.6181L0.44322 10.3291L0.49422 9.81612C0.56122 9.13612 0.47522 8.63612 0.19022 8.03412L0.0652201 7.76312L0.14422 7.09012L0.22822 6.41612L0.14022 6.06712L0.0492201 5.71712L0.15422 5.32612L0.25522 4.93312L0.14022 4.55312L0.0212201 4.17412L0.16422 3.77412C0.30522 3.38512 0.30822 3.36412 0.30522 2.73012C0.30322 2.01612 0.22822 1.55112 0.0802201 1.36512C-0.0467799 1.20312 -0.0257799 1.09212 0.16322 0.919121C0.25322 0.834121 0.32822 0.726121 0.32822 0.681121C0.32822 0.612121 0.35922 0.599121 0.54922 0.595121C0.66922 0.595121 1.03922 0.563121 1.37222 0.525121L1.97922 0.452121L2.77322 0.569121C3.56522 0.684121 3.56622 0.684121 4.65222 0.638121L5.74022 0.591121L5.99722 0.746121L6.25722 0.899121L7.31222 0.884121L8.36822 0.869121L8.72422 0.740121C8.91822 0.669121 9.22922 0.545121 9.41422 0.461121C9.65177 0.359834 9.89561 0.273989 10.1442 0.204121L10.5422 0.0991211L11.0562 0.261121L11.5702 0.425121L12.0142 0.276121L12.4562 0.127121L12.9332 0.285121C13.1962 0.371121 13.6842 0.583121 14.0222 0.757121L14.6332 1.06912L15.2732 1.05112C15.7582 1.03612 15.9242 1.01812 15.9502 0.973121C16.0042 0.840795 16.0486 0.704782 16.0832 0.566121L16.1782 0.215121L16.7832 0.235121C17.2362 0.251121 17.6422 0.299121 18.3842 0.429121L19.3792 0.605121L19.6382 0.501121C19.7782 0.444121 20.0462 0.375121 20.2332 0.351121C20.5462 0.309121 20.6002 0.314121 21.0272 0.422121C21.4252 0.522121 21.5622 0.537121 22.1092 0.537121C22.4542 0.537121 22.8122 0.522121 22.9072 0.506121C23.0702 0.478121 23.0972 0.489121 23.4282 0.728121C23.6212 0.866121 23.7922 1.00112 23.8072 1.03012C23.8242 1.05712 23.8602 1.20312 23.8842 1.35412L23.9302 1.63212L23.7212 2.02812C23.6042 2.24612 23.5072 2.44312 23.5072 2.46612C23.5072 2.48912 23.5552 2.52712 23.6112 2.55412C23.698 2.60974 23.7714 2.68384 23.8262 2.77112L23.9372 2.94112L23.9122 5.22612C23.8972 6.48312 23.8722 7.60412 23.8582 7.71512L23.8312 7.91912L23.4862 7.89712L23.1422 7.87012L23.1132 8.06112C23.0935 8.20159 23.0839 8.34328 23.0842 8.48512C23.0842 8.67712 23.0542 8.77812 22.9242 9.03112L22.7612 9.34212L22.8512 9.47112C22.9012 9.54312 23.0722 9.73612 23.2312 9.90112L23.5232 10.2061L23.4342 10.5291L23.3442 10.8541L23.4512 11.5421C23.5752 12.3691 23.5662 12.5771 23.3632 13.2931C23.3045 13.4882 23.2558 13.6861 23.2172 13.8861C23.2172 13.9611 23.2722 13.9801 23.6442 14.0311C23.8092 14.0521 23.8442 14.0721 23.8442 14.1471C23.8442 14.1961 23.8702 15.2511 23.9042 16.4921C24.0112 20.5671 24.0212 21.4561 23.9712 22.3801C23.9591 22.6778 23.9368 22.975 23.9042 23.2711C23.8942 23.2801 23.5632 23.1471 23.1662 22.9761L22.4432 22.6681L22.1312 22.8031C21.8092 22.9421 21.7772 22.9781 21.7352 23.2451C21.7062 23.4221 21.7282 23.4141 20.9352 23.5761L20.4682 23.6721L20.0142 23.5201C19.5942 23.3791 19.5372 23.3691 19.2062 23.3911C18.9592 23.4061 18.7892 23.3941 18.6442 23.3511C18.4362 23.2921 18.4362 23.2921 18.0872 23.4531L17.7352 23.6121H16.4352C15.0662 23.6101 14.7842 23.6321 13.8412 23.8071C13.1892 23.9271 12.9602 23.9221 11.8192 23.7851L11.2172 23.7111L10.7962 23.8071C10.5622 23.8611 10.3262 23.9031 10.2702 23.9011C10.2022 23.9011 10.0462 23.8001 9.81922 23.6071H9.81722ZM7.28422 19.9181C8.28922 19.5391 9.11822 19.2231 9.12322 19.2161C9.13622 19.2021 5.20622 15.3901 4.68422 14.9091C4.53922 14.7751 4.40922 14.6721 4.39922 14.6821C4.39022 14.6931 4.07022 15.5471 3.69022 16.5771C3.27022 17.7151 3.01122 18.4761 3.03222 18.5081C3.05722 18.5501 5.42422 20.5991 5.45122 20.6051C5.45422 20.6051 6.27922 20.2961 7.28422 19.9181ZM20.7962 17.8291C21.3192 16.5641 21.7322 15.5191 21.7182 15.5041C21.6992 15.4831 11.8882 8.85812 5.02022 4.22612L4.46922 3.85512L3.56922 4.26212C3.07222 4.48412 2.67322 4.68712 2.68022 4.70912C2.69022 4.73712 6.01122 8.21912 10.0642 12.4491L17.4322 20.1411L18.6382 20.1331L19.8472 20.1251L20.7962 17.8291ZM19.4342 6.97212C19.6072 6.01012 19.7502 5.19112 19.7502 5.15112C19.7502 5.10812 19.4972 4.90212 19.0742 4.60512C18.7022 4.34312 18.3732 4.11512 18.3442 4.09612C18.2912 4.06312 14.4422 5.10412 14.4472 5.14912C14.4512 5.17912 19.0912 8.74812 19.1072 8.73112C19.1152 8.72512 19.2612 7.93212 19.4342 6.97212Z" fill="white"/>
          </svg>
        );
      case 'PUBG Mobile':
      case 'PUBG':
        return (
          <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.08985 15.8241C1.00803 15.6352 0.988913 15.5182 0.989678 15.2123C0.989678 14.9248 1.00115 14.8468 1.14874 14.1295C1.20324 13.8715 1.25422 13.6127 1.30168 13.3533C1.22521 13.3105 0.933855 13.0658 0.766384 12.9044C0.391678 12.5435 0.155384 12.1871 0.0460311 11.8224C0.000913418 11.6732 -0.00520423 11.6067 0.00320754 11.3697C0.0131487 11.1089 0.0185017 11.0806 0.100325 10.9116C0.153962 10.8048 0.219922 10.7048 0.296855 10.6134C0.403913 10.4987 0.407737 10.4902 0.440619 10.2578C0.458972 10.127 0.495678 9.88077 0.520913 9.71101C0.562208 9.43571 0.563737 9.38677 0.534678 9.2583C0.448138 8.87016 0.469828 8.46572 0.597384 8.08906C0.871149 7.33201 1.66033 6.80359 2.8915 6.5543C3.82903 6.36389 5.04415 6.35165 6.23633 6.51989C7.41168 6.68659 8.7935 7.06665 10.0683 7.57518C10.2319 7.64095 10.368 7.69142 10.3711 7.68836C10.3818 7.67765 9.39227 7.17754 9.13991 7.06589C8.24076 6.66297 7.29871 6.36357 6.33191 6.17348C5.71403 6.05648 5.52133 6.04118 4.7008 6.04118C3.98885 6.04118 3.88409 6.04654 3.58433 6.09701C3.36862 6.12982 3.15512 6.17578 2.94503 6.23465C2.86856 6.25759 2.90221 6.19948 3.00774 6.12683C3.40233 5.85459 4.04774 5.59918 4.71303 5.4493C5.36533 5.30324 5.3638 5.31395 4.73062 5.32312C4.41938 5.32771 4.16474 5.32465 4.16474 5.31624C4.16474 5.30783 4.18385 5.28489 4.2068 5.26424C4.29639 5.17063 4.3836 5.07475 4.46833 4.97671C4.84533 4.54848 5.4265 4.04377 5.93885 3.70195C6.91615 3.04889 7.89115 2.67342 9.0925 2.48759C9.4825 2.42642 10.6686 2.42642 11.0807 2.48759C12.367 2.67495 13.3473 3.02824 14.2466 3.62701C14.6703 3.90995 14.9073 4.10418 15.2706 4.46895C15.9993 5.20153 16.504 6.01365 16.946 7.16606C17.1831 7.78395 17.4056 8.51195 17.5241 9.05795L17.5792 9.31106L17.7046 9.39901C17.7734 9.44718 17.8446 9.51524 17.8621 9.55042C17.8797 9.58559 17.9891 9.89301 18.1038 10.2341C18.2193 10.5744 18.3225 10.8565 18.3332 10.8611C18.3439 10.8657 18.3531 10.946 18.3531 11.0401C18.3531 11.2029 18.35 11.2121 18.2873 11.2419C18.2063 11.2802 17.4943 11.4369 17.4003 11.4369C17.3031 11.4369 17.2244 11.3528 17.154 11.1747L17.0187 10.8412C16.9774 10.7434 16.8871 10.5231 16.8176 10.3534C16.5866 9.78824 16.592 9.79895 16.5163 9.76759C16.4551 9.74236 16.4184 9.74771 16.2157 9.81653C16.0888 9.86012 15.9481 9.91595 15.9045 9.94271C15.8561 9.9786 15.8159 10.0245 15.7867 10.0773C15.7576 10.13 15.7401 10.1885 15.7355 10.2486C15.7347 10.3182 15.9114 10.8313 15.9565 10.8909C16.0077 10.959 17.1731 11.7398 17.2473 11.7558C17.2932 11.7658 17.4408 11.7451 17.6511 11.6992L17.986 11.6274C17.9883 11.6274 17.9983 11.7918 18.0074 11.9929C18.0235 12.337 18.0212 12.3645 17.9746 12.4571C17.895 12.6131 17.9723 12.5794 16.6975 13.0099C15.6927 13.3495 15.5015 13.39 14.8981 13.39C14.2554 13.3996 13.6228 13.229 13.072 12.8975C12.705 12.6811 12.2676 12.311 12.136 12.1045C12.0343 11.9447 12.0137 12.0739 12.396 10.426C12.4725 10.0995 12.5444 9.82877 12.5574 9.82418C12.5704 9.82036 12.6262 9.90065 12.682 10.0047C12.7379 10.1087 12.8074 10.2081 12.8365 10.2264C12.8656 10.2448 13.056 10.3335 13.2586 10.4245C13.5714 10.5637 13.6524 10.5904 13.7901 10.5988C13.9103 10.6103 14.0312 10.5868 14.1384 10.5312C14.2456 10.4755 14.3344 10.3902 14.3942 10.2853C14.4577 10.1851 14.4684 10.1324 14.5571 9.46706L14.6779 8.56624C14.7529 8.01183 14.7467 7.83442 14.6427 7.61189C14.5257 7.36183 14.3919 7.24942 13.969 7.04524C13.267 6.70571 13.3099 6.71259 12.991 6.88924C12.8701 6.95653 12.7692 7.01236 12.7669 7.01465C12.8467 7.01469 12.9265 7.01315 13.0063 7.01006L13.2494 7.00242L13.6471 7.18595C13.9591 7.33124 14.0715 7.39624 14.1656 7.48571C14.3957 7.70748 14.4661 7.98659 14.4026 8.43471C14.3629 8.71765 14.3376 8.78495 14.2267 8.90501C14.0853 9.05948 13.9713 9.11071 13.771 9.11148C13.6119 9.11148 13.5851 9.10383 13.2112 8.92795C12.822 8.74442 12.8166 8.74289 12.6071 8.73753L12.396 8.73218L12.3662 8.85148L12.2393 9.3753C12.1154 9.88995 11.8745 10.8864 11.6772 11.6985C11.5931 12.0457 11.4799 12.5114 11.4271 12.7347C11.3056 13.2455 11.2635 13.3923 11.1924 13.5567C11.0249 13.9414 10.6655 14.3138 10.2747 14.5088C9.83274 14.7282 9.45191 14.7703 8.87685 14.6655C7.7435 14.4515 6.60009 14.2945 5.45097 14.1952C4.98756 14.1547 3.42068 14.1547 3.11785 14.1952C2.48621 14.2801 2.21015 14.3405 1.94403 14.4529C1.68358 14.559 1.45886 14.7373 1.29633 14.9668C1.16327 15.1634 1.10285 15.5098 1.15027 15.8019C1.17244 15.9372 1.14415 15.9479 1.08985 15.8241ZM1.33227 13.2287C1.33227 13.2072 1.37815 12.9495 1.45844 12.5182C1.53491 12.1068 1.62056 11.9462 1.89891 11.6878C2.3608 11.2595 3.24327 10.9812 4.44615 10.8848C4.87209 10.8504 6.32044 10.8741 6.79533 10.9231C7.7795 11.0232 8.14885 11.0722 8.99768 11.2137C9.6905 11.3291 9.67521 11.3284 9.53297 11.2695C9.01302 11.07 8.48936 10.8803 7.96227 10.7005C7.0278 10.3855 6.47797 10.2585 5.50985 10.1347C5.03191 10.0735 3.60115 10.0727 3.15303 10.1339C2.28891 10.2517 1.66185 10.426 1.18927 10.6822C0.789325 10.8978 0.504855 11.1739 0.38709 11.4622C0.318266 11.6304 0.329737 11.999 0.410031 12.1932C0.504855 12.4219 0.663913 12.6414 0.90709 12.8815C1.2405 13.2088 1.33227 13.2837 1.33227 13.2287ZM0.90556 10.101C1.02027 10.0192 1.40185 9.84865 1.64197 9.77218C2.04344 9.64295 2.3738 9.57642 3.02227 9.49154C3.40233 9.44183 5.0235 9.42042 5.53356 9.45865L6.08109 9.49918C6.2998 9.51601 6.32274 9.49154 6.38085 9.17953L6.52156 8.43471C6.66685 7.67001 6.71121 7.42683 6.71197 7.38324C6.71197 7.30295 6.63015 7.23795 6.49709 7.2173C5.89144 7.11865 4.75738 7.06589 4.00797 7.1003C2.32333 7.17677 1.26803 7.58053 0.871149 8.29783C0.778787 8.45221 0.721606 8.62506 0.703678 8.80406C0.694502 8.89991 0.697051 8.92667 0.711325 8.88436C0.820678 8.55095 1.10897 8.21142 1.41944 8.04777C1.60068 7.95218 1.61827 7.94683 1.61827 7.98048C1.61827 7.99195 1.57009 8.02483 1.51121 8.05389C1.37203 8.12067 1.24127 8.27183 1.11891 8.50736C1.00191 8.73295 0.971325 8.86524 0.891796 9.49459C0.868479 9.68337 0.844008 9.872 0.818384 10.0605C0.802325 10.1637 0.812266 10.1675 0.90556 10.101ZM8.23603 9.9603C8.2865 9.92054 8.29568 9.8953 8.29568 9.77983C8.29568 9.65824 8.28803 9.63912 8.21768 9.57642C8.12591 9.49383 8.07391 9.48924 7.9898 9.55501C7.86668 9.65289 7.8965 9.89148 8.04256 9.97101C8.12668 10.0169 8.16491 10.0146 8.23603 9.9603ZM13.8559 8.49971C14.0264 8.38501 14.0998 8.17777 14.0478 7.95524C13.9576 7.56142 13.5416 7.39701 13.3091 7.66159C13.0927 7.90783 13.1821 8.35748 13.4773 8.50277C13.6134 8.5693 13.7534 8.5693 13.8559 8.49971ZM13.6104 8.25501C13.4674 8.17701 13.423 7.92389 13.5316 7.80689C13.6142 7.71742 13.7496 7.71895 13.8375 7.81148C13.9644 7.94301 13.969 8.13265 13.8497 8.23283C13.7694 8.30012 13.7044 8.30624 13.6104 8.25501ZM8.60309 8.14336C8.67803 8.03706 8.63062 7.8023 8.5228 7.74495C8.45397 7.70748 8.3668 7.71512 8.32627 7.76177C8.21921 7.88412 8.21768 8.00036 8.32397 8.12577C8.40044 8.21754 8.54574 8.22671 8.60386 8.14336H8.60309Z" fill="white"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  return (
    <div style={styles.tournaments}>
      <Header />
      <div style={styles.mainContent}>
        {/* Page Title */}
        <h1 style={styles.pageTitle}>Tournaments</h1>
        <p style={styles.pageSubtitle}>Discover and join competitive gaming tournaments</p>

        {/* Filter Bar */}
        <div style={styles.filterbar}>
          <div style={styles.filterContainer}>
            {/* Game Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Game</label>
              <div style={{ position: 'relative' }}>
                <button
                  style={styles.filterButton}
                  onClick={() => setShowGameDropdown(!showGameDropdown)}
                >
                  <span style={styles.filterButtonText}>{selectedGame}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showGameDropdown && (
                  <div style={styles.dropdown}>
                    {competitiveGames.map((game) => (
                      <div
                        key={game}
                        style={{
                          ...styles.dropdownItem,
                          backgroundColor: selectedGame === game ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
                        }}
                        onClick={() => {
                          setSelectedGame(game);
                          setShowGameDropdown(false);
                        }}
                      >
                        {game}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Status</label>
              <div style={{ position: 'relative' }}>
                <button
                  style={styles.filterButton}
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                >
                  <span style={styles.filterButtonText}>{selectedStatus}</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showStatusDropdown && (
                  <div style={styles.dropdown}>
                    {statusOptions.map((status) => (
                      <div
                        key={status}
                        style={{
                          ...styles.dropdownItem,
                          backgroundColor: selectedStatus === status ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
                        }}
                        onClick={() => {
                          setSelectedStatus(status);
                          setShowStatusDropdown(false);
                        }}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Prize Pool Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Prize Pool</label>
              <div style={{ position: 'relative' }}>
                <button
                  style={styles.filterButton}
                  onClick={() => setShowPrizePoolDropdown(!showPrizePoolDropdown)}
                >
                  <span style={styles.filterButtonText}>
                    {prizePoolRanges.find(r => r.min === prizePoolRange.min && r.max === prizePoolRange.max)?.label || 'Any Amount'}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showPrizePoolDropdown && (
                  <div style={styles.dropdown}>
                    {prizePoolRanges.map((range) => (
                      <div
                        key={range.label}
                        style={{
                          ...styles.dropdownItem,
                          backgroundColor: prizePoolRange.min === range.min && prizePoolRange.max === range.max
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'transparent'
                        }}
                        onClick={() => {
                          setPrizePoolRange({ min: range.min, max: range.max });
                          setShowPrizePoolDropdown(false);
                        }}
                      >
                        {range.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Entry Fee Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Entry Fee</label>
              <div style={{ position: 'relative' }}>
                <button
                  style={styles.filterButton}
                  onClick={() => setShowEntryFeeDropdown(!showEntryFeeDropdown)}
                >
                  <span style={styles.filterButtonText}>
                    {entryFeeRanges.find(r => r.min === entryFeeRange.min && r.max === entryFeeRange.max)?.label || 'All'}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {showEntryFeeDropdown && (
                  <div style={styles.dropdown}>
                    {entryFeeRanges.map((range) => (
                      <div
                        key={range.label}
                        style={{
                          ...styles.dropdownItem,
                          backgroundColor: entryFeeRange.min === range.min && entryFeeRange.max === range.max
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'transparent'
                        }}
                        onClick={() => {
                          setEntryFeeRange({ min: range.min, max: range.max });
                          setShowEntryFeeDropdown(false);
                        }}
                      >
                        {range.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Dynamic from Backend */}
        {allTournaments.length > 0 && (
          <div style={styles.statscards}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 10C0 4.47715 4.47715 0 10 0H38C43.5228 0 48 4.47715 48 10V38C48 43.5228 43.5228 48 38 48H10C4.47715 48 0 43.5228 0 38V10Z" fill="#00C950" fillOpacity="0.2"/>
                  <path d="M22 26.66V28.286C21.9962 28.6286 21.9045 28.9645 21.7336 29.2615C21.5627 29.5585 21.3183 29.8066 21.024 29.982C20.3991 30.4448 19.8908 31.047 19.5395 31.7407C19.1881 32.4344 19.0034 33.2004 19 33.978" stroke="#05DF72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M26 26.66V28.286C26.0038 28.6286 26.0955 28.9645 26.2664 29.2615C26.4373 29.5585 26.6817 29.8066 26.976 29.982C27.6009 30.4448 28.1092 31.047 28.4605 31.7407C28.8119 32.4344 28.9966 33.2004 29 33.978" stroke="#05DF72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M30 21H31.5C32.163 21 32.7989 20.7366 33.2678 20.2678C33.7366 19.7989 34 19.163 34 18.5C34 17.837 33.7366 17.2011 33.2678 16.7322C32.7989 16.2634 32.163 16 31.5 16H30" stroke="#05DF72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 34H32" stroke="#05DF72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 21C18 22.5913 18.6321 24.1174 19.7574 25.2426C20.8826 26.3679 22.4087 27 24 27C25.5913 27 27.1174 26.3679 28.2426 25.2426C29.3679 24.1174 30 22.5913 30 21V15C30 14.7348 29.8946 14.4804 29.7071 14.2929C29.5196 14.1054 29.2652 14 29 14H19C18.7348 14 18.4804 14.1054 18.2929 14.2929C18.1054 14.4804 18 14.7348 18 15V21Z" stroke="#05DF72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 21H16.5C15.837 21 15.2011 20.7366 14.7322 20.2678C14.2634 19.7989 14 19.163 14 18.5C14 17.837 14.2634 17.2011 14.7322 16.7322C15.2011 16.2634 15.837 16 16.5 16H18" stroke="#05DF72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={styles.statNumber}>{allTournaments.filter(t => t.status === 'Upcoming' || t.status === 'Ongoing').length}</div>
              <div style={styles.statLabel}>Active Tournaments</div>
              <div style={styles.statSubtext}>Available to join</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 10C0 4.47715 4.47715 0 10 0H38C43.5228 0 48 4.47715 48 10V38C48 43.5228 43.5228 48 38 48H10C4.47715 48 0 43.5228 0 38V10Z" fill="#2B7FFF" fillOpacity="0.2"/>
                  <path d="M20 15H30L29 17H25.74C26.22 17.58 26.58 18.26 26.79 19H30L29 21H27C26.8757 22.2466 26.3341 23.4147 25.4628 24.315C24.5916 25.2153 23.4419 25.7949 22.2 25.96V26H21.5L27.5 33H25L19 26V24H21.5C23.26 24 24.72 22.7 24.96 21H19L20 19H24.66C24.1 17.82 22.9 17 21.5 17H19L20 15Z" fill="white"/>
                </svg>
              </div>
              <div style={styles.statNumber}>NPR {(allTournaments.reduce((sum, t) => sum + (t.prizePool || 0), 0) / 1000).toFixed(1)}K</div>
              <div style={styles.statLabel}>Total Prize Pool</div>
              <div style={styles.statSubtext}>Across all tournaments</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 10C0 4.47715 4.47715 0 10 0H38C43.5228 0 48 4.47715 48 10V38C48 43.5228 43.5228 48 38 48H10C4.47715 48 0 43.5228 0 38V10Z" fill="#AD46FF" fillOpacity="0.2"/>
                  <path d="M28 33V31C28 29.9391 27.5786 28.9217 26.8284 28.1716C26.0783 27.4214 25.0609 27 24 27H18C16.9391 27 15.9217 27.4214 15.1716 28.1716C14.4214 28.9217 14 29.9391 14 31V33" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M28 15.128C28.8578 15.3504 29.6174 15.8513 30.1597 16.5521C30.702 17.2529 30.9962 18.1139 30.9962 19C30.9962 19.8861 30.702 20.7471 30.1597 21.4479C29.6174 22.1487 28.8578 22.6496 28 22.872" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M34 33V31C33.9993 30.1137 33.7044 29.2528 33.1614 28.5523C32.6184 27.8519 31.8581 27.3516 31 27.13" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 23C23.2091 23 25 21.2091 25 19C25 16.7909 23.2091 15 21 15C18.7909 15 17 16.7909 17 19C17 21.2091 18.7909 23 21 23Z" stroke="#C27AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={styles.statNumber}>{allTournaments.reduce((sum, t) => sum + (t.teams?.current || 0), 0)}</div>
              <div style={styles.statLabel}>Total Participants</div>
              <div style={styles.statSubtext}>Registered teams</div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 10C0 4.47715 4.47715 0 10 0H38C43.5228 0 48 4.47715 48 10V38C48 43.5228 43.5228 48 38 48H10C4.47715 48 0 43.5228 0 38V10Z" fill="#F0B100" fillOpacity="0.2"/>
                  <path d="M24 34C29.5228 34 34 29.5228 34 24C34 18.4772 29.5228 14 24 14C18.4772 14 14 18.4772 14 24C14 29.5228 18.4772 34 24 34Z" stroke="#FFD500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M24 19V24L27 27" stroke="#FFD500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={styles.statNumber}>{allTournaments.length}</div>
              <div style={styles.statLabel}>Total Tournaments</div>
              <div style={styles.statSubtext}>All available</div>
            </div>
          </div>
        )}

        {/* Tournament List */}
        <div style={styles.tournamentList}>
          <div style={styles.tournamentListHeader}>
            <h2 style={styles.tournamentListTitle}>All Tournaments ({sortedTournaments.length})</h2>
            <div style={{ position: 'relative' }}>
              <button
                style={styles.sortButton}
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              >
                Sort by: {sortBy}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6L8 10L12 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {showSortDropdown && (
                <div style={styles.dropdown}>
                  {sortOptions.map((option) => (
                    <div
                      key={option}
                      style={{
                        ...styles.dropdownItem,
                        backgroundColor: sortBy === option ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
                      }}
                      onClick={() => {
                        setSortBy(option);
                        setShowSortDropdown(false);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={styles.tournamentCards}>
            {sortedTournaments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
                <p style={{ fontSize: '18px' }}>No tournaments found matching your filters.</p>
              </div>
            ) : (
              sortedTournaments.map(tournament => (
                <div key={tournament.id} style={styles.tournamentCard}>
                  <div style={{...styles.gameIcon, backgroundColor: tournament.iconBg}}>
                    {getGameIcon(tournament.game)}
                  </div>
                  <div style={styles.tournamentCardContent}>
                    <div style={styles.tournamentCardHeader}>
                      <h3 style={styles.tournamentCardTitle}>{tournament.title}</h3>
                      <span style={{...styles.statusBadge, ...getStatusBadgeStyle(tournament.status)}}>{tournament.status}</span>
                    </div>
                    <p style={styles.tournamentCardDesc}>{tournament.description}</p>
                    {tournament.status === 'Completed' && tournament.winner?.teamName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', padding: '6px 12px', backgroundColor: 'rgba(234, 179, 8, 0.15)', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                        <span style={{ fontSize: '16px' }}>🏆</span>
                        <span style={{ color: '#fbbf24', fontSize: '14px', fontWeight: '600' }}>Winner: {tournament.winner.teamName}</span>
                      </div>
                    )}
                    <div style={styles.tournamentCardMeta}>
                      <div style={styles.metaItem}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 4V8L10 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{tournament.teams.current}/{tournament.teams.max} Teams</span>
                      </div>
                      <div style={styles.metaItem}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.5 2H3.5C2.67157 2 2 2.67157 2 3.5V12.5C2 13.3284 2.67157 14 3.5 14H12.5C13.3284 14 14 13.3284 14 12.5V3.5C14 2.67157 13.3284 2 12.5 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M11 1V3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M5 1V3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 5H14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{tournament.date} - {tournament.time}</span>
                      </div>
                    </div>
                  </div>
                  <div style={styles.tournamentCardActions}>
                    <div style={styles.prizeInfo}>
                      <div style={styles.prizeInfoRow}>
                        <span style={styles.prizeLabel}>Prize Pool</span>
                        <span style={styles.prizeValue}>NPR {tournament.prizePool.toLocaleString()}</span>
                      </div>
                      <div style={styles.prizeInfoRow}>
                        <span style={styles.prizeLabel}>Entry Fee</span>
                        <span style={styles.prizeValue}>{tournament.entryFee === 0 ? 'Free' : `NPR ${tournament.entryFee.toLocaleString()}`}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={{
                          ...styles.actionButton,
                          ...(isUserTeamRegistered(tournament) ? { backgroundColor: '#00B894', cursor: 'default' } : {})
                        }}
                        onClick={() => {
                          if (tournament.status === 'Completed') {
                            handleViewDetails(tournament);
                          } else if (isUserTeamRegistered(tournament)) {
                            handleViewDetails(tournament);
                          } else {
                            handleJoinTournament(tournament.id);
                          }
                        }}
                      >
                        {tournament.status === 'Completed' ? 'View Details' :
                         isUserTeamRegistered(tournament) ? 'View Details' : 'Join'}
                      </button>
                      {(tournament.status === 'Ongoing' || tournament.status === 'Completed' || isUserTeamRegistered(tournament)) && (
                        <button
                          style={{
                            padding: '12px 24px',
                            backgroundColor: 'rgba(147, 51, 234, 0.2)',
                            border: '1px solid rgba(147, 51, 234, 0.5)',
                            borderRadius: '8px',
                            color: '#c084fc',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onClick={() => window.open(`/tournament/${tournament.id}/bracket?from=tournaments`, '_blank')}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.2)';
                          }}
                        >
                          🏆 View Bracket
                        </button>
                      )}
                      {currentUserOrgId && tournament.organizerId === currentUserOrgId && (
                        <button
                          style={{
                            padding: '12px 24px',
                            backgroundColor: 'rgba(234, 88, 12, 0.2)',
                            border: '1px solid rgba(234, 88, 12, 0.5)',
                            borderRadius: '8px',
                            color: '#fb923c',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onClick={() => window.location.href = `/tournament/${tournament.id}/manage?from=tournaments`}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(234, 88, 12, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(234, 88, 12, 0.2)';
                          }}
                        >
                          ⚙️ Manage
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button style={styles.loadMoreButton}>Load More Tournaments</button>
        </div>

        {/* Success/Error Messages */}
        {registrationSuccess && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: 'rgba(0, 201, 80, 0.9)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            zIndex: 2000,
          }}>
            {registrationSuccess}
          </div>
        )}

        {registrationError && !showRegistrationModal && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: 'rgba(251, 44, 54, 0.9)',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '8px',
            zIndex: 2000,
          }}>
            {registrationError}
            <button
              onClick={() => setRegistrationError('')}
              style={{
                marginLeft: '12px',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Registration Modal */}
        {showRegistrationModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: '#1a1a1a',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                marginBottom: '24px',
                color: 'white',
              }}>
                Register for Tournament
              </h2>

              {registrationError && (
                <div style={{
                  backgroundColor: 'rgba(251, 44, 54, 0.2)',
                  border: '1px solid rgba(251, 44, 54, 0.5)',
                  color: '#ff6b6b',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}>
                  {registrationError}
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  color: 'rgba(255, 255, 255, 0.8)',
                  marginBottom: '8px',
                  fontSize: '14px',
                }}>
                  Select Team
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                  }}
                >
                  {userTeams.map((team: any) => (
                    <option key={team._id} value={team._id} style={{ backgroundColor: '#2a2a2a' }}>
                      {team.name} ({team.tag})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowRegistrationModal(false);
                    setRegistrationError('');
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegisterTeam}
                  style={{
                    flex: 1,
                    padding: '12px 24px',
                    backgroundColor: '#155DFC',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Register Team
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tournament Details Modal */}
        {showDetailsModal && selectedTournament && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
            onClick={() => setShowDetailsModal(false)}
          >
            <div
              style={{
                backgroundColor: '#1a1a1a',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
                    {selectedTournament.title}
                  </h2>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{...styles.statusBadge, ...getStatusBadgeStyle(selectedTournament.status)}}>
                      {selectedTournament.status}
                    </span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                      {selectedTournament.game}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: '32px',
                    cursor: 'pointer',
                    padding: '0',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                  Description
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                  {selectedTournament.description || 'No description available.'}
                </p>
              </div>

              {/* Tournament Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '8px' }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '4px' }}>Date & Time</p>
                  <p style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                    {selectedTournament.date}
                  </p>
                  <p style={{ color: 'white', fontSize: '14px' }}>{selectedTournament.time}</p>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '8px' }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '4px' }}>Teams</p>
                  <p style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                    {selectedTournament.teams.current}/{selectedTournament.teams.max}
                  </p>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '8px' }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '4px' }}>Prize Pool</p>
                  <p style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                    NPR {selectedTournament.prizePool.toLocaleString()}
                  </p>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '8px' }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '4px' }}>Entry Fee</p>
                  <p style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                    {selectedTournament.entryFee === 0 ? 'Free' : `NPR ${selectedTournament.entryFee.toLocaleString()}`}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              {selectedTournament.organizerName && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Organized by</p>
                  <p style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>{selectedTournament.organizerName}</p>
                </div>
              )}

              {selectedTournament.matchmakingType && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Format</p>
                  <p style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                    {selectedTournament.matchmakingType.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              )}

              {/* Links */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
                {selectedTournament.streamUrl && (
                  <a
                    href={selectedTournament.streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#9146FF',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    Watch Stream
                  </a>
                )}
                {selectedTournament.discordUrl && (
                  <a
                    href={selectedTournament.discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#5865F2',
                      color: 'white',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}
                  >
                    Join Discord
                  </a>
                )}
                {!isUserTeamRegistered(selectedTournament) && selectedTournament.status !== 'Completed' && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleJoinTournament(selectedTournament.id);
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#155DFC',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Register Team
                  </button>
                )}
                {(selectedTournament.status === 'Ongoing' || selectedTournament.status === 'Completed' || isUserTeamRegistered(selectedTournament)) && (
                  <button
                    onClick={() => window.open(`/tournament/${selectedTournament.id}/bracket?from=tournaments`, '_blank')}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: 'rgba(147, 51, 234, 0.2)',
                      border: '1px solid rgba(147, 51, 234, 0.5)',
                      color: '#c084fc',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    🏆 View Bracket
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  tournaments: {
    width: '100%',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #111 0%, #441415 59.28%)',
    paddingBottom: '80px',
    fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
    color: '#fff',
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px 40px',
  },
  pageTitle: {
    fontSize: '36px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#fff',
  },
  pageSubtitle: {
    fontSize: '18px',
    color: 'rgba(255, 255, 255, 0.68)',
    marginBottom: '40px',
  },
  filterbar: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '24px',
    marginBottom: '40px',
  },
  filterContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  filterLabel: {
    fontSize: '14px',
    color: '#D1D5DC',
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterButtonText: {
    flex: 1,
    textAlign: 'left',
  },
  statscards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '24px',
    marginBottom: '48px',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '14px',
    padding: '24px',
    backdropFilter: 'blur(6px)',
  },
  statIcon: {
    marginBottom: '16px',
  },
  statNumber: {
    fontSize: '30px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#fff',
  },
  statLabel: {
    fontSize: '16px',
    color: '#E5E7EB',
    marginBottom: '4px',
  },
  statSubtext: {
    fontSize: '14px',
    color: '#99A1AF',
  },
  featuredSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
    marginBottom: '48px',
  },
  featuredCard: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '14px',
    padding: '32px',
    backdropFilter: 'blur(6px)',
    overflow: 'hidden',
  },
  featuredBg: {
    position: 'absolute',
    top: '-50%',
    right: '-20%',
    width: '256px',
    height: '256px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  featuredContent: {
    position: 'relative',
    zIndex: 1,
  },
  featuredBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 12px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '100px',
    fontSize: '14px',
    marginBottom: '16px',
  },
  featuredTitle: {
    fontSize: '30px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#fff',
  },
  featuredDesc: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  featuredInfo: {
    display: 'flex',
    gap: '32px',
    marginBottom: '24px',
  },
  featuredInfoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  featuredInfoLabel: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  featuredInfoValue: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#fff',
  },
  joinButton: {
    padding: '12px 24px',
    backgroundColor: '#fff',
    color: '#6C5CE7',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tournamentList: {
    marginTop: '48px',
  },
  tournamentListHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  tournamentListTitle: {
    fontSize: '30px',
    fontWeight: '600',
    color: '#fff',
  },
  sortButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
  },
  tournamentCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    marginBottom: '32px',
  },
  tournamentCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '14px',
  },
  gameIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tournamentCardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  tournamentCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  tournamentCardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '100px',
    fontSize: '14px',
    border: '1px solid',
  },
  tournamentCardDesc: {
    fontSize: '16px',
    color: '#D1D5DC',
  },
  tournamentCardMeta: {
    display: 'flex',
    gap: '24px',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#D1D5DC',
  },
  tournamentCardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  prizeInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  prizeInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minWidth: '180px',
  },
  prizeLabel: {
    fontSize: '14px',
    color: '#D1D5DC',
  },
  prizeValue: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
  },
  actionButton: {
    padding: '12px 24px',
    backgroundColor: '#155DFC',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  loadMoreButton: {
    display: 'block',
    margin: '0 auto',
    padding: '12px 32px',
    backgroundColor: '#155DFC',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '8px',
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '10px',
    maxHeight: '280px',
    overflowY: 'auto',
    zIndex: 1000,
    backdropFilter: 'blur(8px)',
  } as React.CSSProperties,
  dropdownItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#fff',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
};

export default Tournaments;

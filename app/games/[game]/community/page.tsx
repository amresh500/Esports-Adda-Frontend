"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatMessage from "@/components/ChatMessage";
import { useChat } from "@/hooks/useChat";

const VALID_GAMES = [
  "Valorant",
  "CS2",
  "PUBG Mobile",
  "Dota 2",
  "League of Legends",
  "Free Fire",
];

const GAME_COLORS: Record<string, string> = {
  Valorant: "from-[#FF4655] to-[#D13639]",
  CS2: "from-[#F89A1E] to-[#D97706]",
  "PUBG Mobile": "from-[#FFB800] to-[#E09600]",
  "Dota 2": "from-[#D32636] to-[#A61F2B]",
  "League of Legends": "from-[#0BC6E3] to-[#0891A8]",
  "Free Fire": "from-[#FF6B3D] to-[#E85428]",
};

export default function CommunityHubPage() {
  const params = useParams();
  const router = useRouter();

  const gameParam = decodeURIComponent(params.game as string);
  const game = VALID_GAMES.includes(gameParam) ? gameParam : null;

  const [userId, setUserId] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setUserId(localStorage.getItem("userId"));
    setAccountType(localStorage.getItem("accountType"));
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  const {
    messages,
    pinnedMessages,
    typingUsers,
    onlineCount,
    isConnected,
    isLoading,
    hasMore,
    sendMessage,
    sendAnnouncement,
    deleteMessage,
    pinMessage,
    reportMessage,
    loadMore,
    emitTyping,
    emitStopTyping,
  } = useChat(game);

  // Split messages into two lists
  const announcements = messages.filter((m) => m.messageType === "announcement");
  const chatMessages = messages.filter((m) => m.messageType === "message");

  // Chat input state
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isAnnouncement, setIsAnnouncement] = useState(false);

  // Auto-scroll chat panel to bottom
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, autoScroll]);

  const handleChatScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    setAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 100);
  }, []);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || isSending) return;

    setSendError(null);
    setIsSending(true);
    setInputValue("");
    emitStopTyping();

    try {
      if (isAnnouncement && accountType === "organization") {
        await sendAnnouncement(content);
      } else {
        await sendMessage(content);
      }
      setAutoScroll(true);
    } catch (err: any) {
      setSendError(err.message || "Failed to send");
      setInputValue(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.trim()) emitTyping();
    else emitStopTyping();
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm("Delete this message?")) return;
    try { await deleteMessage(messageId); }
    catch (err: any) { alert(err.message || "Failed to delete"); }
  };

  const handlePin = async (messageId: string) => {
    try { await pinMessage(messageId); }
    catch (err: any) { alert(err.message || "Failed to pin"); }
  };

  const handleReport = async (messageId: string, reason: string, details?: string) => {
    await reportMessage(messageId, reason, details);
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415] flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">Game not found</p>
          <button onClick={() => router.push("/games")} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  const gameColor = GAME_COLORS[game] || "from-[#6C5CE7] to-[#5B4CDB]";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#111111] to-[#441415] flex flex-col">
      <Header />

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4 flex items-center gap-3 sm:gap-4">
        <button onClick={() => router.push("/games")} className="text-gray-400 hover:text-white transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className={`w-10 h-10 bg-gradient-to-br ${gameColor} rounded-lg flex items-center justify-center shrink-0`}>
          <span className="text-white font-bold text-sm">{game.charAt(0)}</span>
        </div>

        <div>
          <h1 className="font-arial text-lg sm:text-2xl text-white font-bold">{game} Community Hub</h1>
          <p className="font-arial text-sm text-gray-400">Real-time chat &amp; announcements</p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Pinned indicator */}
          {pinnedMessages.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-arial">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {pinnedMessages.length} pinned
            </div>
          )}
          {/* Online count */}
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-gray-500"}`} />
            <span className="font-arial text-sm text-gray-300">{onlineCount} online</span>
          </div>
        </div>
      </div>

      {/* ── Two-panel layout ─────────────────────────────────────────────── */}
      {/*
          Left column  (w-80) : Announcements — important org messages, always visible
          Right column (flex-1): Normal chat — the live conversation stream
      */}
      <div className="flex-1 flex gap-4 px-3 sm:px-8 pb-4 sm:pb-6 min-h-0" style={{ height: "calc(100vh - 200px)" }}>

        {/* ── LEFT: Announcements panel (hidden on mobile) ─────────────── */}
        <div className="hidden md:flex w-80 flex-col bg-white/5 backdrop-blur-sm rounded-2xl border border-yellow-500/20 overflow-hidden shrink-0">
          {/* Header */}
          <div className="px-4 py-3 border-b border-yellow-500/20 bg-yellow-500/5 flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span className="font-arial text-sm font-bold text-yellow-400 uppercase tracking-wider">Announcements</span>
            {announcements.length > 0 && (
              <span className="ml-auto bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded-full border border-yellow-500/30">
                {announcements.length}
              </span>
            )}
          </div>

          {/* Pinned messages sub-section */}
          {pinnedMessages.length > 0 && (
            <div className="px-3 py-2 border-b border-white/5 bg-white/3">
              <p className="font-arial text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">Pinned</p>
              <div className="flex flex-col gap-2">
                {pinnedMessages.map((msg) => (
                  <div key={msg._id} className="flex items-start gap-2">
                    <svg className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <div className="min-w-0">
                      <p className="font-arial text-xs text-yellow-400 font-semibold truncate">{msg.senderName}</p>
                      <p className="font-arial text-xs text-gray-400 line-clamp-2">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Announcements list */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            {isLoading && announcements.length === 0 && (
              <div className="flex items-center justify-center py-10">
                <p className="font-arial text-xs text-gray-500">Loading...</p>
              </div>
            )}

            {!isLoading && announcements.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center px-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <p className="font-arial text-xs text-gray-500">No announcements yet.</p>
                {accountType === "organization" && (
                  <p className="font-arial text-xs text-gray-600">Post an announcement from the chat box.</p>
                )}
              </div>
            )}

            {announcements.map((msg) => (
              <ChatMessage
                key={msg._id}
                message={msg}
                currentUserId={userId}
                accountType={accountType}
                onDelete={handleDelete}
                onPin={handlePin}
                onReport={handleReport}
              />
            ))}
          </div>

          {/* Org-only: announcement send shortcut */}
          {accountType === "organization" && (
            <div className="border-t border-yellow-500/10 px-3 py-2">
              <p className="font-arial text-[10px] text-gray-600 text-center">
                Toggle "Post as announcement" in the chat input to post here.
              </p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Chat panel ───────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden min-w-0">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-arial text-sm font-bold text-gray-300 uppercase tracking-wider">Live Chat</span>
            {chatMessages.length > 0 && (
              <span className="ml-1 font-arial text-xs text-gray-500">{chatMessages.length} messages</span>
            )}
          </div>

          {/* Messages */}
          <div
            ref={chatContainerRef}
            onScroll={handleChatScroll}
            className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1"
            style={{ minHeight: 0 }}
          >
            {hasMore && (
              <div className="flex justify-center mb-2">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg text-xs font-arial text-gray-300 transition-all disabled:opacity-50"
                >
                  {isLoading ? "Loading..." : "Load older messages"}
                </button>
              </div>
            )}

            {isLoading && chatMessages.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <p className="font-arial text-sm text-gray-400">Loading messages...</p>
              </div>
            )}

            {!isLoading && chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 py-20">
                <div className={`w-16 h-16 bg-gradient-to-br ${gameColor} rounded-2xl flex items-center justify-center text-2xl`}>
                  💬
                </div>
                <p className="font-arial text-gray-400 text-center text-sm">
                  No messages yet. Be the first to say something!
                </p>
              </div>
            )}

            {chatMessages.map((msg) => (
              <ChatMessage
                key={msg._id}
                message={msg}
                currentUserId={userId}
                accountType={accountType}
                onDelete={handleDelete}
                onPin={handlePin}
                onReport={handleReport}
              />
            ))}

            <div ref={chatEndRef} />
          </div>

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="px-4 py-1.5 border-t border-white/5">
              <p className="font-arial text-xs text-gray-500 italic">
                {typingUsers.length === 1
                  ? `${typingUsers[0].name} is typing...`
                  : typingUsers.length === 2
                  ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`
                  : `${typingUsers.length} people are typing...`}
              </p>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-white/10 p-4">
            {/* Announcement mode toggle (org only) */}
            {accountType === "organization" && (
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => setIsAnnouncement(!isAnnouncement)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-arial border transition-all ${
                    isAnnouncement
                      ? "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
                      : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  {isAnnouncement ? "Posting as announcement — will appear left" : "Post as announcement"}
                </button>
              </div>
            )}

            {sendError && (
              <p className="font-arial text-xs text-red-400 mb-2">{sendError}</p>
            )}

            {isLoggedIn ? (
              <div className="flex gap-3 items-end">
                <textarea
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isAnnouncement
                      ? "Write an announcement for the community..."
                      : `Message #${game.toLowerCase().replace(/ /g, "-")}...`
                  }
                  rows={1}
                  className={`flex-1 bg-white/10 border rounded-xl px-4 py-3 font-arial text-sm text-white placeholder-gray-500 focus:outline-none resize-none transition-all ${
                    isAnnouncement
                      ? "border-yellow-500/40 focus:border-yellow-500/70"
                      : "border-white/20 focus:border-white/40"
                  }`}
                  style={{ maxHeight: "120px", overflowY: "auto" }}
                  onInput={(e) => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isSending || !isConnected}
                  className={`px-5 py-3 rounded-xl font-arial text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    isAnnouncement
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black"
                      : "bg-gradient-to-r from-[#FF4655] to-[#D13639] hover:from-[#FF5566] hover:to-[#E14748] text-white"
                  }`}
                >
                  {isSending ? "..." : "Send"}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 py-2">
                <p className="font-arial text-sm text-gray-400">
                  You must be logged in to send messages.
                </p>
                <button
                  onClick={() => router.push("/login")}
                  className="px-4 py-2 bg-gradient-to-r from-[#FF4655] to-[#D13639] text-white rounded-lg text-sm font-arial hover:from-[#FF5566] hover:to-[#E14748] transition-all"
                >
                  Log in
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

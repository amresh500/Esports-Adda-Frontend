"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  _id: string;
  game: string;
  sender: string;
  senderModel: "User" | "OrganizationAccount";
  senderType: "player" | "organization";
  senderName: string;
  senderTag: string | null;
  senderAvatar: string | null;
  content: string;
  messageType: "message" | "announcement";
  isPinned: boolean;
  isDeleted: boolean;
  reportCount: number;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TypingUser {
  userId: string;
  name: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  pinnedMessages: ChatMessage[];
  typingUsers: TypingUser[];
  onlineCount: number;
  isConnected: boolean;
  isLoading: boolean;
  hasMore: boolean;
  sendMessage: (content: string) => Promise<void>;
  sendAnnouncement: (content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  pinMessage: (messageId: string) => Promise<void>;
  reportMessage: (messageId: string, reason: string, details?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  emitTyping: () => void;
  emitStopTyping: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChat(game: string | null): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentGameRef = useRef<string | null>(null);

  // ── Initial REST load ──────────────────────────────────────────────────────
  // When the game changes, fetch the last 50 messages via HTTP first.
  // This lets the page render with content immediately, before the socket
  // connection is fully established.
  const loadInitialMessages = useCallback(async (gameName: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/chat/${encodeURIComponent(gameName)}?limit=50`
      );
      const data = await res.json();
      if (data.success) {
        setMessages(data.data.messages || []);
        setPinnedMessages(data.data.pinned || []);
        setHasMore(data.data.hasMore || false);
        setNextCursor(data.data.nextCursor || null);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Load more (older) messages ─────────────────────────────────────────────
  // Cursor-based pagination: fetch the next batch of older messages.
  const loadMore = useCallback(async () => {
    if (!game || !hasMore || !nextCursor || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/chat/${encodeURIComponent(game)}?limit=50&cursor=${nextCursor}`
      );
      const data = await res.json();
      if (data.success) {
        // Prepend older messages to the front of the list
        setMessages((prev) => [...(data.data.messages || []), ...prev]);
        setHasMore(data.data.hasMore || false);
        setNextCursor(data.data.nextCursor || null);
      }
    } catch (err) {
      console.error("Failed to load more messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, [game, hasMore, nextCursor, isLoading]);

  // ── Socket connection ──────────────────────────────────────────────────────
  // One persistent socket per hook instance. The token is read from localStorage
  // at connection time. If no token exists the socket connects as a guest
  // (can receive but not send messages).
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Create socket with auth token (or without for guests)
    const socket = io(API_URL, {
      auth: token ? { token } : {},
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    // ── Connection lifecycle ───────────────────────────────────────────────
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // ── Incoming message ───────────────────────────────────────────────────
    // Emitted by server to ALL sockets in the room (including the sender).
    // We simply append it to the messages array.
    socket.on("new-message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      // If it's a newly pinned announcement, update pinned list too
      if (message.isPinned) {
        setPinnedMessages((prev) => [message, ...prev].slice(0, 5));
      }
    });

    // ── Message deleted ────────────────────────────────────────────────────
    // Server soft-deletes and broadcasts — remove from local state.
    socket.on("message-deleted", ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      setPinnedMessages((prev) => prev.filter((m) => m._id !== messageId));
    });

    // ── Message pinned/unpinned ────────────────────────────────────────────
    socket.on(
      "message-pinned",
      ({
        messageId,
        isPinned,
        message,
      }: {
        messageId: string;
        isPinned: boolean;
        message: ChatMessage;
      }) => {
        // Update the message in the main list
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? { ...m, isPinned } : m))
        );

        // Update pinned list
        if (isPinned) {
          setPinnedMessages((prev) =>
            [message, ...prev.filter((m) => m._id !== messageId)].slice(0, 5)
          );
        } else {
          setPinnedMessages((prev) => prev.filter((m) => m._id !== messageId));
        }
      }
    );

    // ── Message reported ───────────────────────────────────────────────────
    socket.on(
      "message-reported",
      ({
        messageId,
        reportCount,
        isFlagged,
      }: {
        messageId: string;
        reportCount: number;
        isFlagged: boolean;
      }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId ? { ...m, reportCount, isFlagged } : m
          )
        );
      }
    );

    // ── Online count ───────────────────────────────────────────────────────
    socket.on("online-count", ({ count }: { game: string; count: number }) => {
      setOnlineCount(count);
    });

    // ── Typing indicators ──────────────────────────────────────────────────
    socket.on("user-typing", (user: TypingUser) => {
      setTypingUsers((prev) => {
        const exists = prev.some((u) => u.userId === user.userId);
        return exists ? prev : [...prev, user];
      });
    });

    socket.on("user-stop-typing", ({ userId }: { userId: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    });

    return () => {
      // Leave current room before disconnecting
      if (currentGameRef.current) {
        socket.emit("leave-game", currentGameRef.current);
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // Run once — socket lives for the lifetime of the hook

  // ── Join/leave game room when `game` changes ───────────────────────────────
  // When the user switches games, leave the old room and join the new one.
  // Also fetch fresh messages for the new game.
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    // Leave previous room
    if (currentGameRef.current && currentGameRef.current !== game) {
      socket.emit("leave-game", currentGameRef.current);
    }

    // Reset state
    setMessages([]);
    setPinnedMessages([]);
    setTypingUsers([]);
    setOnlineCount(0);
    setHasMore(false);
    setNextCursor(null);
    currentGameRef.current = game;

    if (!game) return;

    // Join new room
    socket.emit("join-game", game);

    // Fetch initial messages via REST
    loadInitialMessages(game);
  }, [game, loadInitialMessages]);

  // ── Send message ───────────────────────────────────────────────────────────
  // Emits the send-message event to the server. The server saves to DB then
  // broadcasts new-message to ALL in the room (including us), so we don't
  // optimistically add it — we wait for the echo.
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const socket = socketRef.current;
        if (!socket || !game) return reject(new Error("Not connected"));

        socket.emit(
          "send-message",
          { game, content },
          (res: { success?: boolean; error?: string }) => {
            if (res?.error) return reject(new Error(res.error));
            resolve();
          }
        );
      });
    },
    [game]
  );

  // ── Send announcement ──────────────────────────────────────────────────────
  // Org accounts only. Same as sendMessage but emits send-announcement.
  const sendAnnouncement = useCallback(
    async (content: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const socket = socketRef.current;
        if (!socket || !game) return reject(new Error("Not connected"));

        socket.emit(
          "send-announcement",
          { game, content },
          (res: { success?: boolean; error?: string }) => {
            if (res?.error) return reject(new Error(res.error));
            resolve();
          }
        );
      });
    },
    [game]
  );

  // ── Delete message ─────────────────────────────────────────────────────────
  const deleteMessage = useCallback(
    async (messageId: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const socket = socketRef.current;
        if (!socket || !game) return reject(new Error("Not connected"));

        socket.emit(
          "delete-message",
          { game, messageId },
          (res: { success?: boolean; error?: string }) => {
            if (res?.error) return reject(new Error(res.error));
            resolve();
          }
        );
      });
    },
    [game]
  );

  // ── Pin message ────────────────────────────────────────────────────────────
  const pinMessage = useCallback(
    async (messageId: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const socket = socketRef.current;
        if (!socket || !game) return reject(new Error("Not connected"));

        socket.emit(
          "pin-message",
          { game, messageId },
          (res: { success?: boolean; error?: string }) => {
            if (res?.error) return reject(new Error(res.error));
            resolve();
          }
        );
      });
    },
    [game]
  );

  // ── Report message ───────────────────────────────────────────────────────
  const reportMessage = useCallback(
    async (messageId: string, reason: string, details?: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const socket = socketRef.current;
        if (!socket || !game) return reject(new Error("Not connected"));

        socket.emit(
          "report-message",
          { game, messageId, reason, details },
          (res: { success?: boolean; error?: string }) => {
            if (res?.error) return reject(new Error(res.error));
            resolve();
          }
        );
      });
    },
    [game]
  );

  // ── Typing ─────────────────────────────────────────────────────────────────
  // Debounced: emit typing once, then stop-typing after 2.5s of no keystrokes.
  const emitTyping = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !game) return;

    socket.emit("typing", { game });

    // Reset the stop-typing timer
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", { game });
    }, 2500);
  }, [game]);

  const emitStopTyping = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !game) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("stop-typing", { game });
  }, [game]);

  return {
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
  };
}

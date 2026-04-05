"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Notification {
  _id: string;
  recipient: string;
  recipientModel: "User" | "OrganizationAccount";
  type:
    | "tournament_registration_approved"
    | "tournament_registration_rejected"
    | "tournament_bracket_generated"
    | "tournament_match_scheduled"
    | "tournament_completed"
    | "stream_approved"
    | "stream_rejected"
    | "user_warned"
    | "user_suspended"
    | "user_banned";
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  refId: string | null;
  refModel: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  fetchMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const mountedRef = useRef(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  };

  // Fetch initial notifications + unread count
  const fetchNotifications = useCallback(async (pageNum = 1) => {
    try {
      setIsLoading(true);
      const [notifsRes, countRes] = await Promise.all([
        fetch(`${API_URL}/api/notifications?page=${pageNum}&limit=20`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_URL}/api/notifications/unread-count`, {
          headers: getAuthHeaders(),
        }),
      ]);

      const [notifsData, countData] = await Promise.all([
        notifsRes.json(),
        countRes.json(),
      ]);

      if (!mountedRef.current) return;

      if (notifsData.success) {
        if (pageNum === 1) {
          setNotifications(notifsData.data.notifications);
        } else {
          setNotifications((prev) => [...prev, ...notifsData.data.notifications]);
        }
        setHasMore(pageNum < notifsData.data.totalPages);
        setPage(pageNum);
      }

      if (countData.success) {
        setUnreadCount(countData.data.count);
      }
    } catch (err) {
      console.error("fetchNotifications error:", err);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, []);

  const fetchMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      await fetchNotifications(page + 1);
    }
  }, [fetchNotifications, isLoading, hasMore, page]);

  // Mark a single notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && mountedRef.current) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("markAsRead error:", err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && mountedRef.current) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("markAllAsRead error:", err);
    }
  }, []);

  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const wasUnread = notifications.find((n) => n._id === id && !n.isRead);
      const res = await fetch(`${API_URL}/api/notifications/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success && mountedRef.current) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("deleteNotification error:", err);
    }
  }, [notifications]);

  // Connect socket for real-time delivery
  useEffect(() => {
    mountedRef.current = true;

    const token = localStorage.getItem("token");
    if (!token) return;

    // Only fetch if logged in
    fetchNotifications(1);

    const socket = io(API_URL, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("new-notification", (notification: Notification) => {
      if (!mountedRef.current) return;
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      mountedRef.current = false;
      socket.disconnect();
    };
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    fetchMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

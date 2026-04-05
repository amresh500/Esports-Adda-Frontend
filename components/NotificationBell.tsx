"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import { useLanguage } from "@/lib/LanguageContext";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useLanguage();
  const {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    fetchMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleNotificationClick = async (id: string, link: string | null, isRead: boolean) => {
    if (!isRead) await markAsRead(id);
    setOpen(false);
    if (link) router.push(link);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t.notifications.justNow;
    if (mins < 60) return `${mins}${t.notifications.minutesAgo}`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}${t.notifications.hoursAgo}`;
    return `${Math.floor(hrs / 24)}${t.notifications.daysAgo}`;
  };

  const typeColor = (type: string) => {
    if (type.includes("approved") || type === "tournament_bracket_generated" || type === "tournament_completed" || type === "tournament_match_scheduled") return "bg-green-500";
    if (type.includes("rejected") || type.includes("banned")) return "bg-red-500";
    if (type.includes("warned") || type.includes("suspended")) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-all"
        aria-label="Notifications"
      >
        {/* Bell icon */}
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1a1a1a] border border-white/20 rounded-lg shadow-2xl z-50 flex flex-col max-h-[480px]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-white font-semibold text-sm">{t.notifications.title}</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {t.notifications.markAllRead}
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {isLoading && notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">{t.common.loading}</div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">{t.notifications.noNotifications}</div>
            ) : (
              <>
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`group flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 ${!n.isRead ? "bg-white/[0.03]" : ""}`}
                    onClick={() => handleNotificationClick(n._id, n.link, n.isRead)}
                  >
                    {/* Type indicator dot */}
                    <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${typeColor(n.type)} ${n.isRead ? "opacity-40" : ""}`} />

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-tight ${n.isRead ? "text-gray-400" : "text-white"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400 flex-shrink-0 p-0.5"
                      aria-label="Delete notification"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {hasMore && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchMore();
                    }}
                    className="w-full py-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {isLoading ? t.common.loading : t.notifications.loadMore}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

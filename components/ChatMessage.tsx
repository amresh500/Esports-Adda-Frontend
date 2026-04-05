"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChatMessage as ChatMessageType } from "@/hooks/useChat";

const REPORT_REASONS = [
  "Harassment",
  "Hate Speech",
  "Spam",
  "Inappropriate Content",
  "Misinformation",
  "Other",
] as const;

interface ChatMessageProps {
  message: ChatMessageType;
  currentUserId: string | null;
  accountType: string | null;
  onDelete?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onReport?: (messageId: string, reason: string, details?: string) => void;
}

// ─── Helper: format timestamp ──────────────────────────────────────────────────
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── ChatMessage Component ─────────────────────────────────────────────────────
export default function ChatMessage({
  message,
  currentUserId,
  accountType,
  onDelete,
  onPin,
  onReport,
}: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<string>("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const isOwner = currentUserId && message.sender === currentUserId;
  const isOrg = accountType === "organization";
  const canDelete = !!isOwner;
  const canPin = isOrg;
  const canReport = currentUserId && !isOwner; // logged in and not the sender
  const isAnnouncement = message.messageType === "announcement";

  const handleReport = async () => {
    if (!reportReason || !onReport) return;
    setReportSubmitting(true);
    setReportError(null);
    try {
      await onReport(message._id, reportReason, reportDetails || undefined);
      setShowReportModal(false);
      setReportReason("");
      setReportDetails("");
    } catch (err: any) {
      setReportError(err.message || "Failed to report");
    } finally {
      setReportSubmitting(false);
    }
  };

  // ── Announcement card ──────────────────────────────────────────────────────
  if (isAnnouncement) {
    return (
      <div
        className="relative group rounded-xl border border-yellow-500/40 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-4 py-3 my-1"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Pin badge */}
        {message.isPinned && (
          <span className="absolute -top-2 left-3 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
            PINNED
          </span>
        )}

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          {/* Avatar */}
          {message.senderAvatar ? (
            <img
              src={message.senderAvatar}
              alt={message.senderName}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-yellow-500/50"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-[10px] font-bold text-black">
              {message.senderName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Name + tag */}
          <span className="font-arial text-sm font-semibold text-yellow-400">
            {message.senderName}
          </span>
          {message.senderTag && (
            <span className="font-arial text-xs text-yellow-600">
              [{message.senderTag}]
            </span>
          )}

          {/* Announcement badge */}
          <span className="ml-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-500/30">
            ANNOUNCEMENT
          </span>

          {/* Timestamp */}
          <span className="ml-auto font-arial text-xs text-gray-500">
            {formatTime(message.createdAt)}
          </span>
        </div>

        {/* Content */}
        <p className="font-arial text-sm text-white/90 leading-relaxed pl-8">
          {message.content}
        </p>

        {/* Action buttons (on hover) */}
        {showActions && (canDelete || canPin || canReport) && (
          <div className="absolute top-2 right-2 flex gap-1">
            {canPin && onPin && (
              <button
                onClick={() => onPin(message._id)}
                title={message.isPinned ? "Unpin" : "Pin"}
                className="p-1 rounded bg-white/10 hover:bg-yellow-500/30 text-yellow-400 transition-all"
              >
                <PinIcon pinned={message.isPinned} />
              </button>
            )}
            {canReport && onReport && (
              <button
                onClick={() => setShowReportModal(true)}
                title="Report"
                className="p-1 rounded bg-white/10 hover:bg-orange-500/30 text-orange-400 transition-all"
              >
                <FlagIcon />
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(message._id)}
                title="Delete"
                className="p-1 rounded bg-white/10 hover:bg-red-500/30 text-red-400 transition-all"
              >
                <TrashIcon />
              </button>
            )}
          </div>
        )}

        {/* Report modal — rendered via portal to escape overflow containers */}
        {showReportModal && typeof document !== "undefined" && createPortal(
          <ReportModal
            reportReason={reportReason}
            setReportReason={setReportReason}
            reportDetails={reportDetails}
            setReportDetails={setReportDetails}
            reportSubmitting={reportSubmitting}
            reportError={reportError}
            onSubmit={handleReport}
            onClose={() => { setShowReportModal(false); setReportError(null); }}
          />,
          document.body
        )}
      </div>
    );
  }

  // ── Regular message ────────────────────────────────────────────────────────
  return (
    <div
      className="relative group flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {message.senderAvatar ? (
        <img
          src={message.senderAvatar}
          alt={message.senderName}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
        />
      ) : (
        <div
          className={`w-8 h-8 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center text-xs font-bold text-white ${
            message.senderType === "organization"
              ? "bg-gradient-to-br from-[#FF8904] to-[#E67700]"
              : "bg-gradient-to-br from-[#6C5CE7] to-[#5B4CDB]"
          }`}
        >
          {message.senderName.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          {/* Sender name */}
          <span
            className={`font-arial text-sm font-semibold ${
              message.senderType === "organization"
                ? "text-orange-400"
                : "text-white"
            }`}
          >
            {message.senderName}
          </span>

          {/* Org tag */}
          {message.senderTag && (
            <span className="font-arial text-xs text-orange-600">
              [{message.senderTag}]
            </span>
          )}

          {/* Org badge */}
          {message.senderType === "organization" && (
            <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-orange-500/30">
              ORG
            </span>
          )}

          {/* Pinned badge */}
          {message.isPinned && (
            <span className="bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-500/30">
              PINNED
            </span>
          )}

          {/* Timestamp */}
          <span className="font-arial text-xs text-gray-500 ml-1">
            {formatTime(message.createdAt)}
          </span>
        </div>

        {/* Message content */}
        <p className="font-arial text-sm text-gray-200 leading-relaxed break-words mt-0.5">
          {message.content}
        </p>
      </div>

      {/* Action buttons (on hover) */}
      {showActions && (canDelete || canPin || canReport) && (
        <div className="absolute top-2 right-2 flex gap-1 bg-[#1a1a1a] rounded-lg border border-white/10 p-1 shadow-lg">
          {canPin && onPin && (
            <button
              onClick={() => onPin(message._id)}
              title={message.isPinned ? "Unpin" : "Pin"}
              className="p-1 rounded hover:bg-yellow-500/20 text-yellow-400 transition-all"
            >
              <PinIcon pinned={message.isPinned} />
            </button>
          )}
          {canReport && onReport && (
            <button
              onClick={() => setShowReportModal(true)}
              title="Report"
              className="p-1 rounded hover:bg-orange-500/20 text-orange-400 transition-all"
            >
              <FlagIcon />
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(message._id)}
              title="Delete"
              className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-all"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      )}

      {/* Report modal — rendered via portal to escape overflow containers */}
      {showReportModal && typeof document !== "undefined" && createPortal(
        <ReportModal
          reportReason={reportReason}
          setReportReason={setReportReason}
          reportDetails={reportDetails}
          setReportDetails={setReportDetails}
          reportSubmitting={reportSubmitting}
          reportError={reportError}
          onSubmit={handleReport}
          onClose={() => { setShowReportModal(false); setReportError(null); }}
        />,
        document.body
      )}
    </div>
  );
}

// ─── Icon sub-components ───────────────────────────────────────────────────────

function TrashIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function PinIcon({ pinned }: { pinned: boolean }) {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill={pinned ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
      />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z"
      />
    </svg>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────
function ReportModal({
  reportReason,
  setReportReason,
  reportDetails,
  setReportDetails,
  reportSubmitting,
  reportError,
  onSubmit,
  onClose,
}: {
  reportReason: string;
  setReportReason: (r: string) => void;
  reportDetails: string;
  setReportDetails: (d: string) => void;
  reportSubmitting: boolean;
  reportError: string | null;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md mx-4 p-6 shadow-2xl">
        <h3 className="font-arial text-lg font-bold text-white mb-1">Report Message</h3>
        <p className="font-arial text-xs text-gray-400 mb-4">
          This report will be flagged for admin review.
        </p>

        {/* Reason selection */}
        <div className="flex flex-col gap-2 mb-4">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason}
              onClick={() => setReportReason(reason)}
              className={`text-left px-3 py-2 rounded-lg border text-sm font-arial transition-all ${
                reportReason === reason
                  ? "border-orange-500/60 bg-orange-500/10 text-orange-400"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-white/20"
              }`}
            >
              {reason}
            </button>
          ))}
        </div>

        {/* Optional details */}
        <textarea
          value={reportDetails}
          onChange={(e) => setReportDetails(e.target.value)}
          placeholder="Additional details (optional)"
          maxLength={500}
          rows={2}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 font-arial text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none mb-4"
        />

        {reportError && (
          <p className="font-arial text-xs text-red-400 mb-3">{reportError}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-arial text-sm hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!reportReason || reportSubmitting}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-white font-arial text-sm font-semibold hover:from-orange-400 hover:to-red-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {reportSubmitting ? "Reporting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

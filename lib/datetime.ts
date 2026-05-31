// ─── Date/time helpers for tournament scheduling ───────────────────────────────
//
// The problem these solve:
//   <input type="datetime-local"> produces a NAIVE string like "2026-06-15T18:00"
//   with no timezone. If sent raw to a UTC server (Railway), the server reads it
//   as UTC and every time shifts by Nepal's +5:45 offset. And reading a stored
//   UTC date back into the input with .toISOString() shows UTC, not local time.
//
// The fix is a consistent pair:
//   • toServerISO()       — input value (local) → correct UTC ISO before sending
//   • toDatetimeLocal()   — stored UTC date → input value in the user's local zone
//
// Because Esports Adda's users are in Nepal, "local zone" is Nepal time, so what
// the organiser types is exactly what gets stored and shown back.

/**
 * Convert a <input type="datetime-local"> value (naive local time) into a proper
 * UTC ISO string suitable for the API. Returns "" for empty input.
 * new Date(localString) is interpreted in the browser's local zone, and
 * toISOString() gives the matching UTC instant — no offset is lost.
 */
export function toServerISO(datetimeLocalValue: string): string {
  if (!datetimeLocalValue) return "";
  const d = new Date(datetimeLocalValue);
  return isNaN(d.getTime()) ? "" : d.toISOString();
}

/**
 * Convert a stored date (UTC ISO from the API) into a value the
 * <input type="datetime-local"> understands, expressed in the user's LOCAL zone.
 * Returns "" for empty/invalid input.
 */
export function toDatetimeLocal(isoOrDate: string | Date | null | undefined): string {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return "";
  // Shift by the local timezone offset so slicing the ISO string yields local time
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

/**
 * Format a stored date for display in Nepal time (Asia/Kathmandu), regardless of
 * where the viewer is. Use for tournament schedules so the time shown is always
 * the official Nepal time. Returns a fallback ("—" by default) for empty input.
 */
export function formatNepal(
  isoOrDate: string | Date | null | undefined,
  fallback = "—"
): string {
  if (!isoOrDate) return fallback;
  const d = new Date(isoOrDate);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleString("en-US", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " NPT";
}

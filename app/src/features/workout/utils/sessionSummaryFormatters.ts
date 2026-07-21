/** Short completion timestamp, e.g. "Jul 21, 10:45 AM". */
export function formatCompletedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Human-readable session duration from seconds, e.g. "45 min" or "1h 5m". */
export function formatSessionDuration(durationSeconds: number): string {
  const totalSeconds = Math.max(0, Math.round(durationSeconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return seconds > 0 && minutes < 5 ? `${minutes}m ${seconds}s` : `${minutes} min`;
  }
  return `${seconds}s`;
}

/** Compact volume label, e.g. "4200 kg" or "4.2k kg". */
export function formatSessionVolumeKg(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1).replace(/\.0$/, "")}k kg`;
  }
  return `${Math.round(volume)} kg`;
}

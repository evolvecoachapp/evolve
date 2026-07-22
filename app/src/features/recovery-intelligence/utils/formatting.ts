import type { RecoveryStatusLevel } from "../models/RecoveryStatus";

const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;

export function hoursToMs(hours: number): number {
  return hours * MS_PER_HOUR;
}

export function daysToMs(days: number): number {
  return days * MS_PER_DAY;
}

/**
 * Add whole hours to an ISO timestamp (UTC). Returns ISO string.
 */
export function addHoursIso(iso: string, hours: number): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) {
    return iso;
  }
  return new Date(ms + hoursToMs(hours)).toISOString();
}

/**
 * Parse ISO timestamp; returns null when invalid.
 */
export function parseTimestamp(iso: string): number | null {
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}

export function formatStatusLabel(level: RecoveryStatusLevel): string {
  switch (level) {
    case "fresh":
      return "Fresh";
    case "moderate":
      return "Moderate";
    case "elevated":
      return "Elevated";
    case "high":
      return "High";
    case "insufficient_data":
      return "Insufficient data";
    default:
      return "Unknown";
  }
}

export function buildSummaryText(input: {
  readonly status: RecoveryStatusLevel;
  readonly fatigueScore: number;
  readonly sessionLoad: number;
  readonly workoutsInWindow: number;
  readonly windowDurationHours: number;
}): string {
  return `Recovery status ${formatStatusLabel(input.status).toLowerCase()} — fatigue ${input.fatigueScore}, session load ${input.sessionLoad}, ${input.workoutsInWindow} workouts in window, recovery window ${input.windowDurationHours}h`;
}

/**
 * Presentation-only formatters for analytics UI.
 * Reuses workout session display helpers — no aggregate calculations.
 */
import {
  formatSessionDuration,
  formatSessionVolumeKg,
} from "../../workout/utils/sessionSummaryFormatters";

export function formatAnalyticsVolumeKg(volumeKg: number): string {
  return formatSessionVolumeKg(volumeKg);
}

export function formatAnalyticsDuration(durationSeconds: number | null): string {
  if (durationSeconds == null) {
    return "—";
  }
  return formatSessionDuration(durationSeconds);
}

export function formatAnalyticsCount(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(Math.round(value));
}

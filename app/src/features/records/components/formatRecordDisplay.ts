/**
 * Presentation-only formatters for records UI.
 * No aggregate or Epley calculations.
 */
import { formatSessionVolumeKg } from "../../workout/utils/sessionSummaryFormatters";

export function formatRecordVolumeKg(volumeKg: number | null): string {
  if (volumeKg == null) {
    return "—";
  }
  return formatSessionVolumeKg(volumeKg);
}

export function formatRecordWeightKg(weightKg: number | null): string {
  if (weightKg == null) {
    return "—";
  }
  if (weightKg >= 1000) {
    return `${(weightKg / 1000).toFixed(1).replace(/\.0$/, "")}k kg`;
  }
  return `${Math.round(weightKg)} kg`;
}

export function formatRecordCount(value: number | null): string {
  if (value == null) {
    return "—";
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return String(Math.round(value));
}

export function formatRecordDate(iso: string | null): string {
  if (iso == null) {
    return "—";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

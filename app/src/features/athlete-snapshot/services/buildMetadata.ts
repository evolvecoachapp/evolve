import type { WeeklyCoachReport } from "../../weekly-report/models/WeeklyCoachReport";
import type { SnapshotMetadata } from "../models/SnapshotMetadata";

export interface BuildMetadataInput {
  readonly generatedAt: string;
  readonly weeklyReport?: WeeklyCoachReport | null;
  readonly applicationVersion?: string;
  readonly schemaVersion?: string;
}

function deriveWeekBounds(generatedAt: string): {
  readonly weekStart: string;
  readonly weekEnd: string;
} {
  const end = new Date(generatedAt);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 6);
  return {
    weekStart: start.toISOString(),
    weekEnd: end.toISOString(),
  };
}

/**
 * Builds snapshot metadata from existing weekly report bounds when available.
 */
export function buildMetadata(input: BuildMetadataInput): SnapshotMetadata {
  const defaultBounds = deriveWeekBounds(input.generatedAt);

  return Object.freeze({
    generatedAt: input.generatedAt,
    weekStart: input.weeklyReport?.weekStart ?? defaultBounds.weekStart,
    weekEnd: input.weeklyReport?.weekEnd ?? defaultBounds.weekEnd,
    applicationVersion: input.applicationVersion ?? "28.2",
    schemaVersion: input.schemaVersion ?? "1.0",
  });
}

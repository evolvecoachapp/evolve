import type { WeeklyCoachReport } from "../../weekly-report/models/WeeklyCoachReport";
import type { WorkspaceMetadata } from "../models/WorkspaceMetadata";

export interface BuildMetadataInput {
  readonly athleteId: string;
  readonly generatedAt: string;
  readonly version?: string;
  readonly weeklyReport?: WeeklyCoachReport | null;
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
 * Builds deterministic metadata for the workspace read model.
 */
export function buildMetadata(input: BuildMetadataInput): WorkspaceMetadata {
  const defaultBounds = deriveWeekBounds(input.generatedAt);
  const weekStart = input.weeklyReport?.weekStart ?? defaultBounds.weekStart;
  const weekEnd = input.weeklyReport?.weekEnd ?? defaultBounds.weekEnd;
  const workspaceId = `athlete-workspace:${input.athleteId}:${input.generatedAt}`;

  return Object.freeze({
    generatedAt: input.generatedAt,
    version: input.version ?? "28.1",
    workspaceId,
    weekStart,
    weekEnd,
  });
}

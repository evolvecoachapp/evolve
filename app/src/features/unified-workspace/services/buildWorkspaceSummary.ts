import type { AthleteSnapshot } from "../../athlete-snapshot/models/AthleteSnapshot";
import type { DailyBrief } from "../../daily-brief/models/DailyBrief";
import type { HomeExperience } from "../../home-experience/models/HomeExperience";
import type { WeeklyCoachReport } from "../../weekly-report/models/WeeklyCoachReport";
import type { WorkspaceSummary } from "../models/WorkspaceSummary";

export interface BuildWorkspaceSummaryInput {
  readonly athleteId: string;
  readonly generatedAt: string;
  readonly homeExperience?: HomeExperience | null;
  readonly dailyBrief?: DailyBrief | null;
  readonly weeklyReport?: WeeklyCoachReport | null;
  readonly snapshot?: AthleteSnapshot | null;
}

/**
 * Builds the workspace summary from Home, Daily Brief, Weekly Report, and Snapshot.
 */
export function buildWorkspaceSummary(
  input: BuildWorkspaceSummaryInput,
): WorkspaceSummary {
  const highlights = [
    ...(input.homeExperience?.summary.highlights ?? Object.freeze([])),
    ...(input.dailyBrief?.summary.highlights ?? Object.freeze([])),
    ...(input.weeklyReport?.executiveSummary.weeklyHighlights ??
      Object.freeze([])),
  ];
  const dedupedHighlights = Object.freeze(
    Array.from(new Set(highlights)).slice(0, 8),
  );

  const headline =
    input.weeklyReport?.executiveSummary.headline ??
    input.dailyBrief?.summary.headline ??
    input.homeExperience?.summary.headline ??
    "Unified athlete workspace";
  const narrative =
    input.weeklyReport?.executiveSummary.narrative ??
    input.dailyBrief?.summary.narrative ??
    input.homeExperience?.summary.narrative ??
    "No premium coaching artifacts are currently composed for this athlete.";

  return Object.freeze({
    athleteId: input.athleteId,
    headline,
    narrative,
    highlights: dedupedHighlights,
    homeAvailable: input.homeExperience != null,
    dailyBriefAvailable: input.dailyBrief != null,
    weeklyReportAvailable: input.weeklyReport != null,
    snapshotAvailable: input.snapshot != null,
    generatedAt: input.generatedAt,
  });
}

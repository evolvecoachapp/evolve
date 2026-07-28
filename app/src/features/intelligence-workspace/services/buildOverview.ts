import type { DailyBrief } from "../../daily-brief/models/DailyBrief";
import type { HomeExperience } from "../../home-experience/models/HomeExperience";
import type { WeeklyCoachReport } from "../../weekly-report/models/WeeklyCoachReport";
import type { WorkspaceOverview } from "../models/WorkspaceOverview";

export interface BuildOverviewInput {
  readonly athleteId: string;
  readonly generatedAt: string;
  readonly homeExperience?: HomeExperience | null;
  readonly dailyBrief?: DailyBrief | null;
  readonly weeklyReport?: WeeklyCoachReport | null;
}

/**
 * Builds the workspace overview from Home Experience, Daily Brief, and Weekly Report.
 */
export function buildOverview(input: BuildOverviewInput): WorkspaceOverview {
  const highlights = [
    ...(input.homeExperience?.summary.highlights ?? Object.freeze([])),
    ...(input.dailyBrief?.summary.highlights ?? Object.freeze([])),
    ...(input.weeklyReport?.executiveSummary.weeklyHighlights ??
      Object.freeze([])),
  ];

  const dedupedHighlights = Object.freeze(Array.from(new Set(highlights)).slice(0, 6));
  const headline =
    input.weeklyReport?.executiveSummary.headline ??
    input.dailyBrief?.summary.headline ??
    input.homeExperience?.summary.headline ??
    "Athlete intelligence workspace";
  const summary =
    input.weeklyReport?.executiveSummary.narrative ??
    input.dailyBrief?.summary.narrative ??
    input.homeExperience?.summary.narrative ??
    "No premium coaching artifacts are currently composed for this athlete.";

  return Object.freeze({
    athleteId: input.athleteId,
    headline,
    summary,
    highlights: dedupedHighlights,
    homeAvailable: input.homeExperience != null,
    dailyBriefAvailable: input.dailyBrief != null,
    weeklyReportAvailable: input.weeklyReport != null,
    generatedAt: input.generatedAt,
  });
}

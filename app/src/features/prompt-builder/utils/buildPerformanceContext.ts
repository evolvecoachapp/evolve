import type { CoachInsight } from "../../coach-intelligence/models/CoachInsight";
import type { CoachSummary } from "../../coach-intelligence/models/CoachSummary";
import type { PerformanceContext } from "../models/PerformanceContext";

export interface BuildPerformanceContextInput {
  readonly summary: CoachSummary;
  readonly insights: readonly CoachInsight[];
}

/** Build performance context from summary progress and PR/plateau insights. */
export function buildPerformanceContext(
  input: BuildPerformanceContextInput,
): PerformanceContext {
  const personalRecordInsights = Object.freeze(
    input.insights.filter((insight) => insight.kind === "recent_pr"),
  );
  const plateauInsights = Object.freeze(
    input.insights.filter((insight) => insight.kind === "exercise_plateau"),
  );

  return Object.freeze({
    progress: input.summary.progress,
    personalRecordInsights,
    plateauInsights,
  });
}

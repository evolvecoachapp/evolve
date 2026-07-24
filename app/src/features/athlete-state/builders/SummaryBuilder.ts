import type { AthleteState } from "../models/AthleteState";
import type { StateSummary } from "../models/StateSummary";
import { formatAthleteHeadline, formatGoalTitles } from "../utils/FormattingHelpers";
import { buildStatistics } from "../utils/StatisticsHelpers";
import { freezeSummary } from "../utils/FreezeAthleteState";

export function buildStateSummary(input: {
  readonly state: AthleteState;
  readonly createdAt: string;
}): StateSummary {
  const stats = buildStatistics(input.state);
  const goals = formatGoalTitles(input.state);
  const details = Object.freeze([
    `Training focus: ${input.state.training.focus ?? "none"}`,
    `Recovery status: ${input.state.recovery.status ?? "unknown"}`,
    `Nutrition plan: ${input.state.nutrition.planId ?? "none"}`,
    `Goals: ${goals.length > 0 ? goals.join(", ") : "none"}`,
    `Readiness: ${input.state.readiness.label ?? "unknown"}`,
  ]);
  return freezeSummary({
    athleteId: input.state.athleteId,
    version: input.state.version,
    status: input.state.status.kind,
    headline: formatAthleteHeadline(input.state),
    details,
    statistics: stats,
    createdAt: input.createdAt,
  });
}

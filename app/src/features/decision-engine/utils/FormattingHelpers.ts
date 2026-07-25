import type { CoachingDecision } from "../models/CoachingDecision";
import type { DecisionSummary } from "../models/DecisionSummary";

export function formatDecisionHeadline(
  decisions: readonly CoachingDecision[],
): string {
  if (decisions.length === 0) return "No coaching decisions";
  const primary = decisions[0]!;
  return `${decisions.length} decision(s); primary=${primary.category}:${primary.intent}`;
}

export function formatSummaryLine(summary: DecisionSummary): string {
  return `${summary.headline} [${summary.focusAreas.join(", ")}]`;
}

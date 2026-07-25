import type { AdaptationDecision } from "../models/AdaptationDecision";
import type { AdaptationStatistics } from "../models/AdaptationStatistics";
import { freezeStatistics } from "./FreezeAdaptationState";

export function buildStatistics(
  decisions: readonly AdaptationDecision[],
): AdaptationStatistics {
  const byCategory: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  let totalTriggers = 0;
  let totalOpportunities = 0;
  const signals = new Set<string>();

  for (const d of decisions) {
    byCategory[d.category] = (byCategory[d.category] ?? 0) + 1;
    bySeverity[d.severity.level] = (bySeverity[d.severity.level] ?? 0) + 1;
    totalTriggers += d.triggers.length;
    totalOpportunities += d.opportunities.length;
    for (const k of d.signalKeys) signals.add(k);
  }

  return freezeStatistics({
    totalDecisions: decisions.length,
    totalTriggers,
    totalOpportunities,
    byCategory: Object.freeze({ ...byCategory }),
    bySeverity: Object.freeze({ ...bySeverity }),
    signalCount: signals.size,
  });
}

import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationStatistics } from "../models/RecommendationStatistics";
import { freezeStatistics } from "./FreezeRecommendationState";

export function computeRecommendationStatistics(input: {
  readonly recommendations: readonly CoachingRecommendation[];
  readonly conflictCount: number;
  readonly dependencyCount: number;
  readonly groupCount: number;
}): RecommendationStatistics {
  const byCategory: Record<string, number> = {};
  const byIntent: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let urgencySum = 0;
  for (const r of input.recommendations) {
    byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
    byIntent[r.intent] = (byIntent[r.intent] ?? 0) + 1;
    byType[r.type] = (byType[r.type] ?? 0) + 1;
    urgencySum += r.priority.urgency;
  }
  const total = input.recommendations.length;
  return freezeStatistics({
    total,
    byCategory,
    byIntent,
    byType,
    conflictCount: input.conflictCount,
    dependencyCount: input.dependencyCount,
    groupCount: input.groupCount,
    averageUrgency: total === 0 ? 0 : Math.round(urgencySum / total),
  });
}

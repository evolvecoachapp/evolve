import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { RecommendationConflict } from "../models/RecommendationConflict";
import type { RecommendationResolution } from "../models/RecommendationResolution";
import {
  RecommendationResolutionStrategies,
} from "../models/RecommendationResolution";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import {
  freezeConflict,
  freezeRecommendation,
  freezeResolution,
} from "../utils/FreezeRecommendationState";
import { comparePriority } from "../utils/PriorityHelpers";

/**
 * Deterministic conflict resolution — higher priority wins; losers deferred.
 */
export function resolveConflicts(input: {
  readonly recommendations: readonly CoachingRecommendation[];
  readonly conflicts: readonly RecommendationConflict[];
}): {
  readonly conflicts: readonly RecommendationConflict[];
  readonly resolutions: readonly RecommendationResolution[];
  readonly recommendations: readonly CoachingRecommendation[];
} {
  const byId = new Map(input.recommendations.map((r) => [r.id, r]));
  const loserIds = new Set<string>();
  const resolutions: RecommendationResolution[] = [];
  const resolvedConflicts: RecommendationConflict[] = [];

  for (const conflict of input.conflicts) {
    const left = byId.get(conflict.leftId);
    const right = byId.get(conflict.rightId);
    let winnerId: string | null = null;
    let losers: string[] = [];
    if (left && right) {
      const cmp = comparePriority(left.priority, right.priority);
      if (cmp <= 0) {
        winnerId = left.id;
        losers = [right.id];
      } else {
        winnerId = right.id;
        losers = [left.id];
      }
    } else {
      winnerId = left?.id ?? right?.id ?? null;
      losers = [];
    }
    for (const id of losers) loserIds.add(id);
    resolutions.push(
      freezeResolution({
        id: `resolution:${conflict.id}`,
        conflictId: conflict.id,
        strategy: RecommendationResolutionStrategies.KEEP_HIGHER_PRIORITY,
        winnerId,
        loserIds: Object.freeze(losers),
        notes: Object.freeze(["higher_priority_wins"]),
        metadata: EMPTY_RECOMMENDATION_METADATA,
      }),
    );
    resolvedConflicts.push(
      freezeConflict({
        ...conflict,
        resolved: true,
      }),
    );
  }

  const recommendations = Object.freeze(
    input.recommendations.map((r) => {
      if (!loserIds.has(r.id)) return freezeRecommendation(r);
      return freezeRecommendation({
        ...r,
        intent: "defer",
        metadata: Object.freeze({
          tags: Object.freeze([...r.metadata.tags, "conflict_loser"]),
          attributes: Object.freeze({ ...r.metadata.attributes }),
        }),
      });
    }),
  );

  return Object.freeze({
    conflicts: Object.freeze(resolvedConflicts),
    resolutions: Object.freeze(resolutions),
    recommendations,
  });
}

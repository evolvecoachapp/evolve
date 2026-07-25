import type { CoachingRecommendation } from "../models/CoachingRecommendation";
import type { ExplainabilityInput } from "../models/ExplainabilityInput";
import type { RecommendationConflict } from "../models/RecommendationConflict";
import type { RecommendationConstraint } from "../models/RecommendationConstraint";
import type { RecommendationContext } from "../models/RecommendationContext";
import type { RecommendationDependency } from "../models/RecommendationDependency";
import type { RecommendationGroup } from "../models/RecommendationGroup";
import type { RecommendationPackage } from "../models/RecommendationPackage";
import type { RecommendationPlan } from "../models/RecommendationPlan";
import type { RecommendationResolution } from "../models/RecommendationResolution";
import type { RecommendationSnapshot } from "../models/RecommendationSnapshot";
import type { RecommendationSummary } from "../models/RecommendationSummary";
import type { RecommendationTimeline } from "../models/RecommendationTimeline";
import type { RecommendationView } from "../models/RecommendationView";
import { EMPTY_RECOMMENDATION_METADATA } from "../models/RecommendationMetadata";
import { freezePackage } from "../utils/FreezeRecommendationState";
import { computeRecommendationStatistics } from "../utils/StatisticsHelpers";

/**
 * Deterministic packaging — structured package only.
 */
export function packageRecommendations(input: {
  readonly id: string;
  readonly recommendationContext: RecommendationContext;
  readonly recommendations: readonly CoachingRecommendation[];
  readonly conflicts: readonly RecommendationConflict[];
  readonly resolutions: readonly RecommendationResolution[];
  readonly constraints: readonly RecommendationConstraint[];
  readonly dependencies: readonly RecommendationDependency[];
  readonly groups: readonly RecommendationGroup[];
  readonly plan: RecommendationPlan | null;
  readonly view: RecommendationView | null;
  readonly summary: RecommendationSummary | null;
  readonly snapshot: RecommendationSnapshot | null;
  readonly timeline: RecommendationTimeline;
  readonly explainabilityInput: ExplainabilityInput | null;
  readonly diagnosticsNotes: readonly string[];
  readonly at: string;
}): RecommendationPackage {
  return freezePackage({
    id: input.id,
    athleteId: input.recommendationContext.athleteId,
    contextId: input.recommendationContext.contextId,
    recommendationContext: input.recommendationContext,
    recommendations: input.recommendations,
    conflicts: input.conflicts,
    resolutions: input.resolutions,
    constraints: input.constraints,
    dependencies: input.dependencies,
    groups: input.groups,
    plan: input.plan,
    view: input.view,
    summary: input.summary,
    snapshot: input.snapshot,
    statistics: computeRecommendationStatistics({
      recommendations: input.recommendations,
      conflictCount: input.conflicts.length,
      dependencyCount: input.dependencies.length,
      groupCount: input.groups.length,
    }),
    diagnostics: Object.freeze({
      notes: Object.freeze([...input.diagnosticsNotes]),
      warnings: Object.freeze([] as string[]),
      blockedIds: Object.freeze(
        input.recommendations
          .filter((r) => r.metadata.tags.includes("blocked_by_dependency"))
          .map((r) => r.id),
      ),
      deferredIds: Object.freeze(
        input.recommendations
          .filter((r) => r.intent === "defer")
          .map((r) => r.id),
      ),
      processingSteps: Object.freeze([
        "plan",
        "prioritize",
        "resolve",
        "package",
      ]),
    }),
    timeline: input.timeline,
    explainabilityInput: input.explainabilityInput,
    metadata: EMPTY_RECOMMENDATION_METADATA,
    createdAt: input.at,
  });
}

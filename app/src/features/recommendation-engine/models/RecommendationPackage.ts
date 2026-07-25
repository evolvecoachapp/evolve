import type { CoachingRecommendation } from "./CoachingRecommendation";
import type { ExplainabilityInput } from "./ExplainabilityInput";
import type { RecommendationConflict } from "./RecommendationConflict";
import type { RecommendationConstraint } from "./RecommendationConstraint";
import type { RecommendationContext } from "./RecommendationContext";
import type { RecommendationDependency } from "./RecommendationDependency";
import type { RecommendationDiagnostics } from "./RecommendationDiagnostics";
import type { RecommendationGroup } from "./RecommendationGroup";
import type { RecommendationMetadata } from "./RecommendationMetadata";
import type { RecommendationPlan } from "./RecommendationPlan";
import type { RecommendationResolution } from "./RecommendationResolution";
import type { RecommendationSnapshot } from "./RecommendationSnapshot";
import type { RecommendationStatistics } from "./RecommendationStatistics";
import type { RecommendationSummary } from "./RecommendationSummary";
import type { RecommendationTimeline } from "./RecommendationTimeline";
import type { RecommendationView } from "./RecommendationView";

/**
 * Immutable recommendation package for downstream consumers.
 */
export interface RecommendationPackage {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
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
  readonly statistics: RecommendationStatistics;
  readonly diagnostics: RecommendationDiagnostics;
  readonly timeline: RecommendationTimeline;
  readonly explainabilityInput: ExplainabilityInput | null;
  readonly metadata: RecommendationMetadata;
  readonly createdAt: string;
}

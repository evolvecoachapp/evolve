import type { CoachingDecision } from "./CoachingDecision";
  import type { DecisionCandidate } from "./DecisionCandidate";
  import type { DecisionConflict } from "./DecisionConflict";
  import type { DecisionConstraint } from "./DecisionConstraint";
  import type { DecisionContext } from "./DecisionContext";
  import type { DecisionDependency } from "./DecisionDependency";
  import type { DecisionDiagnostics } from "./DecisionDiagnostics";
  import type { DecisionEvaluation } from "./DecisionEvaluation";
  import type { DecisionGraph } from "./DecisionGraph";
  import type { DecisionMetadata } from "./DecisionMetadata";
  import type { DecisionPlan } from "./DecisionPlan";
  import type { DecisionResolution } from "./DecisionResolution";
  import type { DecisionSnapshot } from "./DecisionSnapshot";
  import type { DecisionStatistics } from "./DecisionStatistics";
  import type { DecisionSummary } from "./DecisionSummary";
  import type { DecisionTimeline } from "./DecisionTimeline";
  import type { RecommendationEngineInput } from "./RecommendationEngineInput";

/**
 * Immutable decision package for downstream consumers.
 */
export interface DecisionPackage {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisionContext: DecisionContext;
  readonly candidates: readonly DecisionCandidate[];
  readonly decisions: readonly CoachingDecision[];
  readonly evaluations: readonly DecisionEvaluation[];
  readonly conflicts: readonly DecisionConflict[];
  readonly resolutions: readonly DecisionResolution[];
  readonly constraints: readonly DecisionConstraint[];
  readonly dependencies: readonly DecisionDependency[];
  readonly plan: DecisionPlan | null;
  readonly graph: DecisionGraph | null;
  readonly summary: DecisionSummary | null;
  readonly snapshot: DecisionSnapshot | null;
  readonly statistics: DecisionStatistics;
  readonly diagnostics: DecisionDiagnostics;
  readonly timeline: DecisionTimeline;
  readonly recommendationInput: RecommendationEngineInput | null;
  readonly metadata: DecisionMetadata;
  readonly createdAt: string;
}

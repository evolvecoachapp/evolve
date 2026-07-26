import type { UnifiedCoachingContext } from "../../context-fusion/models/UnifiedCoachingContext";
import type { DecisionPackage } from "../../decision-engine/models/DecisionPackage";
import type { RecommendationPackage } from "../../recommendation-engine/models/RecommendationPackage";
import type { WorkoutGenerationResult } from "../../program-generation/models/WorkoutGenerationResult";
import type { WorkoutPlanProposal } from "../../workout-agent/models/WorkoutPlanProposal";
import type { WorkoutSession } from "../../workout-assembly/models/WorkoutSession";
import type { WorkoutConstraints } from "./WorkoutConstraints";
import type { WorkoutMetrics } from "./WorkoutMetrics";
import type { WorkoutNotes } from "./WorkoutNotes";
import type { WorkoutObjectives } from "./WorkoutObjectives";
import type { WorkoutPlanMetadata } from "./WorkoutPlanMetadata";
import type { WorkoutPlanStatistics } from "./WorkoutPlanStatistics";
import type { WorkoutPlanSummary } from "./WorkoutPlanSummary";
import type { WorkoutProgression } from "./WorkoutProgression";
import type { WorkoutTarget } from "./WorkoutTarget";
import type { WorkoutWarnings } from "./WorkoutWarnings";
import type { WorkoutWeek } from "./WorkoutWeek";

/**
 * Canonical immutable WorkoutPlan consumed by UI and downstream runtimes.
 * Assembled by the Workout Generation Pipeline — not an engine output by itself.
 */
export interface WorkoutPlan {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly decisionPackageId: string | null;
  readonly recommendationPackageId: string | null;
  readonly name: string;
  readonly proposal: WorkoutPlanProposal;
  readonly primarySession: WorkoutSession;
  readonly weeks: readonly WorkoutWeek[];
  readonly objectives: WorkoutObjectives;
  readonly constraints: WorkoutConstraints;
  readonly progression: WorkoutProgression;
  readonly targets: readonly WorkoutTarget[];
  readonly notes: WorkoutNotes;
  readonly warnings: WorkoutWarnings;
  readonly metrics: WorkoutMetrics;
  readonly statistics: WorkoutPlanStatistics;
  readonly summary: WorkoutPlanSummary;
  readonly metadata: WorkoutPlanMetadata;
  readonly unifiedContext: UnifiedCoachingContext | null;
  readonly decisionPackage: DecisionPackage | null;
  readonly recommendationPackage: RecommendationPackage | null;
  readonly generation: WorkoutGenerationResult;
  readonly createdAt: string;
  readonly frozenAt: string;
}

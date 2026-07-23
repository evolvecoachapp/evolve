import type { AggregationResult } from "./AggregationResult";
import type { CoachSupervisorContext } from "./CoachSupervisorContext";
import type { CoachSupervisorExecution } from "./CoachSupervisorExecution";
import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";
import type { CoachSupervisorPlan } from "./CoachSupervisorPlan";
import type { CoachSupervisorRequest } from "./CoachSupervisorRequest";
import type { CoachSupervisorSummary } from "./CoachSupervisorSummary";
import type { UnifiedCoachResponse } from "./UnifiedCoachResponse";

/**
 * Immutable point-in-time supervisor snapshot.
 */
export interface CoachSupervisorSnapshot {
  readonly id: string;
  readonly request: CoachSupervisorRequest;
  readonly context: CoachSupervisorContext | null;
  readonly plan: CoachSupervisorPlan | null;
  readonly execution: CoachSupervisorExecution | null;
  readonly aggregation: AggregationResult | null;
  readonly response: UnifiedCoachResponse | null;
  readonly summary: CoachSupervisorSummary | null;
  readonly agentIds: readonly string[];
  readonly metadata: CoachSupervisorMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}

import type { CoachSupervisorDecision } from "./CoachSupervisorDecision";
import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";
import type { CoordinationPlan } from "./CoordinationPlan";
import type { SupervisorReasoning } from "./SupervisorReasoning";

/**
 * Immutable supervisor plan wrapping coordination + decision.
 */
export interface CoachSupervisorPlan {
  readonly id: string;
  readonly requestId: string;
  readonly coordination: CoordinationPlan;
  readonly decision: CoachSupervisorDecision;
  readonly reasoning: SupervisorReasoning;
  readonly metadata: CoachSupervisorMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}

import type { CoachSupervisorMetadata } from "./CoachSupervisorMetadata";
import type { CoordinationContext } from "./CoordinationContext";
import type { CoordinationPhase } from "./CoordinationPhase";
import type { CoordinationStep } from "./CoordinationStep";
import type { SupervisorReasoning } from "./SupervisorReasoning";

/**
 * Immutable coordination plan produced by Supervisor planning.
 */
export interface CoordinationPlan {
  readonly id: string;
  readonly requestId: string;
  readonly context: CoordinationContext;
  readonly steps: readonly CoordinationStep[];
  readonly phases: readonly CoordinationPhase[];
  readonly orderedAgentIds: readonly string[];
  readonly orderedCapabilityIds: readonly string[];
  readonly routingPlanId: string | null;
  readonly reasoning: SupervisorReasoning;
  readonly metadata: CoachSupervisorMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}

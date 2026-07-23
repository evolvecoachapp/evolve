import type { CoachDecision } from "./CoachDecision";
import type { CoachExecutionContext } from "./CoachExecutionContext";
import type { CoachExecutionEvent } from "./CoachExecutionEvent";
import type { CoachExecutionPlan } from "./CoachExecutionPlan";
import type { CoachMetadata } from "./CoachMetadata";
import type { CoachRequest } from "./CoachRequest";
import type { CoachSummary } from "./CoachSummary";
import type { CoachValidation } from "./CoachValidation";
import type { SpecialistAgentOutputs } from "./SpecialistAgentInvocation";

/**
 * Immutable primary output of the Coach meta-agent.
 */
export interface CoachAgentResult {
  readonly id: string;
  readonly request: CoachRequest;
  readonly context: CoachExecutionContext;
  readonly plan: CoachExecutionPlan;
  readonly outputs: SpecialistAgentOutputs;
  readonly decision: CoachDecision;
  readonly validation: CoachValidation;
  readonly summary: CoachSummary;
  readonly events: readonly CoachExecutionEvent[];
  readonly success: boolean;
  readonly message: string | null;
  readonly metadata: CoachMetadata;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly frozenAt: string;
}

import type { SessionResult } from "../../coaching-session/models/SessionResult";
import type { MemoryResult } from "../../conversation-memory/models/MemoryResult";
import type { CoachSupervisorResult } from "../../coach-supervisor/models/CoachSupervisorResult";
import type { RoutingResult } from "../../supervisor-routing/models/RoutingResult";
import type { WorkoutPlan } from "../../workout-generation-pipeline/models/WorkoutPlan";
import type { CoachConversationContext } from "./CoachConversationContext";
import type { CoachConversationIntent } from "./CoachConversationIntent";
import type { CoachConversationRequest } from "./CoachConversationRequest";
import type { CoachConversationResponse } from "./CoachConversationResponse";

export const CoachConversationStages = {
  INTENT_ROUTING: "intent_routing",
  COACHING_SESSION: "coaching_session",
  SUPERVISOR_ROUTING: "supervisor_routing",
  COACH_SUPERVISOR: "coach_supervisor",
  CONTEXT_ASSEMBLY: "context_assembly",
  RESPONSE: "response",
  MEMORY: "memory",
} as const;

export type CoachConversationStage =
  (typeof CoachConversationStages)[keyof typeof CoachConversationStages];

export interface CoachConversationStageTrace {
  readonly stage: CoachConversationStage;
  readonly success: boolean;
  readonly summary: string;
  readonly completedAt: string;
}

/**
 * Immutable product output of a coaching conversation turn.
 */
export interface CoachConversationResult {
  readonly id: string;
  readonly success: boolean;
  readonly message: string;
  readonly intent: CoachConversationIntent;
  readonly request: CoachConversationRequest;
  readonly response: CoachConversationResponse | null;
  readonly context: CoachConversationContext | null;
  readonly sessionId: string | null;
  readonly conversationId: string;
  readonly workoutPlan: WorkoutPlan | null;
  readonly session: SessionResult | null;
  readonly routing: RoutingResult | null;
  readonly supervisor: CoachSupervisorResult | null;
  readonly memory: MemoryResult | null;
  readonly trace: readonly CoachConversationStageTrace[];
  readonly errors: readonly string[];
  readonly startedAt: string;
  readonly completedAt: string;
}

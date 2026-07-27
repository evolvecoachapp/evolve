import type { CoachConversationIntent } from "../../../coach-conversation/models/CoachConversationIntent";

/**
 * Immutable context used to compose an explainable coaching session.
 * Holds references only — no duplicated domain state.
 */
export interface CoachingSessionContext {
  readonly id: string;
  readonly athleteId: string;
  readonly conversationId: string;
  readonly sessionId: string | null;
  readonly userRequest: string;
  readonly conversationIntent: CoachConversationIntent;
  readonly lifecycleSessionId: string | null;
  readonly workoutPlanId: string | null;
  readonly planLineageId: string | null;
  readonly relatedDomains: readonly string[];
  readonly createdAt: string;
}

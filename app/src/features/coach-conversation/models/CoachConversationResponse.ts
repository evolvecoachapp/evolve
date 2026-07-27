import type { CoachConversationIntent } from "./CoachConversationIntent";

/**
 * Deterministic coaching reply for Conversation Runtime persistence / UI.
 */
export interface CoachConversationResponse {
  readonly id: string;
  readonly intent: CoachConversationIntent;
  readonly message: string;
  readonly referencesWorkoutPlan: boolean;
  readonly planId: string | null;
  readonly topics: readonly string[];
  readonly createdAt: string;
}

import type { WorkoutIntent } from "./WorkoutIntent";

/**
 * Conversation slice relevant to workout orchestration.
 */
export interface WorkoutConversation {
  readonly id: string;
  readonly conversationId: string | null;
  readonly turnCount: number;
  readonly lastUserMessage: string | null;
  readonly intent: WorkoutIntent;
  readonly summary: string | null;
}

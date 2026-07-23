import type { NutritionIntent } from "./NutritionIntent";

/**
 * Immutable conversation projection used by Nutrition Agent.
 */
export interface NutritionConversation {
  readonly id: string;
  readonly conversationId: string | null;
  readonly turnCount: number;
  readonly lastUserMessage: string;
  readonly intent: NutritionIntent;
  readonly summary: string | null;
}

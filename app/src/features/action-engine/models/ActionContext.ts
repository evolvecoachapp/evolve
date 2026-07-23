import type { ActionIntent } from "./ActionIntent";
import type { ActionPriority } from "./ActionPriority";

/**
 * Immutable planning context derived from CoachResponse.
 */
export interface ActionContext {
  readonly sourceResponseId: string;
  readonly intent: ActionIntent;
  readonly preferredPriority: ActionPriority;
  readonly hasExercises: boolean;
  readonly hasNutrition: boolean;
  readonly hasRecovery: boolean;
  readonly hasRecommendations: boolean;
  readonly hasActions: boolean;
  readonly hasQuestions: boolean;
  readonly hasWarnings: boolean;
  readonly confidenceScore: number;
  readonly createdAt: string;
}

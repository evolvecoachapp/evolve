import type { NutritionAgentMetadata } from "./NutritionMetadata";
import type { NutritionIntent } from "./NutritionIntent";
import type { NutritionGoal } from "./NutritionGoal";
import type { NutritionStrategy } from "./NutritionStrategy";
import type { NutritionPreferences } from "./NutritionPreferences";
import type { NutritionConstraints } from "./NutritionConstraints";
import type { BodyCompositionState } from "./BodyCompositionState";
import type { NutritionActivityLevel } from "./NutritionRequest";

/**
 * Immutable orchestration context assembled before reasoning / planning.
 */
export interface NutritionContext {
  readonly id: string;
  readonly requestId: string;
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly intent: NutritionIntent;
  readonly goal: NutritionGoal;
  readonly strategy: NutritionStrategy | null;
  readonly bodyWeightKg: number;
  readonly activityLevel: NutritionActivityLevel;
  readonly constraints: NutritionConstraints;
  readonly preferences: NutritionPreferences;
  readonly bodyComposition: BodyCompositionState;
  readonly conversationSummary: string | null;
  readonly coachResponseId: string | null;
  readonly actionPlanId: string | null;
  readonly toolResultIds: readonly string[];
  readonly memoryTurnCount: number;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
  readonly metadata: NutritionAgentMetadata;
  readonly frozenAt: string;
}

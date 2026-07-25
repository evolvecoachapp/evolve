import type { AthleteStateRef } from "./AthleteStateRef";
import type { CoachContextRef } from "./CoachContextRef";
import type { NutritionAdaptationDecisionRef } from "./NutritionAdaptationDecisionRef";
import type { NutritionMetadata } from "./NutritionMetadata";
import type { PlanRef } from "./PlanRef";
import type { RuntimeRef } from "./RuntimeRef";

export interface NutritionAdaptationContext {
  readonly id: string;
  readonly athleteId: string;
  readonly planId: string;
  readonly contextId: string;
  readonly planRef: PlanRef | null;
  readonly runtimeRef: RuntimeRef | null;
  readonly athleteStateRef: AthleteStateRef | null;
  readonly coachContextRef: CoachContextRef | null;
  readonly decisionRef: NutritionAdaptationDecisionRef | null;
  readonly signalKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}

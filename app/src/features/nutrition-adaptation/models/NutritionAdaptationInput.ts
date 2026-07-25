import type { AthleteStateRef } from "./AthleteStateRef";
import type { CoachContextRef } from "./CoachContextRef";
import type { NutritionAdaptationDecisionRef } from "./NutritionAdaptationDecisionRef";
import type { NutritionMetadata } from "./NutritionMetadata";
import type { NutritionSnapshot } from "./NutritionSnapshot";
import type { PlanRef } from "./PlanRef";
import type { RuntimeRef } from "./RuntimeRef";

export const NutritionAdaptationInputKinds = {
  ADAPT: "adapt",
  COMPARE: "compare",
  DESCRIBE: "describe",
  SNAPSHOT: "snapshot",
  VALIDATE: "validate",
} as const;

export type NutritionAdaptationInputKind =
  (typeof NutritionAdaptationInputKinds)[keyof typeof NutritionAdaptationInputKinds];

export interface NutritionAdaptationInput {
  readonly id: string;
  readonly kind: NutritionAdaptationInputKind;
  readonly athleteId: string;
  readonly planId: string;
  readonly sessionId: string | null;
  readonly contextId: string;
  readonly planKeys: readonly string[];
  readonly dayKeys: readonly string[];
  readonly mealKeys: readonly string[];
  readonly macroKeys: readonly string[];
  readonly timingKeys: readonly string[];
  readonly weekKeys: readonly string[];
  readonly decisionKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly signalFlags: Readonly<Record<string, boolean>>;
  readonly priorSnapshot: NutritionSnapshot | null;
  readonly decisionRef: NutritionAdaptationDecisionRef | null;
  readonly planRef: PlanRef | null;
  readonly runtimeRef: RuntimeRef | null;
  readonly athleteStateRef: AthleteStateRef | null;
  readonly coachContextRef: CoachContextRef | null;
  readonly reason: string;
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}

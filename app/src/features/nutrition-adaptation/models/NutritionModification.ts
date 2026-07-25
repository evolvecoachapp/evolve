import type { NutritionMetadata } from "./NutritionMetadata";

export const NutritionModificationKinds = {
  ADJUSTMENT: "adjustment",
  REPLACEMENT: "replacement",
  INSERTION: "insertion",
  REMOVAL: "removal",
} as const;

export type NutritionModificationKind =
  (typeof NutritionModificationKinds)[keyof typeof NutritionModificationKinds];

export interface NutritionModification {
  readonly id: string;
  readonly kind: NutritionModificationKind;
  readonly targetKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
  readonly createdAt: string;
}

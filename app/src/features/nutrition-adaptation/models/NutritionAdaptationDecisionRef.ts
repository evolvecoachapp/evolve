/** Structural reference to Continuous Adaptation decision ids/keys. */
export interface NutritionAdaptationDecisionRef {
  readonly id: string;
  readonly athleteId: string;
  readonly decisionIds: readonly string[];
  readonly decisionKeys: readonly string[];
}

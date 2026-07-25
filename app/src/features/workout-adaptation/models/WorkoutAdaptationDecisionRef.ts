/** Structural reference to Continuous Adaptation decision ids/keys. */
export interface WorkoutAdaptationDecisionRef {
  readonly id: string;
  readonly athleteId: string;
  readonly decisionIds: readonly string[];
  readonly decisionKeys: readonly string[];
}

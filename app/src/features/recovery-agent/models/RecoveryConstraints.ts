export interface RecoveryConstraints {
  readonly medicalClearanceRequired: boolean;
  readonly avoidDeload: boolean;
  readonly prioritizeSleep: boolean;
  readonly prioritizeStress: boolean;
  readonly maxTrainingLoad: number | null;
  readonly notes: readonly string[];
}

export const DEFAULT_RECOVERY_CONSTRAINTS: RecoveryConstraints = Object.freeze({
  medicalClearanceRequired: false,
  avoidDeload: false,
  prioritizeSleep: false,
  prioritizeStress: false,
  maxTrainingLoad: null,
  notes: Object.freeze([] as string[]),
});

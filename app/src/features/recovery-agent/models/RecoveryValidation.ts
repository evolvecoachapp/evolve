export const RecoveryValidationCodes = Object.freeze({
  INVALID_RECOVERY_SCORE: "invalid_recovery_score" as const,
  INVALID_SLEEP: "invalid_sleep" as const,
  INVALID_STRESS: "invalid_stress" as const,
  INVALID_TRAINING_LOAD: "invalid_training_load" as const,
  INVALID_FATIGUE: "invalid_fatigue" as const,
  INVALID_DOMS: "invalid_doms" as const,
  INVALID_PROTOCOL: "invalid_protocol" as const,
  INVALID_RECOMMENDATION: "invalid_recommendation" as const,
  SAFETY_VIOLATION: "safety_violation" as const,
  CONSISTENCY_ERROR: "consistency_error" as const,
  POLICY_VIOLATION: "policy_violation" as const,
  CONSTRAINT_VIOLATION: "constraint_violation" as const,
});

export type RecoveryValidationCode =
  (typeof RecoveryValidationCodes)[keyof typeof RecoveryValidationCodes];

export interface RecoveryValidationIssue {
  readonly code: RecoveryValidationCode | "policy_violation";
  readonly message: string;
  readonly path: string;
}

export interface RecoveryValidation {
  readonly valid: boolean;
  readonly issues: readonly RecoveryValidationIssue[];
}

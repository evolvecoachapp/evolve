export const RecoveryIntents = Object.freeze({
  ASSESS_RECOVERY: "assess_recovery" as const,
  PLAN_RECOVERY: "plan_recovery" as const,
  DELOAD_ADVICE: "deload_advice" as const,
  SLEEP_ADVICE: "sleep_advice" as const,
  STRESS_ADVICE: "stress_advice" as const,
  READINESS_CHECK: "readiness_check" as const,
  FATIGUE_CHECK: "fatigue_check" as const,
  WELLNESS_CHECK: "wellness_check" as const,
  RECOVERY_EDUCATION: "recovery_education" as const,
  UNKNOWN: "unknown" as const,
});

export type RecoveryIntent =
  (typeof RecoveryIntents)[keyof typeof RecoveryIntents];

export const ALL_RECOVERY_INTENTS: readonly RecoveryIntent[] = Object.freeze(
  Object.values(RecoveryIntents),
);

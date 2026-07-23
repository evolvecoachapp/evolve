export const RecoveryGoals = Object.freeze({
  FULL_RECOVERY: "full_recovery" as const,
  ACTIVE_RECOVERY: "active_recovery" as const,
  SLEEP_OPTIMIZATION: "sleep_optimization" as const,
  FATIGUE_MANAGEMENT: "fatigue_management" as const,
  STRESS_REDUCTION: "stress_reduction" as const,
  PERFORMANCE_RECOVERY: "performance_recovery" as const,
  POWERLIFTING_RECOVERY: "powerlifting_recovery" as const,
  HYPERTROPHY_RECOVERY: "hypertrophy_recovery" as const,
  COMPETITION_RECOVERY: "competition_recovery" as const,
  GENERAL_WELLNESS: "general_wellness" as const,
  UNKNOWN: "unknown" as const,
});

export type RecoveryGoal = (typeof RecoveryGoals)[keyof typeof RecoveryGoals];

export const ALL_RECOVERY_GOALS: readonly RecoveryGoal[] = Object.freeze(
  Object.values(RecoveryGoals),
);

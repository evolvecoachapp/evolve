/** Supported recovery progress integration event types — represent only. */
export type RecoveryProgressEventType =
  | "RecoveryDayStarted"
  | "RecoveryAssessed"
  | "SleepLogged"
  | "StressUpdated"
  | "ReadinessUpdated"
  | "HRVLogged"
  | "FatigueUpdated"
  | "RecoveryGoalAchieved";

export const RECOVERY_PROGRESS_EVENT_TYPES: readonly RecoveryProgressEventType[] =
  Object.freeze([
    "RecoveryDayStarted",
    "RecoveryAssessed",
    "SleepLogged",
    "StressUpdated",
    "ReadinessUpdated",
    "HRVLogged",
    "FatigueUpdated",
    "RecoveryGoalAchieved",
  ]);

export function isRecoveryProgressEventType(
  value: string,
): value is RecoveryProgressEventType {
  return (RECOVERY_PROGRESS_EVENT_TYPES as readonly string[]).includes(value);
}

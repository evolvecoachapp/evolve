/** Recovery tracking and display preferences. */
export interface RecoverySettings {
  trackSleep: boolean;
  trackHrv: boolean;
  trackRestingHeartRate: boolean;
  showRecoveryScore: boolean;
  minimumSleepHours: number;
  targetSleepHours: number;
  includeRecoveryInHome: boolean;
}

/**
 * Session / evaluation context for an achievement.
 */
export interface AchievementContext {
  readonly sessionId: string;
  readonly runtimeId: string;
  readonly athleteId: string | null;
  readonly performanceSnapshotId: string;
  readonly dayId: string | null;
  readonly weekNumber: number | null;
  readonly evaluatedAt: string;
}

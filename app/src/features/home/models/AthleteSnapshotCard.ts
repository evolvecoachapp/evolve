/** Immutable athlete snapshot card for the Home dashboard header. */
export interface AthleteSnapshotCard {
  readonly displayName: string;
  readonly initials: string;
  readonly greeting: string;
  readonly dateLabel: string;
  readonly subtitle: string;
  readonly streakDays: number;
  readonly recoveryScore: number;
  readonly workoutsCompleted: number;
  readonly workoutsTarget: number;
  readonly avgCalories: number;
  readonly present: boolean;
}

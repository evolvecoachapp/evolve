/** Week-over-week training and adherence snapshot. */
export interface WeeklyProgress {
  weekStart: string;
  workoutsCompleted: number;
  workoutsTarget: number;
  adherencePercent: number;
  avgCalories?: number;
  weightChangeKg?: number;
}

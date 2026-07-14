/** Month-over-month progress rollup. */
export interface MonthlyProgress {
  month: string;
  workoutsCompleted: number;
  avgAdherencePercent: number;
  weightChangeKg: number;
  strengthChangePercent: number;
}

export interface RecoveryTrendPoint {
  date: string;
  score: number;
}

/** Recovery score trend over time. */
export interface RecoveryTrend {
  points: RecoveryTrendPoint[];
  averageScore: number;
  trend: "improving" | "stable" | "declining";
}

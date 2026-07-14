export interface PersonalRecordEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  achievedAt: string;
}

/** Historical personal records across exercises. */
export interface PersonalRecordHistory {
  records: PersonalRecordEntry[];
  recentCount: number;
}

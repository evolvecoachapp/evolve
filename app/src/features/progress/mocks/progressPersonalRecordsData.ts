import type { PersonalRecordHistory } from "../models/PersonalRecordHistory";

export const mockPersonalRecordsData: PersonalRecordHistory = {
  recentCount: 3,
  records: [
    {
      id: "pr-1",
      exerciseId: "ex-bench-press",
      exerciseName: "Bench Press",
      weightKg: 85,
      reps: 5,
      achievedAt: "2026-07-08",
    },
    {
      id: "pr-2",
      exerciseId: "ex-squat",
      exerciseName: "Back Squat",
      weightKg: 110,
      reps: 5,
      achievedAt: "2026-07-01",
    },
    {
      id: "pr-3",
      exerciseId: "ex-deadlift",
      exerciseName: "Deadlift",
      weightKg: 130,
      reps: 3,
      achievedAt: "2026-06-24",
    },
    {
      id: "pr-4",
      exerciseId: "ex-overhead-press",
      exerciseName: "Overhead Press",
      weightKg: 55,
      reps: 6,
      achievedAt: "2026-06-17",
    },
  ],
};

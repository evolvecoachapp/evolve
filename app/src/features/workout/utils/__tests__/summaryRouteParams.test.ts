import type { WorkoutSummary } from "../../models/WorkoutSummary";
import {
  parseWorkoutSummaryParams,
  serializeWorkoutSummaryParams,
} from "../summaryRouteParams";

const sampleSummary: WorkoutSummary = {
  sessionId: "session-1",
  workoutId: "workout-1",
  title: "Leg Day",
  durationMinutes: 55,
  totalVolumeKg: 4200,
  completedSets: 12,
  totalSets: 15,
  completedExercises: 4,
  totalExercises: 5,
  skippedExercises: 0,
  completedAt: "2026-07-01T11:00:00Z",
};

describe("summaryRouteParams", () => {
  it("round-trips a workout summary through route params", () => {
    const params = serializeWorkoutSummaryParams(sampleSummary);
    expect(parseWorkoutSummaryParams(params)).toEqual(sampleSummary);
  });

  it("returns null when required params are missing", () => {
    expect(parseWorkoutSummaryParams({ sessionId: "session-1" })).toBeNull();
  });
});

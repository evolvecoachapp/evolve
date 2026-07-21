import type { WorkoutSessionSummary } from "../../types/workoutSessionSummary";
import {
  consumePendingSessionSummary,
  setPendingSessionSummary,
} from "../sessionSummaryHandoff";

const sampleSummary: WorkoutSessionSummary = Object.freeze({
  sessionId: "session:day:1",
  title: "Upper A",
  programName: "Hypertrophy Block",
  durationSeconds: 2700,
  completedExercises: 2,
  totalExercises: 2,
  completedSets: 6,
  skippedSets: 0,
  totalSets: 6,
  completionPercent: 100,
  estimatedVolumeKg: 2400,
  averageCompletedReps: 9.5,
  completedAt: "2026-07-21T11:00:00.000Z",
});

describe("sessionSummaryHandoff", () => {
  it("consumes a matching pending summary once", () => {
    setPendingSessionSummary(sampleSummary);

    expect(consumePendingSessionSummary("session:day:1")).toEqual(sampleSummary);
    expect(consumePendingSessionSummary("session:day:1")).toBeNull();
  });

  it("ignores a mismatched session id", () => {
    setPendingSessionSummary(sampleSummary);
    expect(consumePendingSessionSummary("session:other")).toBeNull();
    expect(consumePendingSessionSummary("session:day:1")).toEqual(sampleSummary);
  });
});

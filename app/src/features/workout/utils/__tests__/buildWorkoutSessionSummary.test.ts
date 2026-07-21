import type { WorkoutSession } from "../../../training/application";
import {
  completeSet,
  createInitialExecutionState,
  skipSet,
  updateCompletedLoad,
  updateCompletedReps,
} from "../sessionExecutionState";
import { buildWorkoutSessionSummary } from "../buildWorkoutSessionSummary";

function createFixtureSession(): WorkoutSession {
  return Object.freeze({
    id: "session:day:1",
    title: "Upper A",
    subtitle: "Hypertrophy Block · Chest",
    status: "ready",
    dayId: "day:1",
    dayIndex: 0,
    programTitle: "Hypertrophy Block",
    goalLabel: "Hypertrophy",
    primaryFocus: Object.freeze(["Chest"]),
    exercises: Object.freeze([
      Object.freeze({
        id: "ex:1",
        name: "Bench Press",
        order: 0,
        sets: Object.freeze([
          Object.freeze({
            id: "set:1",
            order: 0,
            setType: "working",
            setTypeLabel: "Working",
            targetReps: Object.freeze({ min: 8, max: 10, label: "8–10" }),
            intensity: Object.freeze({ metric: "rir", value: 2, label: "RIR 2" }),
            restSeconds: 120,
            prescriptionNotes: null,
            notes: null,
            completed: false,
            completedReps: null,
            completedLoad: null,
          }),
          Object.freeze({
            id: "set:2",
            order: 1,
            setType: "warmup",
            setTypeLabel: "Warm-up",
            targetReps: Object.freeze({ min: 8, max: 8, label: "8" }),
            intensity: null,
            restSeconds: 60,
            prescriptionNotes: null,
            notes: null,
            completed: false,
            completedReps: null,
            completedLoad: null,
          }),
        ]),
        notes: null,
        completed: false,
        skipped: false,
        progressionReference: null,
        supersetGroup: null,
      }),
      Object.freeze({
        id: "ex:2",
        name: "Row",
        order: 1,
        sets: Object.freeze([
          Object.freeze({
            id: "set:3",
            order: 0,
            setType: "working",
            setTypeLabel: "Working",
            targetReps: Object.freeze({ min: 10, max: 12, label: "10–12" }),
            intensity: null,
            restSeconds: 90,
            prescriptionNotes: null,
            notes: null,
            completed: false,
            completedReps: null,
            completedLoad: null,
          }),
        ]),
        notes: null,
        completed: false,
        skipped: false,
        progressionReference: null,
        supersetGroup: null,
      }),
    ]),
    progressionReferences: Object.freeze([]),
    notes: null,
    startedAt: null,
    completedAt: null,
  });
}

describe("buildWorkoutSessionSummary", () => {
  it("maps overlay metrics into a frozen WorkoutSessionSummary", () => {
    const session = createFixtureSession();
    let execution = createInitialExecutionState(session);

    execution = completeSet(execution, "set:1", 8);
    execution = updateCompletedReps(execution, "set:1", 10);
    execution = updateCompletedLoad(execution, "set:1", 60);
    execution = completeSet(execution, "set:2", 8);
    execution = updateCompletedReps(execution, "set:2", 8);
    execution = updateCompletedLoad(execution, "set:2", 40);
    execution = skipSet(execution, "set:3");

    const frozenSession = session;
    const summary = buildWorkoutSessionSummary(session, execution, {
      startedAt: "2026-07-21T10:00:00.000Z",
      completedAt: "2026-07-21T10:45:30.000Z",
    });

    expect(summary).toEqual({
      sessionId: "session:day:1",
      title: "Upper A",
      durationSeconds: 2730,
      completedExercises: 1,
      totalExercises: 2,
      completedSets: 2,
      skippedSets: 1,
      totalSets: 3,
      completionPercent: 100,
      estimatedVolumeKg: 920,
      averageCompletedReps: 10,
      completedAt: "2026-07-21T10:45:30.000Z",
    });

    // Immutable prescription must remain untouched.
    expect(frozenSession.status).toBe("ready");
    expect(frozenSession.startedAt).toBeNull();
    expect(frozenSession.completedAt).toBeNull();
    expect(frozenSession.exercises[0]?.sets[0]?.completed).toBe(false);
  });

  it("returns null average reps when no working sets were completed", () => {
    const session = createFixtureSession();
    let execution = createInitialExecutionState(session);
    execution = skipSet(execution, "set:1");
    execution = skipSet(execution, "set:2");
    execution = skipSet(execution, "set:3");

    const summary = buildWorkoutSessionSummary(session, execution, {
      startedAt: "2026-07-21T10:00:00.000Z",
      completedAt: "2026-07-21T10:05:00.000Z",
    });

    expect(summary.completedSets).toBe(0);
    expect(summary.skippedSets).toBe(3);
    expect(summary.completedExercises).toBe(0);
    expect(summary.estimatedVolumeKg).toBe(0);
    expect(summary.averageCompletedReps).toBeNull();
    expect(summary.completionPercent).toBe(100);
  });
});

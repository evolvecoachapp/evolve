import type { WorkoutSession } from "../../../training/application";
import {
  completeSet,
  computeExerciseProgress,
  computeSessionProgress,
  createInitialExecutionState,
  deriveInteractionStatus,
  getSetExecution,
  skipSet,
  uncompleteSet,
  unskipSet,
  updateCompletedLoad,
  updateCompletedReps,
} from "../sessionExecutionState";

function createFixtureSession(): WorkoutSession {
  return Object.freeze({
    id: "session:day:1",
    title: "Upper A",
    subtitle: "Hypertrophy Block",
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
            setType: "working",
            setTypeLabel: "Working",
            targetReps: Object.freeze({ min: 8, max: 10, label: "8–10" }),
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

describe("sessionExecutionState", () => {
  it("creates an empty overlay for every set without mutating the session", () => {
    const session = createFixtureSession();
    const execution = createInitialExecutionState(session);

    expect(Object.keys(execution.sets)).toEqual(["set:1", "set:2", "set:3"]);
    expect(getSetExecution(execution, "set:1").status).toBe("pending");
    expect(Object.isFrozen(session)).toBe(true);
    expect(session.exercises[0]!.sets[0]!.completed).toBe(false);
  });

  it("completes a set with default reps and supports uncomplete", () => {
    const session = createFixtureSession();
    let execution = createInitialExecutionState(session);

    execution = completeSet(execution, "set:1", 8);
    expect(getSetExecution(execution, "set:1")).toEqual({
      status: "completed",
      completedReps: 8,
      completedLoad: null,
    });

    execution = updateCompletedLoad(execution, "set:1", 60.5);
    execution = updateCompletedReps(execution, "set:1", 9);
    expect(getSetExecution(execution, "set:1").completedLoad).toBe(60.5);
    expect(getSetExecution(execution, "set:1").completedReps).toBe(9);

    execution = uncompleteSet(execution, "set:1");
    expect(getSetExecution(execution, "set:1").status).toBe("pending");
    expect(getSetExecution(execution, "set:1").completedReps).toBe(9);
    expect(getSetExecution(execution, "set:1").completedLoad).toBe(60.5);
  });

  it("skips and restores a set", () => {
    const session = createFixtureSession();
    let execution = createInitialExecutionState(session);

    execution = skipSet(execution, "set:2");
    expect(getSetExecution(execution, "set:2").status).toBe("skipped");

    execution = unskipSet(execution, "set:2");
    expect(getSetExecution(execution, "set:2").status).toBe("pending");
  });

  it("does not complete a skipped set until unskipped", () => {
    const session = createFixtureSession();
    let execution = createInitialExecutionState(session);
    execution = skipSet(execution, "set:1");
    const after = completeSet(execution, "set:1", 8);
    expect(after).toBe(execution);
    expect(getSetExecution(after, "set:1").status).toBe("skipped");
  });

  it("computes session and exercise progress", () => {
    const session = createFixtureSession();
    let execution = createInitialExecutionState(session);

    execution = completeSet(execution, "set:1", 8);
    execution = skipSet(execution, "set:2");

    const sessionProgress = computeSessionProgress(session, execution);
    expect(sessionProgress).toMatchObject({
      totalSets: 3,
      completedSets: 1,
      skippedSets: 1,
      accountedSets: 2,
      pendingSets: 1,
      percent: 67,
    });
    expect(deriveInteractionStatus(sessionProgress)).toBe("in_progress");

    const exerciseProgress = computeExerciseProgress(session.exercises[0]!, execution);
    expect(exerciseProgress.isComplete).toBe(true);
    expect(exerciseProgress.percent).toBe(100);

    execution = completeSet(execution, "set:3", 10);
    const done = computeSessionProgress(session, execution);
    expect(deriveInteractionStatus(done)).toBe("completed");
    expect(done.percent).toBe(100);
  });
});

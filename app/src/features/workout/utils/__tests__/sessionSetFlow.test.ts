import type { WorkoutSession } from "../../../training/application";
import {
  createInitialExecutionState,
  completeSet,
  skipSet,
} from "../sessionExecutionState";
import {
  findFirstPendingSetId,
  findNextPendingSetId,
  formatUpcomingSetLabel,
  isWorkingSet,
  shouldStartRestAfterComplete,
  withProvisionalSetStatus,
} from "../sessionSetFlow";

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
            id: "set:warmup",
            order: 0,
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
          Object.freeze({
            id: "set:1",
            order: 1,
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
            order: 2,
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
    ]),
    progressionReferences: Object.freeze([]),
    notes: null,
    startedAt: null,
    completedAt: null,
  });
}

describe("sessionSetFlow", () => {
  it("detects working sets only", () => {
    const session = createFixtureSession();
    expect(isWorkingSet(session.exercises[0]!.sets[0]!)).toBe(false);
    expect(isWorkingSet(session.exercises[0]!.sets[1]!)).toBe(true);
  });

  it("finds the first and next pending sets", () => {
    const session = createFixtureSession();
    let execution = createInitialExecutionState(session);

    expect(findFirstPendingSetId(session, execution)).toBe("set:warmup");

    execution = completeSet(execution, "set:warmup", 8);
    expect(findNextPendingSetId(session, execution, "set:warmup")).toBe("set:1");

    execution = skipSet(execution, "set:1");
    expect(findNextPendingSetId(session, execution, "set:1")).toBe("set:2");
  });

  it("starts rest only after a working set with remaining pending work", () => {
    const session = createFixtureSession();
    let execution = createInitialExecutionState(session);
    execution = completeSet(execution, "set:warmup", 8);

    expect(shouldStartRestAfterComplete(session, execution, "set:warmup")).toEqual({
      start: false,
    });

    execution = completeSet(execution, "set:1", 8);
    expect(shouldStartRestAfterComplete(session, execution, "set:1")).toEqual({
      start: true,
      durationSeconds: 120,
      upcomingSetId: "set:2",
    });

    execution = completeSet(execution, "set:2", 8);
    expect(shouldStartRestAfterComplete(session, execution, "set:2")).toEqual({
      start: false,
    });
  });

  it("supports provisional status for same-tick timing decisions", () => {
    const session = createFixtureSession();
    const execution = createInitialExecutionState(session);
    const provisional = withProvisionalSetStatus(execution, "set:1", "completed");

    expect(shouldStartRestAfterComplete(session, provisional, "set:1")).toEqual({
      start: true,
      durationSeconds: 120,
      upcomingSetId: "set:2",
    });
    expect(
      formatUpcomingSetLabel({
        setId: "set:2",
        exerciseId: "ex:1",
        exerciseName: "Bench Press",
        setOrder: 2,
        setType: "working",
        setTypeLabel: "Working",
        restSeconds: 90,
      }),
    ).toBe("Working · Set 3");
  });
});

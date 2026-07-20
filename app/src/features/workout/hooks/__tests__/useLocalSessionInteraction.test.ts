import { act, renderHook } from "@testing-library/react-native";
import type { WorkoutSession } from "../../../training/application";
import { useLocalSessionInteraction } from "../useLocalSessionInteraction";

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
    ]),
    progressionReferences: Object.freeze([]),
    notes: null,
    startedAt: null,
    completedAt: null,
  });
}

describe("useLocalSessionInteraction", () => {
  it("keeps the application session immutable while updating local execution", () => {
    const session = createFixtureSession();
    const { result } = renderHook(() => useLocalSessionInteraction(session));

    expect(result.current.interactionStatus).toBe("ready");
    expect(result.current.sessionProgress.percent).toBe(0);

    act(() => {
      result.current.completeSet("set:1", 8);
    });

    expect(result.current.getSetState("set:1").status).toBe("completed");
    expect(result.current.getSetState("set:1").completedReps).toBe(8);
    expect(result.current.interactionStatus).toBe("in_progress");
    expect(session.exercises[0]!.sets[0]!.completed).toBe(false);
    expect(Object.isFrozen(session)).toBe(true);
  });

  it("supports skip, unskip, uncomplete, and edits", () => {
    const session = createFixtureSession();
    const { result } = renderHook(() => useLocalSessionInteraction(session));

    act(() => {
      result.current.skipSet("set:2");
    });
    expect(result.current.getSetState("set:2").status).toBe("skipped");

    act(() => {
      result.current.unskipSet("set:2");
      result.current.completeSet("set:2", 8);
      result.current.updateCompletedReps("set:2", 10);
      result.current.updateCompletedLoad("set:2", 70);
    });

    expect(result.current.getSetState("set:2")).toEqual({
      status: "completed",
      completedReps: 10,
      completedLoad: 70,
    });

    act(() => {
      result.current.uncompleteSet("set:2");
    });
    expect(result.current.getSetState("set:2").status).toBe("pending");

    act(() => {
      result.current.completeSet("set:1", 8);
      result.current.completeSet("set:2", 8);
    });
    expect(result.current.interactionStatus).toBe("completed");
    expect(result.current.sessionProgress.percent).toBe(100);
  });

  it("exposes per-exercise progress", () => {
    const session = createFixtureSession();
    const { result } = renderHook(() => useLocalSessionInteraction(session));
    const exercise = session.exercises[0]!;

    act(() => {
      result.current.completeSet("set:1", 8);
    });

    const progress = result.current.getExerciseProgress(exercise);
    expect(progress.accountedSets).toBe(1);
    expect(progress.pendingSets).toBe(1);
    expect(progress.isComplete).toBe(false);
  });
});

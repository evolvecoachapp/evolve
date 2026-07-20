import { act, renderHook } from "@testing-library/react-native";
import type { WorkoutSession } from "../../../training/application";
import type { SessionExecutionState } from "../../types/sessionExecutionState";
import {
  createInitialExecutionState,
  completeSet,
} from "../../utils/sessionExecutionState";
import {
  useSessionTiming,
  type UseSessionTimingResult,
} from "../useSessionTiming";

interface SessionTimingHookProps {
  exec: SessionExecutionState;
}

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
            restSeconds: 30,
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

describe("useSessionTiming", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("selects the first pending set as active", () => {
    const session = createFixtureSession();
    const execution = createInitialExecutionState(session);
    const { result } = renderHook(() => useSessionTiming(session, execution));

    expect(result.current.activeSetId).toBe("set:1");
    expect(result.current.rest.status).toBe("idle");
  });

  it("starts rest after a working set and advances the active set", () => {
    const session = createFixtureSession();
    let execution = createInitialExecutionState(session);
    const { result, rerender } = renderHook<
      UseSessionTimingResult,
      SessionTimingHookProps
    >(({ exec }) => useSessionTiming(session, exec), {
      initialProps: { exec: execution },
    });

    act(() => {
      result.current.afterSetCompleted("set:1");
    });
    execution = completeSet(execution, "set:1", 8);
    rerender({ exec: execution });

    expect(result.current.rest.status).toBe("running");
    expect(result.current.rest.totalSeconds).toBe(30);
    expect(result.current.rest.upcomingSetId).toBe("set:2");
    expect(result.current.activeSetId).toBe("set:2");
  });

  it("supports pause, resume, and skip", () => {
    const session = createFixtureSession();
    const execution = createInitialExecutionState(session);
    const { result } = renderHook(() => useSessionTiming(session, execution));

    act(() => {
      result.current.afterSetCompleted("set:1");
    });

    act(() => {
      jest.advanceTimersByTime(5_000);
    });
    expect(result.current.rest.secondsLeft).toBe(25);

    act(() => {
      result.current.pauseRest();
    });
    expect(result.current.rest.status).toBe("paused");

    act(() => {
      jest.advanceTimersByTime(5_000);
    });
    expect(result.current.rest.secondsLeft).toBe(25);

    act(() => {
      result.current.resumeRest();
    });
    expect(result.current.rest.status).toBe("running");

    act(() => {
      result.current.skipRest();
    });
    expect(result.current.rest.status).toBe("idle");
    expect(result.current.activeSetId).toBe("set:2");
  });

  it("clears rest when the countdown reaches zero", () => {
    const session = createFixtureSession();
    const execution = createInitialExecutionState(session);
    const { result } = renderHook(() => useSessionTiming(session, execution));

    act(() => {
      result.current.afterSetCompleted("set:1");
    });

    act(() => {
      jest.advanceTimersByTime(30_000);
    });

    expect(result.current.rest.status).toBe("idle");
    expect(result.current.activeSetId).toBe("set:2");
  });

  it("skips rest and advances when a set is skipped", () => {
    const session = createFixtureSession();
    const execution = createInitialExecutionState(session);
    const { result } = renderHook(() => useSessionTiming(session, execution));

    act(() => {
      result.current.afterSetSkipped("set:1");
    });

    expect(result.current.rest.status).toBe("idle");
    expect(result.current.activeSetId).toBe("set:2");
  });
});

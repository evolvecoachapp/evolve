import { renderHook, act } from "@testing-library/react-native";
import type { WorkoutSession } from "../../../training/application";
import type { SessionInteractionStatus } from "../../types/sessionExecutionState";
import type { WorkoutSessionSummary } from "../../types/workoutSessionSummary";
import type { UseSessionFinishResult } from "../useSessionFinish";
import { createInitialExecutionState, completeSet, skipSet } from "../../utils/sessionExecutionState";
import { useSessionFinish } from "../useSessionFinish";
import * as application from "../../application";

jest.mock("../../application", () => ({
  persistCompletedSession: jest.fn(() => Promise.resolve({})),
}));

const persistCompletedSession = application.persistCompletedSession as jest.MockedFunction<
  typeof application.persistCompletedSession
>;

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
            id: "set:2",
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

describe("useSessionFinish", () => {
  beforeEach(() => {
    persistCompletedSession.mockClear();
    persistCompletedSession.mockResolvedValue({
      id: "session:day:1",
      sessionId: "session:day:1",
      title: "Upper A",
      durationSeconds: 0,
      completedExercises: 1,
      totalExercises: 2,
      completedSets: 1,
      skippedSets: 1,
      totalSets: 2,
      completionPercent: 100,
      estimatedVolumeKg: 0,
      averageCompletedReps: null,
      completedAt: "2026-07-21T12:00:00.000Z",
    });
  });

  it("exposes canFinish only when interactionStatus is completed", () => {
    const session = createFixtureSession();
    const execution = createInitialExecutionState(session);

    const { result, rerender } = renderHook<
      UseSessionFinishResult,
      { status: SessionInteractionStatus }
    >(({ status }) => useSessionFinish(session, execution, status), {
      initialProps: { status: "in_progress" },
    });

    expect(result.current.canFinish).toBe(false);

    rerender({ status: "completed" });
    expect(result.current.canFinish).toBe(true);
  });

  it("persists a completed workout after building the summary", async () => {
    const session = createFixtureSession();
    let execution = createInitialExecutionState(session);
    execution = completeSet(execution, "set:1", 10);
    execution = skipSet(execution, "set:2");

    const { result } = renderHook(() =>
      useSessionFinish(session, execution, "completed"),
    );

    let summary: WorkoutSessionSummary | undefined;
    await act(async () => {
      summary = result.current.buildSummary();
      await Promise.resolve();
    });

    expect(summary).toMatchObject({
      sessionId: "session:day:1",
      title: "Upper A",
      completedSets: 1,
      skippedSets: 1,
      totalSets: 2,
      completionPercent: 100,
    });
    expect(persistCompletedSession).toHaveBeenCalledTimes(1);
    expect(persistCompletedSession).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: "session:day:1" }),
    );
  });

  it("still returns the summary when persistence rejects", async () => {
    persistCompletedSession.mockRejectedValueOnce(new Error("storage unavailable"));

    const session = createFixtureSession();
    let execution = createInitialExecutionState(session);
    execution = completeSet(execution, "set:1", 10);
    execution = skipSet(execution, "set:2");

    const { result } = renderHook(() =>
      useSessionFinish(session, execution, "completed"),
    );

    let summary: WorkoutSessionSummary | undefined;
    await act(async () => {
      summary = result.current.buildSummary();
      await Promise.resolve();
    });

    expect(summary?.sessionId).toBe("session:day:1");
  });
});

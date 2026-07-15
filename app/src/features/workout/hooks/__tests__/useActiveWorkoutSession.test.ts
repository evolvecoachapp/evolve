import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useActiveWorkoutSession } from "../useActiveWorkoutSession";
import { mockWorkoutService } from "../../providers/MockWorkoutService";
import type { WorkoutService } from "../../types/workoutService";
import type { WorkoutSession } from "../../models/WorkoutSession";

async function createStartedSession(): Promise<WorkoutSession> {
  const workout = await mockWorkoutService.getTodayWorkout();
  return mockWorkoutService.startWorkout(workout.id);
}

describe("useActiveWorkoutSession", () => {
  it("completes a set optimistically — one saveSet call, no follow-up getSession", async () => {
    const session = await createStartedSession();
    const service: WorkoutService = {
      ...mockWorkoutService,
      getSession: jest.fn(mockWorkoutService.getSession),
      saveSet: jest.fn(mockWorkoutService.saveSet),
    };

    const { result } = renderHook(() =>
      useActiveWorkoutSession({
        sessionId: session.id,
        initialSession: session,
        service,
      }),
    );

    await waitFor(() => expect(result.current.position).not.toBeNull());

    act(() => {
      result.current.setWeightInput("100");
      result.current.setRepsInput("8");
    });

    await act(async () => {
      await result.current.completeSet();
    });

    expect(service.saveSet).toHaveBeenCalledTimes(1);
    expect(service.getSession).not.toHaveBeenCalled();
    expect(result.current.isResting).toBe(true);
    expect(result.current.session?.exercises[0].workingSets[0]).toMatchObject({
      completed: true,
      completedReps: 8,
      completedWeight: 100,
    });
  });

  it("fetches the session via getSession when no initialSession is supplied", async () => {
    const session = await createStartedSession();
    const service: WorkoutService = {
      ...mockWorkoutService,
      getSession: jest.fn(mockWorkoutService.getSession),
    };

    const { result } = renderHook(() => useActiveWorkoutSession({ sessionId: session.id, service }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(service.getSession).toHaveBeenCalledWith(session.id);
    expect(result.current.session?.id).toBe(session.id);
  });

  it("reconciles via getSession when a save fails", async () => {
    const session = await createStartedSession();
    const getSessionSpy = jest.fn(mockWorkoutService.getSession);
    const service: WorkoutService = {
      ...mockWorkoutService,
      getSession: getSessionSpy,
      saveSet: jest.fn().mockRejectedValue(new Error("network error")),
    };

    const { result } = renderHook(() =>
      useActiveWorkoutSession({ sessionId: session.id, initialSession: session, service }),
    );

    await waitFor(() => expect(result.current.position).not.toBeNull());

    act(() => {
      result.current.setWeightInput("100");
      result.current.setRepsInput("8");
    });

    await act(async () => {
      await result.current.completeSet();
    });

    expect(result.current.inputError).toBe("network error");
    await waitFor(() => expect(getSessionSpy).toHaveBeenCalledWith(session.id));
  });

  it("rejects an empty rep count without calling saveSet", async () => {
    const session = await createStartedSession();
    const service: WorkoutService = { ...mockWorkoutService, saveSet: jest.fn() };

    const { result } = renderHook(() =>
      useActiveWorkoutSession({ sessionId: session.id, initialSession: session, service }),
    );

    await waitFor(() => expect(result.current.position).not.toBeNull());

    act(() => {
      result.current.setRepsInput("");
    });

    await act(async () => {
      await result.current.completeSet();
    });

    expect(result.current.inputError).toBe("Enter a valid rep count.");
    expect(service.saveSet).not.toHaveBeenCalled();
  });

  it("exposes rest timer controls (skip, +10s, -10s) after completing a set", async () => {
    const session = await createStartedSession();
    const { result } = renderHook(() =>
      useActiveWorkoutSession({ sessionId: session.id, initialSession: session, service: mockWorkoutService }),
    );

    await waitFor(() => expect(result.current.position).not.toBeNull());

    act(() => {
      result.current.setWeightInput("100");
      result.current.setRepsInput("8");
    });

    await act(async () => {
      await result.current.completeSet();
    });

    expect(result.current.isResting).toBe(true);
    const restingSeconds = result.current.restSecondsLeft;

    act(() => {
      result.current.addRestSeconds();
    });
    expect(result.current.restSecondsLeft).toBe(restingSeconds + 10);

    act(() => {
      result.current.skipRest();
    });
    expect(result.current.isResting).toBe(false);
  });

  it("finishes the workout and returns a summary", async () => {
    const session = await createStartedSession();
    const firstExercise = session.exercises[0];
    const firstSet = firstExercise.workingSets[0];

    await mockWorkoutService.saveSet({
      sessionId: session.id,
      exerciseId: firstExercise.id,
      setId: firstSet.id,
      completedReps: 8,
      completedWeight: 100,
      rpe: null,
      completed: true,
    });

    const refreshed = await mockWorkoutService.getSession(session.id);
    if (!refreshed) {
      throw new Error("Expected refreshed session.");
    }

    const { result } = renderHook(() =>
      useActiveWorkoutSession({
        sessionId: session.id,
        initialSession: refreshed,
        service: mockWorkoutService,
      }),
    );

    let summary = null;
    await act(async () => {
      summary = await result.current.finishWorkout();
    });

    expect(summary).toMatchObject({
      sessionId: session.id,
      completedSets: 1,
      totalVolumeKg: 800,
    });
  });
});

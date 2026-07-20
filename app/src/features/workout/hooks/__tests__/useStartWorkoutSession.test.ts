import { renderHook, act } from "@testing-library/react-native";
import {
  createWorkoutPreviewProvider,
  WorkoutSessionBuilder,
  type WorkoutProgramPreview,
} from "../../../training/application";
import { HYPERTROPHY_ATHLETE } from "../../../training/application/fixtures";
import { useStartWorkoutSession } from "../useStartWorkoutSession";

describe("useStartWorkoutSession", () => {
  it("builds an executable session via WorkoutSessionBuilder", () => {
    const preview = createWorkoutPreviewProvider().getPreview(HYPERTROPHY_ATHLETE);
    const trainingDay = preview.weeklySchedule.days.find((day) => !day.isRestDay);
    expect(trainingDay).toBeDefined();

    const builder = new WorkoutSessionBuilder();
    const { result } = renderHook(() => useStartWorkoutSession({ builder }));

    const session = result.current.startSession(preview, trainingDay!);

    expect(session.id).toBe(`session:${trainingDay!.id}`);
    expect(session.title).toBe(trainingDay!.name);
    expect(session.status).toBe("ready");
    expect(session.exercises.length).toBeGreaterThan(0);
    expect(Object.isFrozen(session)).toBe(true);
  });

  it("canStart is false for rest days and true for training days", () => {
    const preview = createWorkoutPreviewProvider().getPreview(
      HYPERTROPHY_ATHLETE,
    ) as WorkoutProgramPreview;
    const trainingDay = preview.weeklySchedule.days.find((day) => !day.isRestDay)!;
    const restDay = preview.weeklySchedule.days.find((day) => day.isRestDay)!;

    const { result } = renderHook(() => useStartWorkoutSession());

    expect(result.current.canStart(trainingDay)).toBe(true);
    expect(result.current.canStart(restDay)).toBe(false);
    expect(result.current.canStart(null)).toBe(false);
  });

  it("rejects rest days through the builder", () => {
    const preview = createWorkoutPreviewProvider().getPreview(HYPERTROPHY_ATHLETE);
    const restDay = preview.weeklySchedule.days.find((day) => day.isRestDay);
    expect(restDay).toBeDefined();

    const { result } = renderHook(() => useStartWorkoutSession());

    expect(() => result.current.startSession(preview, restDay!)).toThrow(/rest day/i);
  });

  it("uses an injected builder when provided", () => {
    const preview = createWorkoutPreviewProvider().getPreview(HYPERTROPHY_ATHLETE);
    const trainingDay = preview.weeklySchedule.days.find((day) => !day.isRestDay)!;
    const build = jest.fn().mockReturnValue(
      Object.freeze({
        id: "session:mock",
        title: "Mock",
        subtitle: "Mock",
        status: "ready",
        dayId: trainingDay.id,
        dayIndex: trainingDay.dayIndex,
        programTitle: preview.title,
        goalLabel: preview.goalLabel,
        primaryFocus: Object.freeze([]),
        exercises: Object.freeze([]),
        progressionReferences: Object.freeze([]),
        notes: null,
        startedAt: null,
        completedAt: null,
      }),
    );
    const builder = { build } as unknown as WorkoutSessionBuilder;

    const { result } = renderHook(() => useStartWorkoutSession({ builder }));

    act(() => {
      const session = result.current.startSession(preview, trainingDay);
      expect(session.id).toBe("session:mock");
    });

    expect(build).toHaveBeenCalledWith(preview, trainingDay);
  });
});

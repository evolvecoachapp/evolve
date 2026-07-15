import {
  backendWorkoutService,
  createWorkoutService,
  mockWorkoutService,
} from "..";
import { MOCK_TODAY_WORKOUT_ID } from "../../mocks/workoutCatalog";

describe("workoutService architecture", () => {
  it("defaults to the mock provider", () => {
    const service = createWorkoutService("mock");
    expect(service.providerId).toBe("mock");
  });

  it("returns today's seeded workout snapshot", async () => {
    const workout = await mockWorkoutService.getTodayWorkout();

    expect(workout.id).toBe(MOCK_TODAY_WORKOUT_ID);
    expect(workout.title).toBe("EVOLVE Powerbuilding Block 1");
    expect(workout.subtitle).toBe("Squat & Bench Strength");
    expect(workout.estimatedDuration).toBe(75);
    expect(workout.exercises).toHaveLength(5);
    expect(workout.scheduleLabels.weekLabel).toBe("Week 1");
    expect(workout.scheduleLabels.dayLabel).toBe("Day 1");
    expect(workout.coachRecommendations.length).toBeGreaterThan(0);
  });

  it("returns a fresh object on each mock fetch", async () => {
    const first = await mockWorkoutService.getTodayWorkout();
    const second = await mockWorkoutService.getTodayWorkout();

    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });

  it("starts, logs sets, and finishes a workout session", async () => {
    const workout = await mockWorkoutService.getTodayWorkout();
    const session = await mockWorkoutService.startWorkout(workout.id);
    const firstExercise = session.exercises[0];
    const firstSet = firstExercise.workingSets[0];

    await mockWorkoutService.saveSet({
      sessionId: session.id,
      exerciseId: firstExercise.id,
      setId: firstSet.id,
      completedReps: firstSet.targetReps,
      completedWeight: firstSet.targetWeight,
      rpe: firstSet.rpe,
      completed: true,
    });

    const summary = await mockWorkoutService.finishWorkout(session.id);
    const history = await mockWorkoutService.getHistory();

    expect(summary.completedSets).toBe(1);
    expect(summary.totalSets).toBeGreaterThan(1);
    expect(history.length).toBeGreaterThan(0);
  });

  it("exposes a backend provider distinct from the mock provider", () => {
    expect(backendWorkoutService.providerId).toBe("backend");
    expect(backendWorkoutService).not.toBe(mockWorkoutService);
  });

  it("defaults to the backend provider when no override is given", () => {
    const service = createWorkoutService();
    expect(service.providerId).toBe("backend");
  });
});

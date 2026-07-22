import { completeSet, startWorkout } from "../application";
import { WorkoutRuntimeBuilder } from "../builders";
import { calculateProgress, buildSummary, freezeRuntime } from "../utils";
import { createMinimalWorkoutSession } from "../testSupport/fixtures";

const FIXED = "2026-07-22T00:00:00.000Z";

describe("workout-runtime regression", () => {
  it("keeps completion percent deterministic for a full run", () => {
    const workout = startWorkout(createMinimalWorkoutSession(), {
      fixedTimestamp: FIXED,
      autoCompleteOnLastSet: true,
    });

    const percents: number[] = [workout.getProgress().completionPercent];
    for (let index = 0; index < 4; index += 1) {
      const summary = completeSet(workout, { repetitions: 5 });
      percents.push(summary.progress.completionPercent);
    }

    expect(percents).toEqual([0, 25, 50, 75, 100]);
    expect(workout.getState()).toBe("Completed");
  });

  it("builder + progress + summary stay consistent", () => {
    const session = createMinimalWorkoutSession();
    const runtime = new WorkoutRuntimeBuilder().build({
      session,
      state: "NotStarted",
      activateFirstExercise: true,
    });
    const frozen = freezeRuntime(runtime);
    const progress = calculateProgress(frozen.exercises);
    const summary = buildSummary(frozen);

    expect(progress.totalSets).toBe(4);
    expect(progress.completionPercent).toBe(0);
    expect(summary.sessionName).toBe(session.name);
    expect(summary.currentExerciseName).toBe("Back Squat");
    expect(Object.isFrozen(frozen)).toBe(true);
  });

  it("does not call or require program generation", () => {
    const session = createMinimalWorkoutSession();
    const workout = startWorkout(session, { fixedTimestamp: FIXED });
    completeSet(workout, { repetitions: 5 });
    completeSet(workout, { repetitions: 5 });
    completeSet(workout, { repetitions: 5 });
    const summary = completeSet(workout, { repetitions: 5 });
    expect(summary.sessionId).toBe(session.id);
    expect(summary.state).toBe("Completed");
  });
});

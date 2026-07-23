import {
  createDefaultReasoners,
  ExerciseReasoner,
  GoalReasoner,
  SplitReasoner,
} from "../reasoning";
import { WorkoutContextBuilder } from "../builders/WorkoutContextBuilder";
import {
  createWorkoutRequestFixture,
  createFixedClock,
} from "../testSupport/fixtures";
import { WorkoutObjectives } from "../models/WorkoutObjective";

describe("workout-agent reasoners", () => {
  const context = new WorkoutContextBuilder().build({
    request: createWorkoutRequestFixture(),
    clock: createFixedClock(),
  });

  it("creates default reasoners", () => {
    expect(createDefaultReasoners().length).toBeGreaterThanOrEqual(8);
  });

  it("GoalReasoner resolves objective", () => {
    const result = new GoalReasoner().reason(context);
    expect(result.topic).toBe("goal");
    expect(result.findings.some((f) => f.includes(WorkoutObjectives.HYPERTROPHY))).toBe(
      true,
    );
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("ExerciseReasoner and SplitReasoner produce findings", () => {
    const exercise = new ExerciseReasoner().reason(context);
    const split = new SplitReasoner().reason(context);
    expect(exercise.findings.length).toBeGreaterThan(0);
    expect(split.notes[0]).toBe("upper_lower");
  });
});

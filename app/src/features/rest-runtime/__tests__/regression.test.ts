import { WorkoutRuntimeBuilder } from "../../workout-runtime/builders";
import { createMinimalWorkoutSession } from "../../workout-runtime/testSupport/fixtures";
import { startRest, updateElapsedTime } from "../application";
import { RestRuntimeBuilder } from "../builders";
import {
  buildSummary,
  calculateProgress,
  freezeRuntime,
} from "../utils";
import {
  FIXED_TIMESTAMP,
  createMinimalRestSession,
} from "../testSupport/fixtures";

describe("rest-runtime regression", () => {
  it("keeps progress deterministic for a full rest run", () => {
    const rest = startRest(
      createMinimalRestSession({ targetDurationMs: 100_000 }),
      { fixedTimestamp: FIXED_TIMESTAMP },
    );

    const percents: number[] = [rest.getProgress().completionPercent];
    for (const elapsed of [25_000, 50_000, 75_000, 100_000]) {
      percents.push(updateElapsedTime(rest, elapsed).progress.completionPercent);
    }

    expect(percents).toEqual([0, 25, 50, 75, 100]);
  });

  it("builder + progress + summary stay consistent", () => {
    const session = createMinimalRestSession({ targetDurationMs: 80_000 });
    const runtime = new RestRuntimeBuilder().build({
      session,
      state: "Idle",
    });
    const frozen = freezeRuntime(runtime);
    const progress = calculateProgress(
      frozen.configuration.targetDurationMs,
      frozen.progress.elapsedMs,
    );
    const summary = buildSummary(frozen);

    expect(progress.completionPercent).toBe(0);
    expect(summary.reason).toBe("between_sets");
    expect(summary.targetDurationMs).toBe(80_000);
    expect(Object.isFrozen(frozen)).toBe(true);
  });

  it("allows WorkoutRuntime to own a RestRuntime without circular imports", () => {
    const workoutSession = createMinimalWorkoutSession();
    const workout = new WorkoutRuntimeBuilder().build({
      session: workoutSession,
      state: "Running",
    });

    const restSession = createMinimalRestSession({
      workoutRuntimeId: workout.id,
      targetDurationMs: 90_000,
    });
    const restRuntime = new RestRuntimeBuilder().build({
      session: restSession,
      state: "Running",
      configuration: { fixedTimestamp: FIXED_TIMESTAMP },
    });

    const owned = new WorkoutRuntimeBuilder().withRestRuntime(
      workout,
      restRuntime,
    );

    expect(owned.restRuntime?.id).toBe(restRuntime.id);
    expect(owned.restRuntime?.session.workoutRuntimeId).toBe(workout.id);
    expect(owned.restRuntime?.configuration.targetDurationMs).toBe(90_000);
  });

  it("never uses platform timers", () => {
    const rest = startRest(createMinimalRestSession(), {
      fixedTimestamp: FIXED_TIMESTAMP,
    });
    const summary = updateElapsedTime(rest, 1_000);
    expect(summary.elapsedMs).toBe(1_000);
    expect(typeof setTimeout).toBe("function");
  });
});

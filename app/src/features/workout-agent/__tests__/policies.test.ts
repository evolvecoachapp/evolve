import {
  DefaultExercisePolicy,
  DefaultProgressionPolicy,
  DefaultRecoveryPolicy,
  DefaultSafetyPolicy,
  DefaultVolumePolicy,
} from "../policies";
import { WorkoutPlanBuilder } from "../builders/WorkoutPlanBuilder";
import { WorkoutContextBuilder } from "../builders/WorkoutContextBuilder";
import {
  createFixedClock,
  createWorkoutRequestFixture,
} from "../testSupport/fixtures";
import { WorkoutObjectives } from "../models/WorkoutObjective";

describe("workout-agent policies", () => {
  const clock = createFixedClock();
  const context = new WorkoutContextBuilder().build({
    request: createWorkoutRequestFixture(),
    clock,
  });
  const proposal = new WorkoutPlanBuilder().buildProposal({ context, clock });

  it("SafetyPolicy accepts normal plan", () => {
    expect(new DefaultSafetyPolicy().evaluate(context, proposal)).toEqual([]);
  });

  it("VolumePolicy and ProgressionPolicy pass valid proposal", () => {
    expect(new DefaultVolumePolicy().evaluate(proposal)).toEqual([]);
    expect(new DefaultProgressionPolicy().evaluate(proposal)).toEqual([]);
  });

  it("ExercisePolicy flags missing primaries", () => {
    const bad = Object.freeze({
      ...proposal,
      primaryLifts: Object.freeze([] as string[]),
    });
    expect(new DefaultExercisePolicy().evaluate(bad)).toContain(
      "missing_primary_lifts",
    );
  });

  it("RecoveryPolicy flags recovery without deload", () => {
    const recoveryContext = new WorkoutContextBuilder().build({
      request: createWorkoutRequestFixture({
        objectiveHint: WorkoutObjectives.RECOVERY,
        constraints: Object.freeze(["needs_recovery"]),
      }),
      clock,
    });
    const noDeload = Object.freeze({
      ...proposal,
      deloadRecommended: false,
      objective: WorkoutObjectives.RECOVERY,
    });
    expect(
      new DefaultRecoveryPolicy().evaluate(recoveryContext, noDeload),
    ).toContain("recovery_without_deload");
  });
});

import {
  AccessoryPlanner,
  DeloadPlanner,
  SplitPlanner,
  WorkoutPlannerImpl,
} from "../planning";
import { createDefaultReasoners } from "../reasoning";
import { WorkoutContextBuilder } from "../builders/WorkoutContextBuilder";
import {
  createFixedClock,
  createWorkoutRequestFixture,
} from "../testSupport/fixtures";
import { WorkoutObjectives } from "../models/WorkoutObjective";
import { WorkoutExperienceLevels } from "../models/WorkoutRequest";

describe("workout-agent planners", () => {
  const clock = createFixedClock();
  const context = new WorkoutContextBuilder().build({
    request: createWorkoutRequestFixture(),
    clock,
  });
  const reasoning = createDefaultReasoners().map((r) => r.reason(context));

  it("WorkoutPlanner produces frozen proposal", () => {
    const result = new WorkoutPlannerImpl().plan(context, reasoning, clock);
    expect(result.success).toBe(true);
    expect(result.proposal.objective).toBe(WorkoutObjectives.HYPERTROPHY);
    expect(result.proposal.primaryLifts.length).toBeGreaterThan(0);
    expect(Object.isFrozen(result.proposal)).toBe(true);
  });

  it("SplitPlanner sets split", () => {
    const result = new SplitPlanner().plan(context, reasoning, clock);
    expect(result.proposal.split).toBe("upper_lower");
  });

  it("AccessoryPlanner adds accessories", () => {
    const base = new WorkoutPlannerImpl().plan(context, reasoning, clock);
    const result = new AccessoryPlanner().plan(context, reasoning, clock);
    expect(result.proposal.accessories.length).toBeGreaterThan(
      base.proposal.accessories.length,
    );
  });

  it("DeloadPlanner reduces intensity", () => {
    const recoveryContext = new WorkoutContextBuilder().build({
      request: createWorkoutRequestFixture({
        objectiveHint: WorkoutObjectives.RECOVERY,
        experienceLevel: WorkoutExperienceLevels.ADVANCED,
        constraints: Object.freeze(["needs_recovery"]),
      }),
      clock,
    });
    const recoveryReasoning = createDefaultReasoners().map((r) =>
      r.reason(recoveryContext),
    );
    const result = new DeloadPlanner().plan(
      recoveryContext,
      recoveryReasoning,
      clock,
    );
    expect(result.proposal.deloadRecommended).toBe(true);
    expect(result.proposal.intensityScore).toBeLessThanOrEqual(0.45);
  });
});

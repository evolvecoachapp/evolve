import { ActionPlanBuilder } from "../builders/ActionPlanBuilder";
import { ActionStepBuilder } from "../builders/ActionStepBuilder";
import { ActionIntents } from "../models/ActionIntent";
import { ActionPriorities } from "../models/ActionPriority";
import { ActionTypes } from "../models/ActionType";
import {
  DefaultConflictPolicy,
  DefaultDependencyPolicy,
  DefaultExecutionPolicy,
  DefaultPriorityPolicy,
  DefaultSafetyPolicy,
} from "../policies";
import { ActionConstraintKinds } from "../models/ActionConstraint";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("action-engine policies", () => {
  const steps = Object.freeze([
    new ActionStepBuilder()
      .withId("s1")
      .withPlanId("plan:1")
      .withType(ActionTypes.WORKOUT)
      .withIntent(ActionIntents.START_WORKOUT)
      .withLabel("Same")
      .withPriority(ActionPriorities.HIGH)
      .withOrder(0)
      .build(),
    new ActionStepBuilder()
      .withId("s2")
      .withPlanId("plan:1")
      .withType(ActionTypes.WORKOUT)
      .withIntent(ActionIntents.START_WORKOUT)
      .withLabel("Same")
      .withPriority(ActionPriorities.LOW)
      .withOrder(1)
      .build(),
  ]);

  it("ConflictPolicy finds duplicate labels", () => {
    const conflicts = new DefaultConflictPolicy().findConflicts(steps);
    expect(conflicts).toHaveLength(1);
  });

  it("PriorityPolicy orders by priority", () => {
    const ordered = new DefaultPriorityPolicy().orderByPriority(steps);
    expect(ordered[0].id).toBe("s1");
  });

  it("DependencyPolicy reports satisfaction", () => {
    expect(new DefaultDependencyPolicy().isSatisfied(steps)).toBe(true);
  });

  it("ExecutionPolicy prepares ordered ids", () => {
    const plan = new ActionPlanBuilder()
      .withId("plan:1")
      .withSourceResponseId("coach:1")
      .withIntent(ActionIntents.COMPOSITE)
      .withSteps(steps)
      .withCreatedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    const policy = new DefaultExecutionPolicy();
    expect(policy.canPrepare(plan)).toBe(true);
    expect(policy.orderedStepIds(plan)).toEqual(["s1", "s2"]);
  });

  it("SafetyPolicy flags max_steps violations", () => {
    const plan = new ActionPlanBuilder()
      .withId("plan:1")
      .withSourceResponseId("coach:1")
      .withIntent(ActionIntents.COMPOSITE)
      .withSteps(steps)
      .withConstraints(
        Object.freeze([
          Object.freeze({
            id: "c1",
            kind: ActionConstraintKinds.MAX_STEPS,
            description: "max",
            value: 1,
          }),
        ]),
      )
      .withCreatedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(new DefaultSafetyPolicy().isSafe(plan)).toBe(false);
  });
});

import { ActionPlanBuilder } from "../builders/ActionPlanBuilder";
import { ActionStepBuilder } from "../builders/ActionStepBuilder";
import { ActionProposalBuilder } from "../builders/ActionProposalBuilder";
import { ActionIntents } from "../models/ActionIntent";
import { ActionPriorities } from "../models/ActionPriority";
import { ActionStatuses } from "../models/ActionStatus";
import { ActionTypes } from "../models/ActionType";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("action-engine builders", () => {
  it("ActionStepBuilder builds frozen steps", () => {
    const step = new ActionStepBuilder()
      .withId("step:1")
      .withPlanId("plan:1")
      .withType(ActionTypes.WORKOUT)
      .withIntent(ActionIntents.START_WORKOUT)
      .withLabel("Squat")
      .withPriority(ActionPriorities.HIGH)
      .withStatus(ActionStatuses.PLANNED)
      .withOrder(0)
      .build();

    expect(Object.isFrozen(step)).toBe(true);
    expect(step.label).toBe("Squat");
  });

  it("ActionPlanBuilder builds frozen plans", () => {
    const step = new ActionStepBuilder()
      .withId("step:1")
      .withPlanId("plan:1")
      .withType(ActionTypes.SYSTEM)
      .withIntent(ActionIntents.SYSTEM_MAINTAIN)
      .withLabel("Maintain")
      .withOrder(0)
      .build();

    const plan = new ActionPlanBuilder()
      .withId("plan:1")
      .withSourceResponseId("coach:1")
      .withIntent(ActionIntents.COMPOSITE)
      .withSteps(Object.freeze([step]))
      .withCreatedAt(FIXED_TIMESTAMP)
      .withFrozenAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(plan)).toBe(true);
    expect(plan.steps).toHaveLength(1);
    expect(plan.priority).toBe(ActionPriorities.MEDIUM);
  });

  it("ActionProposalBuilder builds frozen proposals", () => {
    const proposal = new ActionProposalBuilder()
      .withId("proposal:1")
      .withSourceResponseId("coach:1")
      .withIntent(ActionIntents.START_WORKOUT)
      .withCandidates(Object.freeze([]))
      .withCreatedAt(FIXED_TIMESTAMP)
      .build();

    expect(Object.isFrozen(proposal)).toBe(true);
  });

  it("builders throw when required fields missing", () => {
    expect(() => new ActionStepBuilder().build()).toThrow();
    expect(() => new ActionPlanBuilder().build()).toThrow();
    expect(() => new ActionProposalBuilder().build()).toThrow();
  });
});

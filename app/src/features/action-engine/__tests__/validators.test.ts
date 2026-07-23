import { ActionPlanBuilder } from "../builders/ActionPlanBuilder";
import { ActionStepBuilder } from "../builders/ActionStepBuilder";
import { ActionIntents } from "../models/ActionIntent";
import { ActionPriorities } from "../models/ActionPriority";
import { ActionTypes } from "../models/ActionType";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";
import {
  validateActionPlan,
  validateArguments,
  validateDependencies,
  validateActionIntegrity,
} from "../validators";

function buildPlanWithSteps(
  steps: ReturnType<ActionStepBuilder["build"]>[],
) {
  return new ActionPlanBuilder()
    .withId("plan:1")
    .withSourceResponseId("coach:1")
    .withIntent(ActionIntents.COMPOSITE)
    .withSteps(Object.freeze(steps))
    .withCreatedAt(FIXED_TIMESTAMP)
    .withFrozenAt(FIXED_TIMESTAMP)
    .build();
}

describe("action-engine validators", () => {
  it("validateActionPlan accepts a well-formed plan", () => {
    const step = new ActionStepBuilder()
      .withId("step:1")
      .withPlanId("plan:1")
      .withType(ActionTypes.WORKOUT)
      .withIntent(ActionIntents.START_WORKOUT)
      .withLabel("Lift")
      .withPriority(ActionPriorities.HIGH)
      .withOrder(0)
      .build();

    const validation = validateActionPlan(buildPlanWithSteps([step]));
    expect(validation.valid).toBe(true);
    expect(validation.issues).toHaveLength(0);
  });

  it("detects missing dependency targets", () => {
    const step = new ActionStepBuilder()
      .withId("step:1")
      .withPlanId("plan:1")
      .withType(ActionTypes.WORKOUT)
      .withIntent(ActionIntents.START_WORKOUT)
      .withLabel("Lift")
      .withDependsOn(Object.freeze(["missing"]))
      .withOrder(0)
      .build();

    const issues = validateDependencies(buildPlanWithSteps([step]));
    expect(issues.some((i) => i.code === "invalid_dependency")).toBe(true);
  });

  it("detects invalid required arguments", () => {
    const step = new ActionStepBuilder()
      .withId("step:1")
      .withPlanId("plan:1")
      .withType(ActionTypes.GOAL)
      .withIntent(ActionIntents.SET_GOAL)
      .withLabel("Goal")
      .withArguments(
        Object.freeze([
          Object.freeze({ name: "category", value: null, required: true }),
        ]),
      )
      .withOrder(0)
      .build();

    const issues = validateArguments(buildPlanWithSteps([step]));
    expect(issues.some((i) => i.code === "invalid_argument")).toBe(true);
  });

  it("detects integrity issues for empty ids", () => {
    const bad = buildPlanWithSteps([]);
    // force empty id via freeze bypass is hard; check integrity on source
    const issues = validateActionIntegrity({
      ...bad,
      id: "",
      sourceResponseId: "",
    });
    expect(issues.length).toBeGreaterThanOrEqual(2);
  });
});

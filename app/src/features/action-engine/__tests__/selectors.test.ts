import { ActionStepBuilder } from "../builders/ActionStepBuilder";
import { ActionIntents } from "../models/ActionIntent";
import { ActionPriorities } from "../models/ActionPriority";
import { ActionTypes } from "../models/ActionType";
import {
  ActionSelector,
  DependencySelector,
  PlannerSelector,
  PrioritySelector,
} from "../selectors";
import {
  createRichCoachResponseFixture,
  createEmptyCoachResponseFixture,
} from "../testSupport/fixtures";

describe("action-engine selectors", () => {
  const steps = Object.freeze([
    new ActionStepBuilder()
      .withId("a")
      .withPlanId("p")
      .withType(ActionTypes.WORKOUT)
      .withIntent(ActionIntents.START_WORKOUT)
      .withLabel("A")
      .withPriority(ActionPriorities.HIGH)
      .withOrder(0)
      .build(),
    new ActionStepBuilder()
      .withId("b")
      .withPlanId("p")
      .withType(ActionTypes.NUTRITION)
      .withIntent(ActionIntents.ADJUST_NUTRITION)
      .withLabel("B")
      .withPriority(ActionPriorities.LOW)
      .withDependsOn(Object.freeze(["a"]))
      .withOrder(1)
      .build(),
  ]);

  it("ActionSelector filters by type and priority", () => {
    const selector = new ActionSelector();
    expect(selector.selectByType(steps, ActionTypes.WORKOUT)).toHaveLength(1);
    expect(
      selector.selectByMinPriority(steps, ActionPriorities.MEDIUM),
    ).toHaveLength(1);
  });

  it("PrioritySelector picks highest priority step", () => {
    const top = new PrioritySelector().selectHighest(steps);
    expect(top?.id).toBe("a");
  });

  it("DependencySelector returns topological order", () => {
    const ids = new DependencySelector().selectOrderedIds(steps);
    expect(ids).toEqual(["a", "b"]);
  });

  it("PlannerSelector chooses planners from CoachResponse", () => {
    const rich = new PlannerSelector().select(createRichCoachResponseFixture());
    expect(rich.length).toBeGreaterThanOrEqual(4);

    const empty = new PlannerSelector().select(createEmptyCoachResponseFixture());
    expect(empty).toHaveLength(1);
  });
});

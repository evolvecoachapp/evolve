import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import { ActionStepBuilder } from "../builders/ActionStepBuilder";
import { ActionIntents } from "../models/ActionIntent";
import { EMPTY_ACTION_METADATA } from "../models/ActionMetadata";
import { ActionPriorities } from "../models/ActionPriority";
import { ActionStatuses } from "../models/ActionStatus";
import type { ActionStep } from "../models/ActionStep";
import { ActionTargetKinds } from "../models/ActionTarget";
import { ActionTypes } from "../models/ActionType";
import type { ActionPlanner } from "./ActionPlanner";

/**
 * Deterministic nutrition planner — maps nutrition advice to ActionSteps.
 */
export class NutritionPlanner implements ActionPlanner {
  readonly id = "planner:nutrition";

  plan(response: CoachResponse, planId: string): readonly ActionStep[] {
    const steps: ActionStep[] = [];
    let order = 0;

    for (const item of response.nutrition) {
      steps.push(
        new ActionStepBuilder()
          .withId(`${planId}:nutrition:${item.id}`)
          .withPlanId(planId)
          .withType(ActionTypes.NUTRITION)
          .withIntent(ActionIntents.ADJUST_NUTRITION)
          .withLabel(item.text)
          .withDescription(item.timing)
          .withTarget({
            id: `target:nutrition:${item.id}`,
            kind: ActionTargetKinds.NUTRITION,
            label: item.text,
            resourceId: item.id,
          })
          .withArguments(
            Object.freeze([
              Object.freeze({
                name: "timing",
                value: item.timing,
                required: false,
              }),
            ]),
          )
          .withPriority(ActionPriorities.MEDIUM)
          .withStatus(ActionStatuses.PLANNED)
          .withOrder(order++)
          .withSourceIds(Object.freeze([item.id]))
          .withMetadata({
            ...EMPTY_ACTION_METADATA,
            sourceResponseId: response.id,
            plannerId: this.id,
            tags: Object.freeze(["nutrition"]),
          })
          .build(),
      );
    }

    return Object.freeze(steps);
  }
}

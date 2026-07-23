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
 * Deterministic goal planner — maps general/training recommendations to goal steps.
 */
export class GoalPlanner implements ActionPlanner {
  readonly id = "planner:goal";

  plan(response: CoachResponse, planId: string): readonly ActionStep[] {
    const steps: ActionStep[] = [];
    let order = 0;

    for (const rec of response.recommendations) {
      if (
        rec.category !== "general" &&
        rec.category !== "training" &&
        rec.category !== "technique" &&
        rec.category !== "unknown"
      ) {
        continue;
      }

      const priority =
        rec.severity === "critical" || rec.severity === "high"
          ? ActionPriorities.HIGH
          : ActionPriorities.MEDIUM;

      steps.push(
        new ActionStepBuilder()
          .withId(`${planId}:goal:${rec.id}`)
          .withPlanId(planId)
          .withType(ActionTypes.GOAL)
          .withIntent(ActionIntents.SET_GOAL)
          .withLabel(rec.text)
          .withDescription(null)
          .withTarget({
            id: `target:goal:${rec.id}`,
            kind: ActionTargetKinds.GOAL,
            label: rec.text,
            resourceId: rec.id,
          })
          .withArguments(
            Object.freeze([
              Object.freeze({
                name: "category",
                value: rec.category,
                required: true,
              }),
              Object.freeze({
                name: "recommendationPriority",
                value: rec.priority,
                required: false,
              }),
            ]),
          )
          .withPriority(priority)
          .withStatus(ActionStatuses.PLANNED)
          .withOrder(order++)
          .withSourceIds(Object.freeze([rec.id]))
          .withMetadata({
            ...EMPTY_ACTION_METADATA,
            sourceResponseId: response.id,
            plannerId: this.id,
            tags: Object.freeze(["goal", rec.category]),
          })
          .build(),
      );
    }

    return Object.freeze(steps);
  }
}

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
 * Deterministic recovery planner — maps recovery advice to ActionSteps.
 */
export class RecoveryPlanner implements ActionPlanner {
  readonly id = "planner:recovery";

  plan(response: CoachResponse, planId: string): readonly ActionStep[] {
    const steps: ActionStep[] = [];
    let order = 0;

    for (const item of response.recovery) {
      steps.push(
        new ActionStepBuilder()
          .withId(`${planId}:recovery:${item.id}`)
          .withPlanId(planId)
          .withType(ActionTypes.RECOVERY)
          .withIntent(ActionIntents.RECOVER)
          .withLabel(item.text)
          .withDescription(item.focus)
          .withTarget({
            id: `target:recovery:${item.id}`,
            kind: ActionTargetKinds.RECOVERY,
            label: item.text,
            resourceId: item.id,
          })
          .withArguments(
            Object.freeze([
              Object.freeze({
                name: "focus",
                value: item.focus,
                required: false,
              }),
            ]),
          )
          .withPriority(ActionPriorities.HIGH)
          .withStatus(ActionStatuses.PLANNED)
          .withOrder(order++)
          .withSourceIds(Object.freeze([item.id]))
          .withMetadata({
            ...EMPTY_ACTION_METADATA,
            sourceResponseId: response.id,
            plannerId: this.id,
            tags: Object.freeze(["recovery"]),
          })
          .build(),
      );
    }

    return Object.freeze(steps);
  }
}

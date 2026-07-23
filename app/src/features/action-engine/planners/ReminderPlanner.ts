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
 * Deterministic reminder planner — maps questions to reminder steps.
 */
export class ReminderPlanner implements ActionPlanner {
  readonly id = "planner:reminder";

  plan(response: CoachResponse, planId: string): readonly ActionStep[] {
    const steps: ActionStep[] = [];
    let order = 0;

    for (const question of response.questions) {
      steps.push(
        new ActionStepBuilder()
          .withId(`${planId}:reminder:${question.id}`)
          .withPlanId(planId)
          .withType(ActionTypes.REMINDER)
          .withIntent(ActionIntents.SCHEDULE_REMINDER)
          .withLabel(question.text)
          .withDescription(null)
          .withTarget({
            id: `target:reminder:${question.id}`,
            kind: ActionTargetKinds.REMINDER,
            label: question.text,
            resourceId: question.id,
          })
          .withArguments(
            Object.freeze([
              Object.freeze({
                name: "optional",
                value: question.optional,
                required: true,
              }),
            ]),
          )
          .withPriority(
            question.optional ? ActionPriorities.LOW : ActionPriorities.MEDIUM,
          )
          .withStatus(ActionStatuses.PLANNED)
          .withOrder(order++)
          .withSourceIds(Object.freeze([question.id]))
          .withMetadata({
            ...EMPTY_ACTION_METADATA,
            sourceResponseId: response.id,
            plannerId: this.id,
            tags: Object.freeze(["reminder", "question"]),
          })
          .build(),
      );
    }

    return Object.freeze(steps);
  }
}

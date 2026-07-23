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
 * Deterministic workout planner — maps exercises / start_workout actions to steps.
 */
export class WorkoutPlanner implements ActionPlanner {
  readonly id = "planner:workout";

  plan(response: CoachResponse, planId: string): readonly ActionStep[] {
    const steps: ActionStep[] = [];
    let order = 0;

    for (const exercise of response.exercises) {
      steps.push(
        new ActionStepBuilder()
          .withId(`${planId}:workout:ex:${exercise.id}`)
          .withPlanId(planId)
          .withType(ActionTypes.WORKOUT)
          .withIntent(ActionIntents.START_WORKOUT)
          .withLabel(exercise.name)
          .withDescription(exercise.notes)
          .withTarget({
            id: `target:exercise:${exercise.id}`,
            kind: ActionTargetKinds.EXERCISE,
            label: exercise.name,
            resourceId: exercise.id,
          })
          .withArguments(
            Object.freeze([
              Object.freeze({
                name: "sets",
                value: exercise.sets,
                required: false,
              }),
              Object.freeze({
                name: "reps",
                value: exercise.reps,
                required: false,
              }),
            ]),
          )
          .withPriority(ActionPriorities.HIGH)
          .withStatus(ActionStatuses.PLANNED)
          .withOrder(order++)
          .withSourceIds(Object.freeze([exercise.id]))
          .withMetadata({
            ...EMPTY_ACTION_METADATA,
            sourceResponseId: response.id,
            plannerId: this.id,
            tags: Object.freeze(["workout", "exercise"]),
          })
          .build(),
      );
    }

    for (const action of response.actions) {
      if (action.kind !== "start_workout") continue;
      steps.push(
        new ActionStepBuilder()
          .withId(`${planId}:workout:action:${action.id}`)
          .withPlanId(planId)
          .withType(ActionTypes.WORKOUT)
          .withIntent(ActionIntents.START_WORKOUT)
          .withLabel(action.label)
          .withDescription(action.description)
          .withTarget({
            id: `target:workout:${action.id}`,
            kind: ActionTargetKinds.WORKOUT,
            label: action.label,
            resourceId: action.id,
          })
          .withArguments(
            Object.freeze(
              Object.entries(action.payload).map(([name, value]) =>
                Object.freeze({ name, value, required: false }),
              ),
            ),
          )
          .withPriority(ActionPriorities.HIGH)
          .withStatus(ActionStatuses.PLANNED)
          .withOrder(order++)
          .withSourceIds(Object.freeze([action.id]))
          .withMetadata({
            ...EMPTY_ACTION_METADATA,
            sourceResponseId: response.id,
            plannerId: this.id,
            tags: Object.freeze(["workout", "coach-action"]),
          })
          .build(),
      );
    }

    return Object.freeze(steps);
  }
}

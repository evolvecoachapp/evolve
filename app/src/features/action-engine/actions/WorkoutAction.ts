import {
  createActionDefinition,
  type ActionDefinition,
} from "./ActionDefinition";
import { ActionPriorities } from "../models/ActionPriority";
import { ActionTypes } from "../models/ActionType";

/**
 * Immutable workout action definition (metadata only).
 */
export type WorkoutAction = ActionDefinition & {
  readonly type: "workout";
};

export function createWorkoutAction(
  id: string,
  label: string,
  description: string | null = null,
): WorkoutAction {
  return createActionDefinition({
    id,
    type: ActionTypes.WORKOUT,
    label,
    description,
    defaultPriority: ActionPriorities.HIGH,
  }) as WorkoutAction;
}

export const DEFAULT_WORKOUT_ACTION: WorkoutAction = createWorkoutAction(
  "action:workout:default",
  "Start workout",
  "Plan a workout session from coach exercises",
);

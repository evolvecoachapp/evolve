import {
  createActionDefinition,
  type ActionDefinition,
} from "./ActionDefinition";
import { ActionPriorities } from "../models/ActionPriority";
import { ActionTypes } from "../models/ActionType";

/**
 * Immutable goal action definition (metadata only).
 */
export type GoalAction = ActionDefinition & {
  readonly type: "goal";
};

export function createGoalAction(
  id: string,
  label: string,
  description: string | null = null,
): GoalAction {
  return createActionDefinition({
    id,
    type: ActionTypes.GOAL,
    label,
    description,
    defaultPriority: ActionPriorities.MEDIUM,
  }) as GoalAction;
}

export const DEFAULT_GOAL_ACTION: GoalAction = createGoalAction(
  "action:goal:default",
  "Capture goal",
  "Plan goal steps from coach recommendations",
);

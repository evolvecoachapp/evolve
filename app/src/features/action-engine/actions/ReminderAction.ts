import {
  createActionDefinition,
  type ActionDefinition,
} from "./ActionDefinition";
import { ActionPriorities } from "../models/ActionPriority";
import { ActionTypes } from "../models/ActionType";

/**
 * Immutable reminder action definition (metadata only).
 */
export type ReminderAction = ActionDefinition & {
  readonly type: "reminder";
};

export function createReminderAction(
  id: string,
  label: string,
  description: string | null = null,
): ReminderAction {
  return createActionDefinition({
    id,
    type: ActionTypes.REMINDER,
    label,
    description,
    defaultPriority: ActionPriorities.LOW,
  }) as ReminderAction;
}

export const DEFAULT_REMINDER_ACTION: ReminderAction = createReminderAction(
  "action:reminder:default",
  "Schedule reminder",
  "Plan reminder steps from coach questions",
);

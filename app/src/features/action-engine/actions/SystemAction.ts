import {
  createActionDefinition,
  type ActionDefinition,
} from "./ActionDefinition";
import { ActionPriorities } from "../models/ActionPriority";
import { ActionTypes } from "../models/ActionType";

/**
 * Immutable system action definition (metadata only).
 */
export type SystemAction = ActionDefinition & {
  readonly type: "system";
};

export function createSystemAction(
  id: string,
  label: string,
  description: string | null = null,
): SystemAction {
  return createActionDefinition({
    id,
    type: ActionTypes.SYSTEM,
    label,
    description,
    defaultPriority: ActionPriorities.DEFERRED,
  }) as SystemAction;
}

export const DEFAULT_SYSTEM_ACTION: SystemAction = createSystemAction(
  "action:system:default",
  "System maintain",
  "Plan system maintenance steps",
);

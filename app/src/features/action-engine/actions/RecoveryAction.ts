import {
  createActionDefinition,
  type ActionDefinition,
} from "./ActionDefinition";
import { ActionPriorities } from "../models/ActionPriority";
import { ActionTypes } from "../models/ActionType";

/**
 * Immutable recovery action definition (metadata only).
 */
export type RecoveryAction = ActionDefinition & {
  readonly type: "recovery";
};

export function createRecoveryAction(
  id: string,
  label: string,
  description: string | null = null,
): RecoveryAction {
  return createActionDefinition({
    id,
    type: ActionTypes.RECOVERY,
    label,
    description,
    defaultPriority: ActionPriorities.HIGH,
  }) as RecoveryAction;
}

export const DEFAULT_RECOVERY_ACTION: RecoveryAction = createRecoveryAction(
  "action:recovery:default",
  "Apply recovery advice",
  "Plan recovery steps from coach recovery advice",
);

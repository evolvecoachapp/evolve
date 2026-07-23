import {
  createActionDefinition,
  type ActionDefinition,
} from "./ActionDefinition";
import { ActionPriorities } from "../models/ActionPriority";
import { ActionTypes } from "../models/ActionType";

/**
 * Immutable progress action definition (metadata only).
 */
export type ProgressAction = ActionDefinition & {
  readonly type: "progress";
};

export function createProgressAction(
  id: string,
  label: string,
  description: string | null = null,
): ProgressAction {
  return createActionDefinition({
    id,
    type: ActionTypes.PROGRESS,
    label,
    description,
    defaultPriority: ActionPriorities.MEDIUM,
  }) as ProgressAction;
}

export const DEFAULT_PROGRESS_ACTION: ProgressAction = createProgressAction(
  "action:progress:default",
  "Track progress",
  "Plan progress tracking from coach insights",
);

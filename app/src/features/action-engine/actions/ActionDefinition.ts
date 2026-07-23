import type { ActionArgument } from "../models/ActionArgument";
import type { ActionMetadata } from "../models/ActionMetadata";
import { EMPTY_ACTION_METADATA } from "../models/ActionMetadata";
import type { ActionPriority } from "../models/ActionPriority";
import { ActionPriorities } from "../models/ActionPriority";
import type { ActionType } from "../models/ActionType";
import { ActionTypes } from "../models/ActionType";

/**
 * Base immutable action definition (metadata only, no execution).
 */
export interface ActionDefinition {
  readonly id: string;
  readonly type: ActionType;
  readonly label: string;
  readonly description: string | null;
  readonly defaultPriority: ActionPriority;
  readonly defaultArguments: readonly ActionArgument[];
  readonly metadata: ActionMetadata;
}

export function createActionDefinition(
  partial: Omit<ActionDefinition, "metadata" | "defaultArguments"> & {
    readonly defaultArguments?: readonly ActionArgument[];
    readonly metadata?: ActionMetadata;
  },
): ActionDefinition {
  return Object.freeze({
    id: partial.id,
    type: partial.type,
    label: partial.label,
    description: partial.description,
    defaultPriority: partial.defaultPriority,
    defaultArguments: Object.freeze([...(partial.defaultArguments ?? [])]),
    metadata: partial.metadata ?? EMPTY_ACTION_METADATA,
  });
}

export const DEFAULT_ACTION_PRIORITY = ActionPriorities.MEDIUM;
export { ActionTypes };

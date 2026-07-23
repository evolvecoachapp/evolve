import {
  createActionDefinition,
  type ActionDefinition,
} from "./ActionDefinition";
import { ActionPriorities } from "../models/ActionPriority";
import { ActionTypes } from "../models/ActionType";

/**
 * Immutable coach interaction action definition (metadata only).
 * Named EngineCoachAction to avoid colliding with response-formatter CoachAction.
 */
export type EngineCoachAction = ActionDefinition & {
  readonly type: "coach";
};

export function createCoachAction(
  id: string,
  label: string,
  description: string | null = null,
): EngineCoachAction {
  return createActionDefinition({
    id,
    type: ActionTypes.COACH,
    label,
    description,
    defaultPriority: ActionPriorities.MEDIUM,
  }) as EngineCoachAction;
}

export const DEFAULT_COACH_ACTION: EngineCoachAction = createCoachAction(
  "action:coach:default",
  "Coach follow-up",
  "Plan coach follow-up from suggested coach actions",
);

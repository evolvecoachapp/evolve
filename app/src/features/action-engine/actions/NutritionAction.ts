import {
  createActionDefinition,
  type ActionDefinition,
} from "./ActionDefinition";
import { ActionPriorities } from "../models/ActionPriority";
import { ActionTypes } from "../models/ActionType";

/**
 * Immutable nutrition action definition (metadata only).
 */
export type NutritionAction = ActionDefinition & {
  readonly type: "nutrition";
};

export function createNutritionAction(
  id: string,
  label: string,
  description: string | null = null,
): NutritionAction {
  return createActionDefinition({
    id,
    type: ActionTypes.NUTRITION,
    label,
    description,
    defaultPriority: ActionPriorities.MEDIUM,
  }) as NutritionAction;
}

export const DEFAULT_NUTRITION_ACTION: NutritionAction = createNutritionAction(
  "action:nutrition:default",
  "Apply nutrition advice",
  "Plan nutrition steps from coach nutrition advice",
);

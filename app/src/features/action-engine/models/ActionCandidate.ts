import type { ActionArgument } from "./ActionArgument";
import type { ActionIntent } from "./ActionIntent";
import type { ActionPriority } from "./ActionPriority";
import type { ActionTarget } from "./ActionTarget";
import type { ActionType } from "./ActionType";

/**
 * Immutable candidate action before selection into a plan.
 */
export interface ActionCandidate {
  readonly id: string;
  readonly type: ActionType;
  readonly intent: ActionIntent;
  readonly label: string;
  readonly description: string | null;
  readonly target: ActionTarget | null;
  readonly arguments: readonly ActionArgument[];
  readonly priority: ActionPriority;
  readonly sourceIds: readonly string[];
  readonly score: number;
}

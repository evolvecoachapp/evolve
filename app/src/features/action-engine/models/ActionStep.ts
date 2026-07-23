import type { ActionArgument } from "./ActionArgument";
import type { ActionConstraint } from "./ActionConstraint";
import type { ActionIntent } from "./ActionIntent";
import type { ActionMetadata } from "./ActionMetadata";
import type { ActionPriority } from "./ActionPriority";
import type { ActionStatus } from "./ActionStatus";
import type { ActionTarget } from "./ActionTarget";
import type { ActionType } from "./ActionType";

/**
 * Immutable single step within an ActionPlan.
 * Produced by planners. Never executed by the Action Engine.
 */
export interface ActionStep {
  readonly id: string;
  readonly planId: string;
  readonly type: ActionType;
  readonly intent: ActionIntent;
  readonly label: string;
  readonly description: string | null;
  readonly target: ActionTarget | null;
  readonly arguments: readonly ActionArgument[];
  readonly constraints: readonly ActionConstraint[];
  readonly priority: ActionPriority;
  readonly status: ActionStatus;
  readonly dependsOn: readonly string[];
  readonly order: number;
  readonly sourceIds: readonly string[];
  readonly metadata: ActionMetadata;
}

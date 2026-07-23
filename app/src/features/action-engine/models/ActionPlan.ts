import type { ActionConstraint } from "./ActionConstraint";
import type { ActionDependency } from "./ActionDependency";
import type { ActionIntent } from "./ActionIntent";
import type { ActionMetadata } from "./ActionMetadata";
import type { ActionPriority } from "./ActionPriority";
import type { ActionStatus } from "./ActionStatus";
import type { ActionStep } from "./ActionStep";

/**
 * Immutable execution plan prepared from a CoachResponse.
 * Bridges AI reasoning and future tool runtime — no domain execution.
 */
export interface ActionPlan {
  readonly id: string;
  readonly sourceResponseId: string;
  readonly intent: ActionIntent;
  readonly steps: readonly ActionStep[];
  readonly dependencies: readonly ActionDependency[];
  readonly constraints: readonly ActionConstraint[];
  readonly priority: ActionPriority;
  readonly status: ActionStatus;
  readonly metadata: ActionMetadata;
  readonly createdAt: string;
  readonly frozenAt: string;
}

import type { ActionPlan } from "./ActionPlan";
import type { ActionStatistics } from "./ActionStatistics";
import type { ActionSummary } from "./ActionSummary";

/**
 * Immutable snapshot of a plan with summary + statistics.
 */
export interface ActionSnapshot {
  readonly plan: ActionPlan;
  readonly summary: ActionSummary;
  readonly statistics: ActionStatistics;
  readonly capturedAt: string;
}

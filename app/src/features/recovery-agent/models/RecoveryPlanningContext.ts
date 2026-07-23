import type { RecoveryGoal } from "./RecoveryGoal";
import type { RecoveryProtocolHint } from "./RecoveryPlan";

export interface RecoveryPlanningContext {
  readonly id: string;
  readonly contextId: string;
  readonly goal: RecoveryGoal;
  readonly protocolHint: RecoveryProtocolHint;
  readonly recoveryScoreTarget: number | null;
  readonly readinessTarget: number | null;
  readonly constraints: readonly string[];
  readonly createdAt: string;
}

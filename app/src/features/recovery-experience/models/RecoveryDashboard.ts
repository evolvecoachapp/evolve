import type { ReadinessProgress } from "./ReadinessProgress";
import type { RecoveryDay } from "./RecoveryDay";
import type { RecoverySignal } from "./RecoverySignal";
import type { SleepState } from "./SleepState";

export interface RecoveryDashboard {
  readonly day: RecoveryDay;
  readonly availableDays: readonly RecoveryDay[];
  readonly headline: string;
  readonly summary: string;
  readonly todaysGoal: string;
  readonly recoveryScore: number;
  readonly status: string;
  readonly sleep: SleepState;
  readonly readiness: ReadinessProgress;
  readonly signals: readonly RecoverySignal[];
  readonly assessmentAvailable: boolean;
  readonly historyDestination: string | null;
}

export function createRecoveryDashboard(input: RecoveryDashboard): RecoveryDashboard {
  return Object.freeze({
    ...input,
    availableDays: Object.freeze([...input.availableDays]),
    signals: Object.freeze([...input.signals]),
  });
}

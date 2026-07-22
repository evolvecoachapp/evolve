import type { RecoveryMetrics } from "../models/RecoveryMetrics";
import type { RecoverySummary } from "../models/RecoverySummary";
import { buildSummaryText } from "./formatting";
import { freezeSummary } from "./freezeSnapshots";

/**
 * Build a compact RecoverySummary from metrics + ids.
 */
export function buildRecoverySummary(input: {
  readonly snapshotId: string;
  readonly athleteId: string | null;
  readonly metrics: RecoveryMetrics;
}): RecoverySummary {
  const fatigueScore = input.metrics.fatigue.score;
  const sessionLoad = input.metrics.trainingLoad.sessionLoad;
  const workoutsInWindow = input.metrics.frequencyLoad.workoutsInWindow;
  const windowDurationHours = input.metrics.recoveryWindow.durationHours;
  const status = input.metrics.status.level;

  return freezeSummary({
    snapshotId: input.snapshotId,
    athleteId: input.athleteId,
    status,
    fatigueScore,
    sessionLoad,
    workoutsInWindow,
    windowDurationHours,
    summaryText: buildSummaryText({
      status,
      fatigueScore,
      sessionLoad,
      workoutsInWindow,
      windowDurationHours,
    }),
  });
}

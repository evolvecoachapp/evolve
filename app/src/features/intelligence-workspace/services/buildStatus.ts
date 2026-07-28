import type { AthleteState } from "../../athlete-state/models/AthleteState";
import type { GoalProgress } from "../../goal-progress/models/GoalProgress";
import type { WorkspaceStatus } from "../models/WorkspaceStatus";

export interface BuildStatusInput {
  readonly athleteId: string;
  readonly athleteState?: AthleteState | null;
  readonly goalProgress?: GoalProgress | null;
  readonly recoveryStatus?: string | null;
  readonly currentPhase?: string | null;
}

/**
 * Builds current athlete status from existing state, recovery, and goal artifacts.
 */
export function buildStatus(input: BuildStatusInput): WorkspaceStatus {
  const athleteStatus =
    input.athleteState?.status.kind ??
    input.athleteState?.summary?.status ??
    null;
  const athleteStatusLabel = input.athleteState?.status.label ?? null;
  const resolvedRecoveryStatus =
    input.recoveryStatus ?? input.athleteState?.recovery.status ?? null;
  const goalCategory = input.goalProgress?.category ?? null;
  const currentPhase =
    input.currentPhase ?? input.athleteState?.training.phase ?? null;

  const details = Object.freeze(
    [
      athleteStatusLabel,
      resolvedRecoveryStatus ? `Recovery: ${resolvedRecoveryStatus}` : null,
      goalCategory ? `Goal: ${goalCategory}` : null,
      currentPhase ? `Phase: ${currentPhase}` : null,
    ].filter((value): value is string => Boolean(value)),
  );

  return Object.freeze({
    athleteId: input.athleteId,
    athleteStatus,
    athleteStatusLabel,
    recoveryStatus: resolvedRecoveryStatus,
    goalCategory,
    currentPhase,
    headline:
      input.athleteState?.summary?.headline ??
      athleteStatusLabel ??
      "Athlete status unavailable",
    details,
  });
}

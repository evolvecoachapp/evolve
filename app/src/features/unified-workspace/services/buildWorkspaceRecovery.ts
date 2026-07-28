import type { AthleteState } from "../../athlete-state/models/AthleteState";
import type { HomeExperience } from "../../home-experience/models/HomeExperience";
import type { WorkspaceRecovery } from "../models/WorkspaceRecovery";

export interface BuildWorkspaceRecoveryInput {
  readonly athleteId: string;
  readonly athleteState?: AthleteState | null;
  readonly homeExperience?: HomeExperience | null;
  readonly recoveryStatus?: string | null;
}

/**
 * Builds recovery projection from Home recovery card and Athlete State.
 */
export function buildWorkspaceRecovery(
  input: BuildWorkspaceRecoveryInput,
): WorkspaceRecovery {
  const card = input.homeExperience?.recovery ?? null;
  const status =
    input.recoveryStatus ??
    card?.status ??
    input.athleteState?.recovery.status ??
    null;
  const present = card?.present === true || status != null;

  return Object.freeze({
    athleteId: input.athleteId,
    present,
    card,
    status,
    fatigueScore: card?.fatigueScore ?? null,
    sleepLabel: card?.sleepLabel ?? null,
    sleepHours: card?.sleepHours ?? null,
    signalSummaries: card?.signalSummaries ?? Object.freeze([]),
    summary:
      card?.summary ??
      (status
        ? `Recovery status: ${status}`
        : "No recovery signals are currently available."),
  });
}

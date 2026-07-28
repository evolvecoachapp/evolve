import type { AthleteState } from "../../athlete-state/models/AthleteState";
import type { HomeExperience } from "../../home-experience/models/HomeExperience";
import type { WorkspaceHealth } from "../models/WorkspaceHealth";

export interface BuildWorkspaceHealthInput {
  readonly athleteId: string;
  readonly athleteState?: AthleteState | null;
  readonly homeExperience?: HomeExperience | null;
  readonly recoveryStatus?: string | null;
}

/**
 * Builds health projection from Athlete State and Home recovery signals.
 */
export function buildWorkspaceHealth(
  input: BuildWorkspaceHealthInput,
): WorkspaceHealth {
  const athleteStatus =
    input.athleteState?.status.kind ??
    input.athleteState?.summary?.status ??
    null;
  const athleteStatusLabel = input.athleteState?.status.label ?? null;
  const recoveryStatus =
    input.recoveryStatus ??
    input.athleteState?.recovery.status ??
    input.homeExperience?.recovery.status ??
    null;
  const sleepSummary =
    input.homeExperience?.recovery.sleepLabel ??
    (input.homeExperience?.recovery.sleepHours != null
      ? `${input.homeExperience.recovery.sleepHours}h sleep`
      : null);
  const fatigueSummary =
    input.homeExperience?.recovery.fatigueScore != null
      ? `Fatigue score ${input.homeExperience.recovery.fatigueScore}`
      : null;
  const readinessSummary =
    input.athleteState?.summary?.headline ?? athleteStatusLabel ?? null;

  const details = Object.freeze(
    [
      athleteStatusLabel,
      recoveryStatus ? `Recovery: ${recoveryStatus}` : null,
      sleepSummary,
      fatigueSummary,
    ].filter((value): value is string => Boolean(value)),
  );

  const present =
    input.athleteState != null || input.homeExperience?.recovery.present === true;

  return Object.freeze({
    athleteId: input.athleteId,
    present,
    athleteStatus,
    athleteStatusLabel,
    recoveryStatus,
    readinessSummary,
    fatigueSummary,
    sleepSummary,
    details,
    summary:
      details[0] ??
      "Athlete health signals are not currently available.",
  });
}

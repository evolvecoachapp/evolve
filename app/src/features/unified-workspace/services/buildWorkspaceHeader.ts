import type { AthleteState } from "../../athlete-state/models/AthleteState";
import type { GoalProgress } from "../../goal-progress/models/GoalProgress";
import type { HomeExperience } from "../../home-experience/models/HomeExperience";
import type { WorkspaceHeader } from "../models/WorkspaceHeader";

export interface BuildWorkspaceHeaderInput {
  readonly athleteId: string;
  readonly generatedAt: string;
  readonly athleteState?: AthleteState | null;
  readonly goalProgress?: GoalProgress | null;
  readonly homeExperience?: HomeExperience | null;
  readonly recoveryStatus?: string | null;
  readonly currentPhase?: string | null;
}

/**
 * Builds the workspace header from Athlete State, Goal Progress, and Home Experience.
 */
export function buildWorkspaceHeader(
  input: BuildWorkspaceHeaderInput,
): WorkspaceHeader {
  const statusLabel = input.athleteState?.status.label ?? null;
  const currentPhase =
    input.currentPhase ??
    input.athleteState?.training.phase ??
    input.homeExperience?.workout.currentPhase ??
    null;
  const goalCategory =
    input.goalProgress?.category ??
    input.homeExperience?.goal.category ??
    null;
  const recoveryStatus =
    input.recoveryStatus ??
    input.athleteState?.recovery.status ??
    input.homeExperience?.recovery.status ??
    null;
  const headline =
    input.homeExperience?.summary.headline ??
    input.athleteState?.summary?.headline ??
    statusLabel ??
    "Unified athlete workspace";

  return Object.freeze({
    athleteId: input.athleteId,
    headline,
    statusLabel,
    currentPhase,
    goalCategory,
    recoveryStatus,
    generatedAt: input.generatedAt,
  });
}

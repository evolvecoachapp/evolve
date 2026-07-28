import type { HomeExperience } from "../../home-experience/models/HomeExperience";
import type { WorkspaceWorkout } from "../models/WorkspaceWorkout";

export interface BuildWorkspaceWorkoutInput {
  readonly athleteId: string;
  readonly homeExperience?: HomeExperience | null;
}

/**
 * Builds workout projection from Home Experience workout card.
 */
export function buildWorkspaceWorkout(
  input: BuildWorkspaceWorkoutInput,
): WorkspaceWorkout {
  const card = input.homeExperience?.workout ?? null;
  const present = card?.present === true;

  return Object.freeze({
    athleteId: input.athleteId,
    present,
    card,
    planId: card?.planId ?? null,
    planName: card?.planName ?? null,
    currentPhase: card?.currentPhase ?? null,
    planVersion: card?.planVersion ?? null,
    summary: card?.summary ?? "No workout plan is currently available.",
  });
}

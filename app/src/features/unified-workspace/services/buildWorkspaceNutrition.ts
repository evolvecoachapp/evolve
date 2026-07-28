import type { HomeExperience } from "../../home-experience/models/HomeExperience";
import type { WorkspaceNutrition } from "../models/WorkspaceNutrition";

export interface BuildWorkspaceNutritionInput {
  readonly athleteId: string;
  readonly homeExperience?: HomeExperience | null;
}

/**
 * Builds nutrition projection from Home Experience nutrition card.
 */
export function buildWorkspaceNutrition(
  input: BuildWorkspaceNutritionInput,
): WorkspaceNutrition {
  const card = input.homeExperience?.nutrition ?? null;
  const present = card?.present === true;

  return Object.freeze({
    athleteId: input.athleteId,
    present,
    card,
    planId: card?.planId ?? null,
    macros: card?.macros ?? null,
    phaseHint: card?.phaseHint ?? null,
    summary: card?.summary ?? "No nutrition plan is currently available.",
  });
}

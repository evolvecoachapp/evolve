import type { AthletePreferences } from "../models/AthletePreferences";

export interface BuildPreferencesInput {
  readonly preferredTrainingTimes?: readonly string[];
  readonly preferredModalities?: readonly string[];
  readonly dietaryPreferences?: readonly string[];
  readonly communicationTone?: string | null;
  readonly notes?: readonly string[];
}

/**
 * Builds immutable AthletePreferences.
 */
export function buildPreferences(
  input: BuildPreferencesInput = {},
): AthletePreferences {
  return Object.freeze({
    preferredTrainingTimes: Object.freeze([
      ...(input.preferredTrainingTimes ?? []),
    ]),
    preferredModalities: Object.freeze([
      ...(input.preferredModalities ?? []),
    ]),
    dietaryPreferences: Object.freeze([
      ...(input.dietaryPreferences ?? []),
    ]),
    communicationTone: input.communicationTone ?? null,
    notes: Object.freeze([...(input.notes ?? [])]),
  });
}

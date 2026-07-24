/**
 * Immutable preferences slice.
 */
export interface AthletePreferences {
  readonly preferredTrainingTimes: readonly string[];
  readonly preferredModalities: readonly string[];
  readonly dietaryPreferences: readonly string[];
  readonly communicationTone: string | null;
  readonly notes: readonly string[];
}

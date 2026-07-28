/**
 * Immutable athlete preferences (Sprint 29.1).
 *
 * Coaching / lifestyle preference signals only — not Athlete State preferences.
 */
export interface AthletePreferences {
  readonly preferredTrainingTimes: readonly string[];
  readonly preferredModalities: readonly string[];
  readonly dietaryPreferences: readonly string[];
  readonly communicationTone: string | null;
  readonly notes: readonly string[];
}

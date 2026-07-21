import type { AthleteContextSnapshot } from "../models/AthleteContextSnapshot";
import type { AthleteContextValidationResult } from "../models/AthleteContextValidationResult";
import type { AthleteProfile } from "../models/AthleteProfile";

/**
 * Persistence boundary for Athlete Context.
 *
 * Implementations must return immutable snapshots and must never call AI
 * providers, networking, UI, or cloud sync. AsyncStorage is out of scope.
 */
export interface AthleteContextRepository {
  /** Load the current athlete profile, or null when unset. */
  getProfile(): Promise<AthleteProfile | null>;

  /** Return an immutable snapshot including derived training age. */
  getSnapshot(referenceDate?: Date): Promise<AthleteContextSnapshot>;

  /** Replace the stored profile after sanitization and validation. */
  updateProfile(profile: AthleteProfile): Promise<AthleteProfile>;

  /** Validate a profile without persisting. Never throws for invalid data. */
  validateProfile(profile: AthleteProfile): AthleteContextValidationResult;
}

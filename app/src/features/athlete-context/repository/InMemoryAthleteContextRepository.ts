import type { AthleteContextSnapshot } from "../models/AthleteContextSnapshot";
import type { AthleteContextValidationResult } from "../models/AthleteContextValidationResult";
import type { AthleteProfile } from "../models/AthleteProfile";
import { createAthleteProfile } from "../testSupport/fixtures";
import { calculateTrainingAge } from "../utils/calculateTrainingAge";
import { deepFreezeProfile } from "../utils/deepFreezeProfile";
import { sanitizeAthleteProfile } from "../utils/sanitizeAthleteProfile";
import { validateAthleteContext } from "../validation/validateAthleteContext";
import type { AthleteContextRepository } from "./AthleteContextRepository";

/**
 * Ephemeral in-process AthleteContextRepository.
 *
 * Suitable for tests and offline orchestration — not durable storage.
 */
export class InMemoryAthleteContextRepository
  implements AthleteContextRepository
{
  private profile: AthleteProfile;

  constructor(initialProfile: AthleteProfile = createAthleteProfile()) {
    this.profile = deepFreezeProfile(sanitizeAthleteProfile(initialProfile));
  }

  async getProfile(): Promise<AthleteProfile | null> {
    return this.cloneProfile(this.profile);
  }

  async getSnapshot(
    referenceDate: Date = new Date(),
  ): Promise<AthleteContextSnapshot> {
    const profile = this.cloneProfile(this.profile);
    const validation = validateAthleteContext(profile);

    return Object.freeze({
      profile,
      trainingAgeYears: calculateTrainingAge(profile.experience, referenceDate),
      validation,
      capturedAt: referenceDate.toISOString(),
    });
  }

  async updateProfile(profile: AthleteProfile): Promise<AthleteProfile> {
    // Persist sanitized profile even when invalid; consumers inspect
    // snapshot.validation from getSnapshot().
    const sanitized = sanitizeAthleteProfile(profile);
    const updatedAt = new Date().toISOString();
    const next = deepFreezeProfile(
      Object.freeze({
        ...sanitized,
        updatedAt,
      }),
    );

    this.profile = next;
    return this.cloneProfile(next);
  }

  validateProfile(profile: AthleteProfile): AthleteContextValidationResult {
    return validateAthleteContext(sanitizeAthleteProfile(profile));
  }

  /** Test helper — replace stored profile without updating timestamps. */
  seed(profile: AthleteProfile): void {
    this.profile = deepFreezeProfile(sanitizeAthleteProfile(profile));
  }

  private cloneProfile(profile: AthleteProfile): AthleteProfile {
    return deepFreezeProfile(
      sanitizeAthleteProfile(
        Object.freeze({
          ...profile,
          goal: Object.freeze({ ...profile.goal }),
          experience: Object.freeze({ ...profile.experience }),
          availability: Object.freeze({
            ...profile.availability,
            preferredDays: Object.freeze([...profile.availability.preferredDays]),
          }),
          preference: Object.freeze({ ...profile.preference }),
          equipment: Object.freeze({
            ...profile.equipment,
            available: Object.freeze([...profile.equipment.available]),
          }),
          injuries: Object.freeze({
            injuries: Object.freeze(
              profile.injuries.injuries.map((entry) =>
                Object.freeze({ ...entry }),
              ),
            ),
          }),
        }),
      ),
    );
  }
}

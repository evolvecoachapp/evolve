import type { AthleteIdentity } from "./AthleteIdentity";
import type { AthleteMetadata } from "./AthleteMetadata";
import type { AthleteProfile } from "./AthleteProfile";

export interface AthleteIdentityValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

/**
 * Immutable result of building Athlete Identity.
 */
export interface AthleteIdentityResult {
  readonly id: string;
  readonly success: boolean;
  readonly identity: AthleteIdentity | null;
  readonly profile: AthleteProfile | null;
  readonly metadata: AthleteMetadata | null;
  readonly validation: AthleteIdentityValidation;
  readonly message: string;
  readonly generatedAt: string;
}

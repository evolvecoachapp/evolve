import type { AthleteIdentity } from "./AthleteIdentity";
import type { AthleteMetadata } from "./AthleteMetadata";
import type { AthleteStatus } from "./AthleteStatus";

/**
 * Immutable athlete profile slice.
 */
export interface AthleteProfile {
  readonly identity: AthleteIdentity;
  readonly status: AthleteStatus;
  readonly sex: string | null;
  readonly birthYear: number | null;
  readonly experienceLevel: string | null;
  readonly metadata: AthleteMetadata;
}

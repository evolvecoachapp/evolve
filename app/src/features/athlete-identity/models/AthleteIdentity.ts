import type { AthleteLocale } from "./AthleteLocale";
import type { AthleteMetadata } from "./AthleteMetadata";
import type { AthletePreferences } from "./AthletePreferences";
import type { AthleteProfile } from "./AthleteProfile";
import type { AthleteSettings } from "./AthleteSettings";
import type { AthleteTimeZone } from "./AthleteTimeZone";
import type { AthleteUnits } from "./AthleteUnits";

/**
 * Immutable Athlete Identity (Sprint 29.1).
 *
 * Stable identity foundation for future Auth / Sync / Cache / Analytics /
 * Coach Portal / Sharing / Export. Not authentication. Not persistence.
 * Not Athlete State.
 */
export interface AthleteIdentity {
  readonly id: string;
  readonly athleteId: string;
  readonly profile: AthleteProfile;
  readonly preferences: AthletePreferences;
  readonly settings: AthleteSettings;
  readonly locale: AthleteLocale;
  readonly units: AthleteUnits;
  readonly timeZone: AthleteTimeZone;
  readonly metadata: AthleteMetadata;
  readonly createdAt: string;
}

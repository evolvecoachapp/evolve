/**
 * Athlete Identity Foundation (Sprint 29.1).
 *
 * Immutable identity layer for future Auth / Sync / Cache / Analytics /
 * Coach Portal / Sharing / Export. Not authentication. Not persistence.
 * Not Athlete State.
 */

export * from "./models";
export * from "./services";
export {
  composeAthleteIdentity,
  getAthleteIdentity,
  getAthleteProfile,
  getPreferences,
  getSettings,
  validateAthleteIdentityForAthlete,
} from "./application";

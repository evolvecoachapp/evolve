/**
 * Personal Record metric kinds supported in Sprint 18.4.
 * New PR kinds can be appended without changing Achievement core models.
 */
export type PersonalRecordType =
  | "highest_weight"
  | "highest_volume"
  | "highest_tonnage"
  | "highest_repetitions"
  | "highest_completed_sets"
  | "highest_density"
  | "highest_exercise_volume"
  | "highest_session_volume";

export const PersonalRecordTypes = {
  HIGHEST_WEIGHT: "highest_weight",
  HIGHEST_VOLUME: "highest_volume",
  HIGHEST_TONNAGE: "highest_tonnage",
  HIGHEST_REPETITIONS: "highest_repetitions",
  HIGHEST_COMPLETED_SETS: "highest_completed_sets",
  HIGHEST_DENSITY: "highest_density",
  HIGHEST_EXERCISE_VOLUME: "highest_exercise_volume",
  HIGHEST_SESSION_VOLUME: "highest_session_volume",
} as const satisfies Record<string, PersonalRecordType>;

/** Provenance of a generated blueprint. */
export type WorkoutBlueprintSource = "ai" | "derived" | "manual";

export const WORKOUT_BLUEPRINT_SOURCES = Object.freeze([
  "ai",
  "derived",
  "manual",
] as const satisfies readonly WorkoutBlueprintSource[]);

/**
 * Immutable metadata attached to a WorkoutBlueprint.
 */
export interface WorkoutBlueprintMetadata {
  readonly version: string;
  readonly source: WorkoutBlueprintSource;
  readonly athleteId: string | null;
  /** ISO-8601 timestamp. */
  readonly createdAt: string;
  readonly tags: readonly string[];
}

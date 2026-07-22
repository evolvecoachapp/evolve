import type { ExerciseTag } from "./ExerciseTag";

/** Provenance of an exercise knowledge entry. */
export type ExerciseKnowledgeSource = "catalog" | "derived" | "manual";

export const EXERCISE_KNOWLEDGE_SOURCES = Object.freeze([
  "catalog",
  "derived",
  "manual",
] as const satisfies readonly ExerciseKnowledgeSource[]);

/**
 * Immutable metadata attached to an ExerciseDefinition.
 */
export interface ExerciseMetadata {
  readonly version: string;
  readonly source: ExerciseKnowledgeSource;
  /** ISO-8601 timestamp. */
  readonly createdAt: string;
  /** ISO-8601 timestamp. */
  readonly updatedAt: string;
  readonly tags: readonly ExerciseTag[];
}

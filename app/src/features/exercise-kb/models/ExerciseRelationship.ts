/** Directed relationship kinds between exercises. */
export type ExerciseRelationshipKind =
  | "alternative"
  | "progression"
  | "regression"
  | "variation"
  | "related";

export const EXERCISE_RELATIONSHIP_KINDS = Object.freeze([
  "alternative",
  "progression",
  "regression",
  "variation",
  "related",
] as const satisfies readonly ExerciseRelationshipKind[]);

/**
 * Edge in the exercise relationship graph.
 * targetExerciseId references another ExerciseDefinition.id.
 */
export interface ExerciseRelationship {
  readonly kind: ExerciseRelationshipKind;
  readonly targetExerciseId: string;
  /** Similarity / relevance in [0, 1]. Higher is closer. */
  readonly strength: number;
}

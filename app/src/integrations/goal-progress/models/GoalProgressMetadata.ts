/** Immutable metadata attached to every goal progress event. */
export interface GoalProgressMetadata {
  readonly source: "goal";
  readonly correlationId: string;
  readonly goalId: string;
  readonly snapshotId: string | null;
  readonly athleteId: string | null;
  readonly publishedAt: string;
}

export function createGoalProgressMetadata(
  input: GoalProgressMetadata,
): GoalProgressMetadata {
  return Object.freeze({ ...input });
}

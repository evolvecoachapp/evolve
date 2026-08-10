/**
 * Persisted goal progress runtime overlay stored in Unified Workspace (Sprint 35.4).
 */
export interface GoalRuntimePersistenceState {
  readonly athleteId: string;
  readonly reachedMilestoneIds: readonly string[];
  readonly isCompleted: boolean;
}

export function createGoalRuntimePersistenceState(
  input: GoalRuntimePersistenceState,
): GoalRuntimePersistenceState {
  return Object.freeze({
    athleteId: input.athleteId,
    reachedMilestoneIds: Object.freeze([...input.reachedMilestoneIds]),
    isCompleted: input.isCompleted,
  });
}

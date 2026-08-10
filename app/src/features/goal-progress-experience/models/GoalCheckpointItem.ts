export interface GoalCheckpointItem {
  readonly id: string;
  readonly label: string;
}

export function createGoalCheckpointItem(input: GoalCheckpointItem): GoalCheckpointItem {
  return Object.freeze({ ...input });
}

export interface GoalMilestoneItem {
  readonly id: string;
  readonly label: string;
  readonly category: string;
  readonly reached: boolean;
}

export function createGoalMilestoneItem(input: GoalMilestoneItem): GoalMilestoneItem {
  return Object.freeze({ ...input });
}

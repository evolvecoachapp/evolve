export type ProgressGoalType =
  | "weight_loss"
  | "muscle_gain"
  | "strength"
  | "endurance"
  | "maintenance";

/** Active fitness goal tracked on the Progress dashboard. */
export interface ProgressGoal {
  id: string;
  type: ProgressGoalType;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
  progressPercent: number;
}

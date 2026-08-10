import type { GoalCheckpointItem } from "./GoalCheckpointItem";
import type { GoalMilestoneItem } from "./GoalMilestoneItem";

export interface GoalProgressDashboard {
  readonly goalId: string | null;
  readonly headline: string;
  readonly summary: string;
  readonly category: string | null;
  readonly currentValue: number;
  readonly targetValue: number;
  readonly unit: string;
  readonly completionPercent: number;
  readonly status: string;
  readonly milestones: readonly GoalMilestoneItem[];
  readonly checkpoints: readonly GoalCheckpointItem[];
  readonly updateAvailable: boolean;
  readonly completeAvailable: boolean;
  readonly isCompleted: boolean;
  readonly historyDestination: string | null;
}

export function createGoalProgressDashboard(
  input: GoalProgressDashboard,
): GoalProgressDashboard {
  return Object.freeze({
    ...input,
    milestones: Object.freeze([...input.milestones]),
    checkpoints: Object.freeze([...input.checkpoints]),
  });
}

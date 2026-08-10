import type { GoalCheckpointItem } from "../models/GoalCheckpointItem";
import type { GoalMilestoneItem } from "../models/GoalMilestoneItem";

export interface GoalCheckpointItemDto {
  readonly id: string;
  readonly label: string;
}

export interface GoalMilestoneItemDto {
  readonly id: string;
  readonly label: string;
  readonly category: string;
  readonly reached: boolean;
}

export interface GoalProgressDashboardDto {
  readonly goalId: string | null;
  readonly headline: string;
  readonly summary: string;
  readonly category: string | null;
  readonly currentValue: number;
  readonly targetValue: number;
  readonly unit: string;
  readonly completionPercent: number;
  readonly status: string;
  readonly milestones: readonly GoalMilestoneItemDto[];
  readonly checkpoints: readonly GoalCheckpointItemDto[];
  readonly updateAvailable: boolean;
  readonly completeAvailable: boolean;
  readonly isCompleted: boolean;
  readonly historyDestination?: string | null;
}

export type GoalProgressExperienceProviderId = "mock" | "backend" | "local";

export interface GoalProgressExperienceService {
  readonly providerId: GoalProgressExperienceProviderId;
  getDashboard(): Promise<GoalProgressDashboardDto>;
  updateProgress(): Promise<GoalProgressDashboardDto>;
  completeMilestone(milestoneId: string): Promise<GoalProgressDashboardDto>;
  completeGoal(): Promise<GoalProgressDashboardDto>;
}

export class GoalProgressExperienceError extends Error {
  constructor(
    message: string,
    readonly providerId?: GoalProgressExperienceProviderId,
  ) {
    super(message);
    this.name = "GoalProgressExperienceError";
  }
}

export type { GoalCheckpointItem, GoalMilestoneItem };

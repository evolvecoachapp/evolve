import type {
  DashboardProjectionAthleteCard,
  DashboardProjectionCoachCard,
  DashboardProjectionNutritionCard,
  DashboardProjectionQuickAction,
  DashboardProjectionRecoveryCard,
  DashboardProjectionWorkoutCard,
} from "./DashboardProjectionCard";

/** Immutable Dashboard read model projected from Unified Workspace only. */
export interface DashboardProjection {
  readonly workspaceId: string;
  readonly athleteId: string;
  readonly headline: string;
  readonly statusLabel: string | null;
  readonly athlete: DashboardProjectionAthleteCard;
  readonly workout: DashboardProjectionWorkoutCard;
  readonly nutrition: DashboardProjectionNutritionCard;
  readonly recovery: DashboardProjectionRecoveryCard;
  readonly coach: DashboardProjectionCoachCard;
  readonly quickActions: readonly DashboardProjectionQuickAction[];
  readonly isEmpty: boolean;
  readonly projectedAt: string;
}

export function createDashboardProjection(
  input: DashboardProjection,
): DashboardProjection {
  return Object.freeze({
    ...input,
    quickActions: Object.freeze([...input.quickActions]),
  });
}

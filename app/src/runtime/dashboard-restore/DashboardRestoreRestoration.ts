import type { AthleteIdentityService } from "../../features/athlete-identity/services/AthleteIdentityService";
import type { HomeDashboard } from "../../features/home/models/HomeDashboard";
import type { HomeDashboardViewModel } from "../../features/home/viewmodels/HomeDashboardViewModel";
import type { NutritionMacroCard } from "../../features/home/models/NutritionSummaryCard";
import type { QuickAction } from "../../features/home/models/QuickAction";
import type { DashboardProjector } from "../../integrations/dashboard-projection/projector/DashboardProjector";
import {
  createDashboardProjectionIdentity,
  type DashboardProjection,
} from "../../integrations/dashboard-projection/models";
import type { UnifiedWorkspaceService } from "../../features/unified-workspace/services/UnifiedWorkspaceService";
import { DashboardRestoreError } from "./DashboardRestoreError";

export interface DashboardRestoreRestorationDeps {
  readonly unifiedWorkspaceService: UnifiedWorkspaceService;
  readonly dashboardProjector: DashboardProjector;
  readonly athleteIdentityService: AthleteIdentityService;
  readonly homeDashboardViewModel?: HomeDashboardViewModel | null;
}

export interface DashboardRestoreRestorationResult {
  readonly dashboards: readonly HomeDashboard[];
  readonly projectedCount: number;
  readonly emptyCount: number;
}

function createEmptyMacroCard(): NutritionMacroCard {
  return Object.freeze({
    current: 0,
    target: 0,
    progressPercent: 0,
    unitLabel: "",
  });
}

/** Structural empty dashboard when Unified Workspace has no snapshot. */
export function createEmptyHomeDashboard(): HomeDashboard {
  return Object.freeze({
    athlete: Object.freeze({
      displayName: "",
      initials: "",
      greeting: "",
      dateLabel: "",
      subtitle: "",
      streakDays: 0,
      recoveryScore: 0,
      workoutsCompleted: 0,
      workoutsTarget: 0,
      avgCalories: 0,
      present: false,
    }),
    workout: Object.freeze({
      present: false,
      name: "",
      muscleGroups: "",
      durationMinutes: 0,
      statusLabel: "",
      destination: "",
    }),
    nutrition: Object.freeze({
      present: false,
      calories: createEmptyMacroCard(),
      protein: createEmptyMacroCard(),
      carbs: createEmptyMacroCard(),
      fat: createEmptyMacroCard(),
      destination: "",
    }),
    recovery: Object.freeze({
      present: false,
      score: 0,
      status: "",
      tip: "",
    }),
    coach: Object.freeze({
      present: false,
      message: "",
      actionLabel: "",
      destination: "",
    }),
    quickActions: Object.freeze([]) as readonly QuickAction[],
    isEmpty: true,
  });
}

/** Maps a Dashboard projection into the Home dashboard read model without business logic. */
export function mapDashboardProjectionToHomeDashboard(
  projection: DashboardProjection,
): HomeDashboard {
  return Object.freeze({
    athlete: Object.freeze({ ...projection.athlete }),
    workout: Object.freeze({ ...projection.workout }),
    nutrition: Object.freeze({
      present: projection.nutrition.present,
      destination: projection.nutrition.destination,
      calories: Object.freeze({ ...projection.nutrition.calories }),
      protein: Object.freeze({ ...projection.nutrition.protein }),
      carbs: Object.freeze({ ...projection.nutrition.carbs }),
      fat: Object.freeze({ ...projection.nutrition.fat }),
    }),
    recovery: Object.freeze({ ...projection.recovery }),
    coach: Object.freeze({ ...projection.coach }),
    quickActions: Object.freeze(
      projection.quickActions.map((action) => Object.freeze({ ...action })),
    ),
    isEmpty: projection.isEmpty,
  });
}

function resolveProjectionIdentity(
  athleteId: string,
  athleteIdentityService: AthleteIdentityService,
) {
  const identity = athleteIdentityService.getAthleteIdentity(athleteId);
  const displayName = identity?.profile.displayName ?? athleteId;
  const initials =
    identity?.profile.givenName && identity.profile.familyName
      ? `${identity.profile.givenName.charAt(0)}${identity.profile.familyName.charAt(0)}`
      : displayName.slice(0, 2).toUpperCase();

  return createDashboardProjectionIdentity({
    displayName,
    initials,
  });
}

/**
 * Restores Dashboard read models from Unified Workspace snapshots via projection.
 * No repository access — workspace-only.
 */
export function restoreDashboardFromWorkspace(
  deps: DashboardRestoreRestorationDeps,
  athleteIds: readonly string[],
): DashboardRestoreRestorationResult {
  const dashboards: HomeDashboard[] = [];
  let projectedCount = 0;
  let emptyCount = 0;

  for (const athleteId of athleteIds) {
    const workspace = deps.unifiedWorkspaceService.getWorkspace(athleteId);

    if (!workspace) {
      dashboards.push(createEmptyHomeDashboard());
      emptyCount += 1;
      continue;
    }

    const identity = resolveProjectionIdentity(
      athleteId,
      deps.athleteIdentityService,
    );
    const projectionResult = deps.dashboardProjector.projectForAthlete(
      athleteId,
      identity,
    );

    if (!projectionResult?.accepted || !projectionResult.projection) {
      throw new DashboardRestoreError(
        `Dashboard projection failed for athlete ${athleteId}`,
        "projection_failed",
      );
    }

    dashboards.push(
      mapDashboardProjectionToHomeDashboard(projectionResult.projection),
    );
    projectedCount += 1;
  }

  const primaryDashboard =
    dashboards[0] ?? createEmptyHomeDashboard();

  if (deps.homeDashboardViewModel) {
    deps.homeDashboardViewModel.applyRestoredDashboard(primaryDashboard);
  }

  return {
    dashboards: Object.freeze(dashboards),
    projectedCount,
    emptyCount,
  };
}

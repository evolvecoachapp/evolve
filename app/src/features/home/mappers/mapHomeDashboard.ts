import type { HomeDashboard as HomeDashboardDto } from "../types/homeDashboard";
import type { HomeDashboard } from "../models/HomeDashboard";
import {
  mapAthleteSnapshot,
  type AthleteIdentityInput,
} from "./mapAthleteSnapshot";
import {
  mapCoachSummary,
  mapNutritionSummary,
  mapRecoverySummary,
  mapWorkoutSummary,
} from "./mapDashboardCards";
import { mapQuickActions } from "./mapQuickActions";

export interface MapHomeDashboardInput {
  readonly dto: HomeDashboardDto;
  readonly identity: AthleteIdentityInput;
  readonly quickActions?: readonly import("../models/QuickAction").QuickAction[];
}

/** Maps a provider Home dashboard DTO into the immutable Home read model. */
export function mapHomeDashboard(input: MapHomeDashboardInput): HomeDashboard {
  const workout = mapWorkoutSummary(input.dto);
  const nutrition = mapNutritionSummary(input.dto);
  const recovery = mapRecoverySummary(input.dto);
  const coach = mapCoachSummary(input.dto);
  const athlete = mapAthleteSnapshot(input.dto, input.identity);
  const quickActions = Object.freeze(
    input.quickActions ?? mapQuickActions(input.dto),
  );

  const isEmpty =
    !workout.present &&
    !nutrition.present &&
    !recovery.present &&
    !coach.present;

  return Object.freeze({
    athlete,
    workout,
    nutrition,
    recovery,
    coach,
    quickActions,
    isEmpty,
  });
}

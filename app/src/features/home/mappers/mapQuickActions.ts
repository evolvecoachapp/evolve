import type { HomeDashboard as HomeDashboardDto } from "../types/homeDashboard";
import {
  QuickActionKinds,
  type QuickAction,
} from "../models/QuickAction";

/**
 * Derives deterministic Home quick actions from the provider dashboard.
 * Destinations are navigation placeholders for future wiring.
 */
export function mapQuickActions(dto: HomeDashboardDto): readonly QuickAction[] {
  const hasWorkout = dto.workoutPreview.name.trim().length > 0;
  const hasNutrition = dto.nutritionSummary.calories.target > 0;
  const hasCoach = dto.coachSummary.message.trim().length > 0;
  const hasProgress = dto.weeklyProgress.workoutsTarget > 0;

  const actions: QuickAction[] = [
    Object.freeze({
      id: "qa:start_workout",
      kind: QuickActionKinds.START_WORKOUT,
      label: "Start Workout",
      icon: "barbell-outline",
      destination: "/(app)/(tabs)/workout",
      enabled: hasWorkout,
      reason: hasWorkout
        ? "Today's workout is available."
        : "No workout scheduled.",
    }),
    Object.freeze({
      id: "qa:log_nutrition",
      kind: QuickActionKinds.LOG_NUTRITION,
      label: "Log Nutrition",
      icon: "nutrition-outline",
      destination: "/(app)/(tabs)/nutrition",
      enabled: hasNutrition,
      reason: hasNutrition
        ? "Nutrition targets are available."
        : "No nutrition targets.",
    }),
    Object.freeze({
      id: "qa:view_recovery",
      kind: QuickActionKinds.VIEW_RECOVERY,
      label: "Recovery",
      icon: "heart-outline",
      destination: "/(app)/recovery",
      enabled: dto.recovery.score >= 0,
      reason: "Recovery summary is available.",
    }),
    Object.freeze({
      id: "qa:ask_coach",
      kind: QuickActionKinds.ASK_COACH,
      label: "Ask Coach",
      icon: "chatbubble-ellipses-outline",
      destination: "/(app)/(tabs)/coach",
      enabled: hasCoach,
      reason: hasCoach
        ? "Coach insight is available."
        : "No coach insight yet.",
    }),
    Object.freeze({
      id: "qa:view_progress",
      kind: QuickActionKinds.VIEW_PROGRESS,
      label: "Progress",
      icon: "bar-chart-outline",
      destination: "/(app)/(tabs)/progress",
      enabled: hasProgress,
      reason: hasProgress
        ? "Weekly progress is available."
        : "No weekly progress yet.",
    }),
    Object.freeze({
      id: "qa:view_profile",
      kind: QuickActionKinds.VIEW_PROFILE,
      label: "Profile",
      icon: "person-outline",
      destination: "/(app)/(tabs)/profile",
      enabled: true,
      reason: "Open athlete profile.",
    }),
  ];

  return Object.freeze(actions);
}

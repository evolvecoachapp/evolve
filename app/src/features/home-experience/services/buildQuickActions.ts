import type { HomeCoachCard } from "../models/HomeCoachCard";
import type { HomeGoalCard } from "../models/HomeGoalCard";
import type { HomeInsightCard } from "../models/HomeInsightCard";
import type { HomeNutritionCard } from "../models/HomeNutritionCard";
import {
  HomeQuickActionKinds,
  type HomeQuickAction,
} from "../models/HomeQuickAction";
import type { HomeTimelineCard } from "../models/HomeTimelineCard";
import type { HomeWorkoutCard } from "../models/HomeWorkoutCard";

export interface BuildQuickActionsInput {
  readonly athleteId: string;
  readonly workout: HomeWorkoutCard;
  readonly nutrition: HomeNutritionCard;
  readonly goal: HomeGoalCard;
  readonly timeline: HomeTimelineCard;
  readonly insights: readonly HomeInsightCard[];
  readonly coach: HomeCoachCard;
  readonly canRestorePlan?: boolean;
}

/**
 * Generate deterministic Home quick actions from composed card presence.
 * No LLM.
 */
export function buildQuickActions(
  input: BuildQuickActionsInput,
): readonly HomeQuickAction[] {
  const actions: HomeQuickAction[] = [
    Object.freeze({
      id: `qa:${input.athleteId}:resume_workout`,
      kind: HomeQuickActionKinds.RESUME_WORKOUT,
      label: "Resume Workout",
      enabled: input.workout.present,
      reason: input.workout.present
        ? "Active workout plan available."
        : "No workout plan to resume.",
    }),
    Object.freeze({
      id: `qa:${input.athleteId}:continue_nutrition`,
      kind: HomeQuickActionKinds.CONTINUE_NUTRITION,
      label: "Continue Nutrition",
      enabled: input.nutrition.present,
      reason: input.nutrition.present
        ? "Active nutrition guidance available."
        : "No nutrition plan to continue.",
    }),
    Object.freeze({
      id: `qa:${input.athleteId}:review_goal`,
      kind: HomeQuickActionKinds.REVIEW_GOAL,
      label: "Review Goal",
      enabled: input.goal.present,
      reason: input.goal.present
        ? "Goal progress available."
        : "No goal progress to review.",
    }),
    Object.freeze({
      id: `qa:${input.athleteId}:see_timeline`,
      kind: HomeQuickActionKinds.SEE_TIMELINE,
      label: "See Timeline",
      enabled: input.timeline.present,
      reason: input.timeline.present
        ? "Coach timeline events available."
        : "No timeline events.",
    }),
    Object.freeze({
      id: `qa:${input.athleteId}:view_insights`,
      kind: HomeQuickActionKinds.VIEW_INSIGHTS,
      label: "View Insights",
      enabled: input.insights.length > 0,
      reason:
        input.insights.length > 0
          ? `${input.insights.length} insight(s) available.`
          : "No insights available.",
    }),
    Object.freeze({
      id: `qa:${input.athleteId}:restore_previous_plan`,
      kind: HomeQuickActionKinds.RESTORE_PREVIOUS_PLAN,
      label: "Restore Previous Plan",
      enabled: input.canRestorePlan === true,
      reason:
        input.canRestorePlan === true
          ? "Prior plan version available to restore."
          : "No prior plan version to restore.",
    }),
  ];

  return Object.freeze(actions);
}

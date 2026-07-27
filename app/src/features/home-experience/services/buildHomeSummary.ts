import type { HomeCoachCard } from "../models/HomeCoachCard";
import type { HomeExperience } from "../models/HomeExperience";
import type { HomeGoalCard } from "../models/HomeGoalCard";
import type { HomeInsightCard } from "../models/HomeInsightCard";
import type { HomeNutritionCard } from "../models/HomeNutritionCard";
import type { HomeQuickAction } from "../models/HomeQuickAction";
import type { HomeRecoveryCard } from "../models/HomeRecoveryCard";
import type { HomeSummary } from "../models/HomeSummary";
import type { HomeTimelineCard } from "../models/HomeTimelineCard";
import type { HomeWorkoutCard } from "../models/HomeWorkoutCard";

export interface BuildHomeSummaryInput {
  readonly athleteId: string;
  readonly experienceId: string;
  readonly workout: HomeWorkoutCard;
  readonly nutrition: HomeNutritionCard;
  readonly recovery: HomeRecoveryCard;
  readonly goal: HomeGoalCard;
  readonly insights: readonly HomeInsightCard[];
  readonly timeline: HomeTimelineCard;
  readonly coach: HomeCoachCard;
  readonly quickActions: readonly HomeQuickAction[];
  readonly generatedAt: string;
}

/**
 * Deterministic Home summary from composed cards.
 */
export function buildHomeSummary(input: BuildHomeSummaryInput): HomeSummary {
  const presentCards = [
    input.workout.present,
    input.nutrition.present,
    input.recovery.present,
    input.goal.present,
    input.timeline.present,
    input.coach.present,
    input.insights.length > 0,
  ].filter(Boolean).length;

  const highlights: string[] = [];
  if (input.coach.present && input.coach.headline) {
    highlights.push(input.coach.headline);
  }
  if (input.workout.present && input.workout.planName) {
    highlights.push(input.workout.planName);
  }
  if (input.insights.length > 0) {
    highlights.push(input.insights[0]!.title);
  }
  if (input.recovery.present && input.recovery.status) {
    highlights.push(`Recovery: ${input.recovery.status}`);
  }
  if (input.goal.present && input.goal.category) {
    highlights.push(`Goal: ${input.goal.category}`);
  }

  const enabledActions = input.quickActions.filter((a) => a.enabled).length;
  const headline =
    presentCards > 0
      ? "Your coaching home is ready"
      : "Awaiting coaching signals";

  const narrative =
    presentCards > 0
      ? `Composed ${presentCards} home cards from existing coaching knowledge` +
        (input.insights.length > 0
          ? ` with ${input.insights.length} insight(s)`
          : "") +
        `.`
      : "No domain evidence available yet for Home composition.";

  return Object.freeze({
    id: `home-summary:${input.experienceId}`,
    athleteId: input.athleteId,
    headline,
    narrative,
    highlights: Object.freeze(highlights),
    presentCardCount: presentCards,
    insightCount: input.insights.length,
    quickActionCount: enabledActions,
    generatedAt: input.generatedAt,
  });
}

export function deriveRelatedDomains(experience: {
  readonly workout: HomeWorkoutCard;
  readonly nutrition: HomeNutritionCard;
  readonly recovery: HomeRecoveryCard;
  readonly goal: HomeGoalCard;
  readonly insights: readonly HomeInsightCard[];
  readonly timeline: HomeTimelineCard;
  readonly coach: HomeCoachCard;
}): readonly string[] {
  const domains = new Set<string>();
  if (experience.workout.present) domains.add("workout");
  if (experience.nutrition.present) domains.add("nutrition");
  if (experience.recovery.present) domains.add("recovery");
  if (experience.goal.present) domains.add("goal");
  if (experience.timeline.present) domains.add("timeline");
  if (experience.coach.present) domains.add("coach");
  for (const insight of experience.insights) {
    domains.add(insight.domain);
  }
  return Object.freeze([...domains]);
}

export type { HomeExperience };

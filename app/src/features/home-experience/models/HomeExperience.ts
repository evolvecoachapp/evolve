import type { HomeCoachCard } from "./HomeCoachCard";
import type { HomeGoalCard } from "./HomeGoalCard";
import type { HomeInsightCard } from "./HomeInsightCard";
import type { HomeNutritionCard } from "./HomeNutritionCard";
import type { HomeQuickAction } from "./HomeQuickAction";
import type { HomeRecoveryCard } from "./HomeRecoveryCard";
import type { HomeSummary } from "./HomeSummary";
import type { HomeTimelineCard } from "./HomeTimelineCard";
import type { HomeWorkoutCard } from "./HomeWorkoutCard";

/**
 * Immutable Home Experience (Sprint 27.1).
 *
 * Deterministic composition of existing coaching knowledge for the Home dashboard.
 * No new AI engines. No duplicated business logic. Never mutate after creation.
 */
export interface HomeExperience {
  readonly id: string;
  readonly athleteId: string;
  readonly timestamp: string;
  readonly summary: HomeSummary;
  readonly workout: HomeWorkoutCard;
  readonly nutrition: HomeNutritionCard;
  readonly recovery: HomeRecoveryCard;
  readonly goal: HomeGoalCard;
  readonly insights: readonly HomeInsightCard[];
  readonly timeline: HomeTimelineCard;
  readonly coach: HomeCoachCard;
  readonly quickActions: readonly HomeQuickAction[];
  readonly relatedDomains: readonly string[];
  readonly metadata: Readonly<Record<string, string>>;
}

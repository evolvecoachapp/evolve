import type { DailyBriefCoachMessage } from "./DailyBriefCoachMessage";
import type { DailyBriefConfidence } from "./DailyBriefConfidence";
import type { DailyBriefGoals } from "./DailyBriefGoals";
import type { DailyBriefInsights } from "./DailyBriefInsights";
import type { DailyBriefNutrition } from "./DailyBriefNutrition";
import type { DailyBriefPriority } from "./DailyBriefPriority";
import type { DailyBriefRecovery } from "./DailyBriefRecovery";
import type { DailyBriefSummary } from "./DailyBriefSummary";
import type { DailyBriefWorkout } from "./DailyBriefWorkout";

/**
 * Immutable Athlete Daily Brief (Sprint 27.2).
 *
 * Deterministic composition of existing coaching knowledge.
 * Not a chat response. Not a notification. Not an LLM summary.
 * No new AI engines. No duplicated business logic. Never mutate after creation.
 */
export interface DailyBrief {
  readonly id: string;
  readonly athleteId: string;
  readonly timestamp: string;
  readonly summary: DailyBriefSummary;
  readonly workout: DailyBriefWorkout;
  readonly nutrition: DailyBriefNutrition;
  readonly recovery: DailyBriefRecovery;
  readonly goals: DailyBriefGoals;
  readonly insights: DailyBriefInsights;
  readonly coachMessage: DailyBriefCoachMessage;
  readonly priority: DailyBriefPriority;
  readonly confidence: DailyBriefConfidence;
  readonly relatedDomains: readonly string[];
  readonly metadata: Readonly<Record<string, string>>;
}

import type { DailyBrief } from "../models/DailyBrief";
import type { DailyBriefCoachMessage } from "../models/DailyBriefCoachMessage";
import type { DailyBriefConfidence } from "../models/DailyBriefConfidence";
import type { DailyBriefGoals } from "../models/DailyBriefGoals";
import type { DailyBriefInsights } from "../models/DailyBriefInsights";
import type { DailyBriefNutrition } from "../models/DailyBriefNutrition";
import type { DailyBriefPriority } from "../models/DailyBriefPriority";
import type { DailyBriefRecovery } from "../models/DailyBriefRecovery";
import type { DailyBriefSummary } from "../models/DailyBriefSummary";
import type { DailyBriefWorkout } from "../models/DailyBriefWorkout";

export interface BuildDailyBriefSummaryInput {
  readonly athleteId: string;
  readonly briefId: string;
  readonly workout: DailyBriefWorkout;
  readonly nutrition: DailyBriefNutrition;
  readonly recovery: DailyBriefRecovery;
  readonly goals: DailyBriefGoals;
  readonly insights: DailyBriefInsights;
  readonly coachMessage: DailyBriefCoachMessage;
  readonly priority: DailyBriefPriority;
  readonly confidence: DailyBriefConfidence;
  readonly generatedAt: string;
}

/**
 * Deterministic Daily Brief summary from composed sections.
 */
export function buildDailyBriefSummary(
  input: BuildDailyBriefSummaryInput,
): DailyBriefSummary {
  const presentSections = [
    input.workout.present,
    input.nutrition.present,
    input.recovery.present,
    input.goals.present,
    input.insights.present,
    input.coachMessage.present,
  ].filter(Boolean).length;

  const highlights: string[] = [];
  if (input.coachMessage.present && input.coachMessage.headline) {
    highlights.push(input.coachMessage.headline);
  }
  if (input.workout.present && input.workout.planName) {
    highlights.push(input.workout.planName);
  }
  if (input.insights.present && input.insights.items[0]) {
    highlights.push(input.insights.items[0].title);
  }
  if (input.recovery.present && input.recovery.status) {
    highlights.push(`Recovery: ${input.recovery.status}`);
  }
  if (input.goals.present && input.goals.category) {
    highlights.push(`Goal: ${input.goals.category}`);
  }

  const headline =
    presentSections > 0
      ? "Your daily coaching brief is ready"
      : "Awaiting coaching signals";

  const narrative =
    presentSections > 0
      ? `Composed ${presentSections} brief section(s) at priority ${input.priority}` +
        ` with ${input.confidence.level} confidence` +
        (input.insights.present
          ? ` and ${input.insights.items.length} insight(s)`
          : "") +
        `.`
      : "No domain evidence available yet for Daily Brief composition.";

  return Object.freeze({
    id: `daily-brief-summary:${input.briefId}`,
    athleteId: input.athleteId,
    headline,
    narrative,
    highlights: Object.freeze(highlights),
    presentSectionCount: presentSections,
    insightCount: input.insights.items.length,
    priority: input.priority,
    confidence: input.confidence,
    generatedAt: input.generatedAt,
  });
}

export function deriveRelatedDomains(sections: {
  readonly workout: DailyBriefWorkout;
  readonly nutrition: DailyBriefNutrition;
  readonly recovery: DailyBriefRecovery;
  readonly goals: DailyBriefGoals;
  readonly insights: DailyBriefInsights;
  readonly coachMessage: DailyBriefCoachMessage;
}): readonly string[] {
  const domains = new Set<string>();
  if (sections.workout.present) domains.add("workout");
  if (sections.nutrition.present) domains.add("nutrition");
  if (sections.recovery.present) domains.add("recovery");
  if (sections.goals.present) domains.add("goal");
  if (sections.coachMessage.present) domains.add("coach");
  for (const insight of sections.insights.items) {
    domains.add(insight.domain);
  }
  return Object.freeze([...domains]);
}

export type { DailyBrief };

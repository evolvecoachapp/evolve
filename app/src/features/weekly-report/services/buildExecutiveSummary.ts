import type { CoachingSession } from "../../coaching-session/composition/models/CoachingSession";
import type { DailyBrief } from "../../daily-brief/models/DailyBrief";
import type { HomeExperience } from "../../home-experience/models/HomeExperience";
import type { WeeklyConfidence } from "../models/WeeklyConfidence";
import type { WeeklyDecisionReport } from "../models/WeeklyDecisionReport";
import type { WeeklyExecutiveSummary } from "../models/WeeklyExecutiveSummary";
import type { WeeklyGoalReport } from "../models/WeeklyGoalReport";
import type { WeeklyInsightReport } from "../models/WeeklyInsightReport";
import type { WeeklyNutritionReport } from "../models/WeeklyNutritionReport";
import type { WeeklyRecommendationReport } from "../models/WeeklyRecommendationReport";
import type { WeeklyRecoveryReport } from "../models/WeeklyRecoveryReport";
import type { WeeklyWorkoutReport } from "../models/WeeklyWorkoutReport";

export interface BuildExecutiveSummaryInput {
  readonly athleteId: string;
  readonly reportId: string;
  readonly dailyBrief?: DailyBrief | null;
  readonly homeExperience?: HomeExperience | null;
  readonly coachingSession?: CoachingSession | null;
  readonly workout: WeeklyWorkoutReport;
  readonly nutrition: WeeklyNutritionReport;
  readonly recovery: WeeklyRecoveryReport;
  readonly goals: WeeklyGoalReport;
  readonly insights: WeeklyInsightReport;
  readonly decisions: WeeklyDecisionReport;
  readonly recommendations: WeeklyRecommendationReport;
  readonly confidence: WeeklyConfidence;
  readonly generatedAt: string;
}

/**
 * Deterministic Weekly Coach Report executive summary.
 * Composes Daily Brief, Home Experience, Coaching Session, and section highlights.
 */
export function buildExecutiveSummary(
  input: BuildExecutiveSummaryInput,
): WeeklyExecutiveSummary {
  const presentSections = [
    input.workout.present,
    input.nutrition.present,
    input.recovery.present,
    input.goals.present,
    input.insights.present,
    input.decisions.present,
    input.recommendations.present,
  ].filter(Boolean).length;

  const athleteStatus =
    input.homeExperience?.summary.headline ??
    input.dailyBrief?.summary.headline ??
    input.coachingSession?.summary.headline ??
    null;

  const weeklyHighlights: string[] = [];
  if (input.homeExperience?.summary.highlights) {
    weeklyHighlights.push(...input.homeExperience.summary.highlights);
  }
  if (input.dailyBrief?.summary.highlights) {
    for (const h of input.dailyBrief.summary.highlights) {
      if (!weeklyHighlights.includes(h)) weeklyHighlights.push(h);
    }
  }
  if (input.coachingSession?.summary.headline) {
    if (!weeklyHighlights.includes(input.coachingSession.summary.headline)) {
      weeklyHighlights.push(input.coachingSession.summary.headline);
    }
  }
  if (input.workout.present && input.workout.planName) {
    if (!weeklyHighlights.includes(input.workout.planName)) {
      weeklyHighlights.push(input.workout.planName);
    }
  }
  if (input.insights.present && input.insights.items[0]) {
    const title = input.insights.items[0].title;
    if (!weeklyHighlights.includes(title)) weeklyHighlights.push(title);
  }
  if (input.recommendations.focusForNextWeek) {
    if (!weeklyHighlights.includes(input.recommendations.focusForNextWeek)) {
      weeklyHighlights.push(input.recommendations.focusForNextWeek);
    }
  }

  const headline =
    presentSections > 0
      ? "Your weekly coach report is ready"
      : "Awaiting weekly coaching signals";

  const narrative =
    presentSections > 0
      ? `Composed ${presentSections} weekly section(s)` +
        ` with ${input.confidence.level} confidence` +
        (input.insights.present
          ? ` and ${input.insights.items.length} insight(s)`
          : "") +
        (input.decisions.present
          ? ` and ${input.decisions.decisionCount} decision(s)`
          : "") +
        `.`
      : "No domain evidence available yet for Weekly Coach Report composition.";

  return Object.freeze({
    id: `weekly-executive-summary:${input.reportId}`,
    athleteId: input.athleteId,
    headline,
    narrative,
    athleteStatus,
    weeklyHighlights: Object.freeze(weeklyHighlights),
    presentSectionCount: presentSections,
    insightCount: input.insights.items.length,
    decisionCount: input.decisions.decisionCount,
    recommendationCount: input.recommendations.titles.length,
    confidence: input.confidence,
    generatedAt: input.generatedAt,
  });
}

export function deriveRelatedDomains(sections: {
  readonly workout: WeeklyWorkoutReport;
  readonly nutrition: WeeklyNutritionReport;
  readonly recovery: WeeklyRecoveryReport;
  readonly goals: WeeklyGoalReport;
  readonly insights: WeeklyInsightReport;
  readonly decisions: WeeklyDecisionReport;
  readonly recommendations: WeeklyRecommendationReport;
}): readonly string[] {
  const domains = new Set<string>();
  if (sections.workout.present) domains.add("workout");
  if (sections.nutrition.present) domains.add("nutrition");
  if (sections.recovery.present) domains.add("recovery");
  if (sections.goals.present) domains.add("goal");
  if (sections.decisions.present) domains.add("decision");
  if (sections.recommendations.present) domains.add("recommendation");
  for (const insight of sections.insights.items) {
    domains.add(insight.domain);
  }
  for (const decision of sections.decisions.items) {
    if (decision.affectedDomain) domains.add(decision.affectedDomain);
  }
  return Object.freeze([...domains]);
}

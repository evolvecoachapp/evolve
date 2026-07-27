import {
  WeeklyConfidenceLevels,
  type WeeklyConfidence,
  type WeeklyConfidenceLevel,
} from "../models/WeeklyConfidence";
import type { WeeklyDecisionReport } from "../models/WeeklyDecisionReport";
import type { WeeklyEvidence } from "../models/WeeklyEvidence";
import type { WeeklyGoalReport } from "../models/WeeklyGoalReport";
import type { WeeklyInsightReport } from "../models/WeeklyInsightReport";
import type { WeeklyNutritionReport } from "../models/WeeklyNutritionReport";
import type { WeeklyRecommendationReport } from "../models/WeeklyRecommendationReport";
import type { WeeklyRecoveryReport } from "../models/WeeklyRecoveryReport";
import type { WeeklyWorkoutReport } from "../models/WeeklyWorkoutReport";

export interface CalculateWeeklyConfidenceInput {
  readonly workout: WeeklyWorkoutReport;
  readonly nutrition: WeeklyNutritionReport;
  readonly recovery: WeeklyRecoveryReport;
  readonly goals: WeeklyGoalReport;
  readonly insights: WeeklyInsightReport;
  readonly decisions: WeeklyDecisionReport;
  readonly recommendations: WeeklyRecommendationReport;
  readonly evidence: WeeklyEvidence;
}

/**
 * Deterministic weekly confidence from available evidence only.
 * Never generated. Never inferred by an LLM.
 *
 * evidenceCount: present sections + insight items + decision items + evidence items
 * sourceCount: distinct domain sources with evidence
 * score: clamp(evidenceCount * 0.08 + sourceCount * 0.08, 0, 1)
 * level: none=0 evidence, low<0.4, medium<0.75, high>=0.75
 */
export function calculateWeeklyConfidence(
  input: CalculateWeeklyConfidenceInput,
): WeeklyConfidence {
  const sources: string[] = [];
  let evidenceCount = 0;

  if (input.workout.present) {
    evidenceCount += 1;
    sources.push("workout");
  }
  if (input.nutrition.present) {
    evidenceCount += 1;
    sources.push("nutrition");
  }
  if (input.recovery.present) {
    evidenceCount += 1;
    sources.push("recovery");
  }
  if (input.goals.present) {
    evidenceCount += 1;
    sources.push("goal");
  }
  if (input.insights.present) {
    evidenceCount += input.insights.items.length;
    sources.push("insights");
  }
  if (input.decisions.present) {
    evidenceCount += input.decisions.items.length;
    sources.push("decisions");
  }
  if (input.recommendations.present) {
    evidenceCount += 1;
    sources.push("recommendations");
  }
  if (input.evidence.present) {
    evidenceCount += 1;
    for (const source of input.evidence.sources) {
      if (!sources.includes(source)) sources.push(source);
    }
  }

  const sourceCount = sources.length;
  const raw = evidenceCount * 0.1 + sourceCount * 0.08;
  const score = Math.max(0, Math.min(1, Math.round(raw * 100) / 100));

  let level: WeeklyConfidenceLevel = WeeklyConfidenceLevels.NONE;
  if (evidenceCount === 0) {
    level = WeeklyConfidenceLevels.NONE;
  } else if (score < 0.4) {
    level = WeeklyConfidenceLevels.LOW;
  } else if (score < 0.75) {
    level = WeeklyConfidenceLevels.MEDIUM;
  } else {
    level = WeeklyConfidenceLevels.HIGH;
  }

  return Object.freeze({
    level,
    score,
    evidenceCount,
    sourceCount,
    rationale: `Deterministic weekly confidence from ${evidenceCount} evidence item(s) across ${sourceCount} source(s).`,
  });
}

import {
  DailyBriefConfidenceLevels,
  type DailyBriefConfidence,
  type DailyBriefConfidenceLevel,
} from "../models/DailyBriefConfidence";
import type { DailyBriefCoachMessage } from "../models/DailyBriefCoachMessage";
import type { DailyBriefGoals } from "../models/DailyBriefGoals";
import type { DailyBriefInsights } from "../models/DailyBriefInsights";
import type { DailyBriefNutrition } from "../models/DailyBriefNutrition";
import type { DailyBriefRecovery } from "../models/DailyBriefRecovery";
import type { DailyBriefWorkout } from "../models/DailyBriefWorkout";

export interface CalculateConfidenceInput {
  readonly workout: DailyBriefWorkout;
  readonly nutrition: DailyBriefNutrition;
  readonly recovery: DailyBriefRecovery;
  readonly goals: DailyBriefGoals;
  readonly insights: DailyBriefInsights;
  readonly coachMessage: DailyBriefCoachMessage;
}

/**
 * Deterministic confidence from available evidence only.
 * Never generated. Never inferred by an LLM.
 *
 * evidenceCount: present sections + insight items
 * sourceCount: distinct domain sources with evidence
 * score: clamp(evidenceCount * 0.12 + sourceCount * 0.1, 0, 1)
 * level: none=0 evidence, low<0.4, medium<0.75, high>=0.75
 */
export function calculateConfidence(
  input: CalculateConfidenceInput,
): DailyBriefConfidence {
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
  if (input.coachMessage.present) {
    evidenceCount += 1;
    sources.push("coach");
  }

  const sourceCount = sources.length;
  const raw = evidenceCount * 0.12 + sourceCount * 0.1;
  const score = Math.max(0, Math.min(1, Math.round(raw * 100) / 100));

  let level: DailyBriefConfidenceLevel = DailyBriefConfidenceLevels.NONE;
  if (evidenceCount === 0) {
    level = DailyBriefConfidenceLevels.NONE;
  } else if (score < 0.4) {
    level = DailyBriefConfidenceLevels.LOW;
  } else if (score < 0.75) {
    level = DailyBriefConfidenceLevels.MEDIUM;
  } else {
    level = DailyBriefConfidenceLevels.HIGH;
  }

  return Object.freeze({
    level,
    score,
    evidenceCount,
    sourceCount,
    rationale: `Deterministic confidence from ${evidenceCount} evidence item(s) across ${sourceCount} source(s).`,
  });
}

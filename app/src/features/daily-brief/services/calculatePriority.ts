import { CoachInsightSeverities } from "../../proactive-insights/models/CoachInsightSeverity";
import type { DailyBriefGoals } from "../models/DailyBriefGoals";
import type { DailyBriefInsights } from "../models/DailyBriefInsights";
import {
  DailyBriefPriorities,
  type DailyBriefPriority,
} from "../models/DailyBriefPriority";
import type { DailyBriefRecovery } from "../models/DailyBriefRecovery";

export interface CalculatePriorityInput {
  readonly insights: DailyBriefInsights;
  readonly recovery: DailyBriefRecovery;
  readonly goals: DailyBriefGoals;
  readonly hasWorkout?: boolean;
  readonly hasNutrition?: boolean;
  readonly hasCoachMessage?: boolean;
}

/**
 * Deterministic Daily Brief priority from composed evidence only.
 * CRITICAL > HIGH > NORMAL > LOW.
 */
export function calculatePriority(
  input: CalculatePriorityInput,
): DailyBriefPriority {
  const hasCriticalInsight = input.insights.items.some(
    (i) => i.severity === CoachInsightSeverities.CRITICAL,
  );
  if (hasCriticalInsight || input.insights.criticalCount > 0) {
    return DailyBriefPriorities.CRITICAL;
  }

  const recoveryCritical =
    input.recovery.present &&
    (input.recovery.status === "critical" ||
      input.recovery.status === "poor" ||
      (input.recovery.fatigueScore !== null &&
        input.recovery.fatigueScore >= 0.85));
  if (recoveryCritical) {
    return DailyBriefPriorities.CRITICAL;
  }

  const hasHighInsight = input.insights.items.some(
    (i) => i.severity === CoachInsightSeverities.HIGH,
  );
  const recoveryElevated =
    input.recovery.present &&
    (input.recovery.status === "elevated" ||
      input.recovery.status === "moderate" ||
      (input.recovery.fatigueScore !== null &&
        input.recovery.fatigueScore >= 0.65));
  const goalHigh =
    input.goals.present &&
    (input.goals.severity === "high" || input.goals.severity === "critical");

  if (hasHighInsight || recoveryElevated || goalHigh) {
    return DailyBriefPriorities.HIGH;
  }

  const anyPresent =
    input.insights.present ||
    input.recovery.present ||
    input.goals.present ||
    input.hasWorkout === true ||
    input.hasNutrition === true ||
    input.hasCoachMessage === true;

  if (anyPresent) {
    return DailyBriefPriorities.NORMAL;
  }

  return DailyBriefPriorities.LOW;
}

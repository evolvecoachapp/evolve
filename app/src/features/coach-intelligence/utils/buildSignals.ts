import type { CoachInsight } from "../models/CoachInsight";
import type { ProgressStatus } from "../models/ProgressStatus";
import type { RiskFlag } from "../models/RiskFlag";
import type { TrainingTrend } from "../models/TrainingTrend";

export interface BuildProgressStatusInput {
  readonly recentPRCount: number;
  readonly plateauExerciseCount: number;
  readonly volumeTrend: TrainingTrend;
}

/** Derive a structured progress band from PR / plateau / volume signals. */
export function buildProgressStatus(
  input: BuildProgressStatusInput,
): ProgressStatus {
  const { recentPRCount, plateauExerciseCount, volumeTrend } = input;

  let level: ProgressStatus["level"];
  if (
    volumeTrend.direction === "insufficient_data" &&
    recentPRCount === 0 &&
    plateauExerciseCount === 0
  ) {
    level = "unknown";
  } else if (recentPRCount > 0 && volumeTrend.direction !== "decreasing") {
    level = "improving";
  } else if (plateauExerciseCount > 0 && recentPRCount === 0) {
    level = "stagnating";
  } else if (volumeTrend.direction === "decreasing" && recentPRCount === 0) {
    level = "regressing";
  } else {
    level = "maintaining";
  }

  return Object.freeze({
    level,
    recentPRCount,
    plateauExerciseCount,
  });
}

/** Convert plateau insights into an exercise-stagnation risk flag when present. */
export function buildStagnationRisk(
  plateauInsights: readonly CoachInsight[],
): RiskFlag | null {
  if (plateauInsights.length === 0) {
    return null;
  }

  return Object.freeze({
    code: "exercise_stagnation" as const,
    severity:
      plateauInsights.length >= 3
        ? ("high" as const)
        : plateauInsights.length === 2
          ? ("medium" as const)
          : ("low" as const),
    evidence: Object.freeze({
      plateauExerciseCount: plateauInsights.length,
    }),
  });
}

/** Convert an inactivity insight into a long_inactivity risk flag. */
export function buildInactivityRisk(
  inactivity: CoachInsight | null,
): RiskFlag | null {
  if (inactivity == null) {
    return null;
  }

  const days = inactivity.payload.daysSinceLastSession;
  const daysValue = typeof days === "number" ? days : null;
  const severity =
    daysValue == null
      ? ("medium" as const)
      : daysValue >= 21
        ? ("high" as const)
        : daysValue >= 14
          ? ("medium" as const)
          : ("low" as const);

  return Object.freeze({
    code: "long_inactivity" as const,
    severity,
    evidence: Object.freeze({
      daysSinceLastSession: daysValue,
      hasHistory: inactivity.payload.hasHistory === true,
    }),
  });
}

/** High weekly frequency risk when recent average sessions/week is high. */
export function buildHighFrequencyRisk(
  frequencyTrend: TrainingTrend,
  recentWeeklyAverage: number,
): RiskFlag | null {
  if (
    frequencyTrend.direction === "insufficient_data" ||
    recentWeeklyAverage < 6
  ) {
    return null;
  }

  return Object.freeze({
    code: "high_frequency" as const,
    severity: recentWeeklyAverage >= 8 ? ("high" as const) : ("medium" as const),
    evidence: Object.freeze({
      recentWeeklyAverage,
      direction: frequencyTrend.direction,
    }),
  });
}

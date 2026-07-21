import type { CompletedWorkout } from "../../workout/models/CompletedWorkout";
import type { WorkoutTrend } from "../../analytics/models/WorkoutTrend";
import type { RecoveryStatus } from "../models/RecoveryStatus";
import type { RiskFlag } from "../models/RiskFlag";
import { clamp, daysBetween, roundToTwo } from "./math";

export interface DetectRecoveryRiskOptions {
  readonly referenceDate: Date;
  /** Lookback days for recent volume / frequency. Default 7. */
  readonly recentDays?: number;
}

export interface RecoveryRiskResult {
  readonly recovery: RecoveryStatus;
  readonly risk: RiskFlag | null;
  readonly insightKind: "recovery_risk" | "fatigue" | null;
}

/**
 * Estimate recovery / fatigue from recent volume vs baseline and rest gaps.
 */
export function detectRecoveryRisk(
  sessions: readonly CompletedWorkout[],
  volumeTrend: WorkoutTrend,
  options: DetectRecoveryRiskOptions,
): RecoveryRiskResult {
  const recentDays = options.recentDays ?? 7;

  if (sessions.length === 0) {
    return Object.freeze({
      recovery: Object.freeze({
        level: "unknown" as const,
        daysSinceLastSession: null,
        fatigueScore: null,
      }),
      risk: null,
      insightKind: null,
    });
  }

  let latest = sessions[0]!.completedAt;
  for (const session of sessions) {
    if (Date.parse(session.completedAt) > Date.parse(latest)) {
      latest = session.completedAt;
    }
  }
  const daysSinceLastSession = daysBetween(latest, options.referenceDate);

  const points = volumeTrend.points;
  const recentPoints = points.slice(-2);
  const baselinePoints = points.slice(0, Math.max(0, points.length - 2));
  const recentAvg =
    recentPoints.length === 0
      ? 0
      : recentPoints.reduce((acc, point) => acc + point.value, 0) /
        recentPoints.length;
  const baselineAvg =
    baselinePoints.length === 0
      ? recentAvg
      : baselinePoints.reduce((acc, point) => acc + point.value, 0) /
        baselinePoints.length;

  const volumeRatio =
    baselineAvg <= 0 ? (recentAvg > 0 ? 1.5 : 0) : recentAvg / baselineAvg;

  const recentSessionCount = sessions.filter(
    (session) =>
      daysBetween(session.completedAt, options.referenceDate) <= recentDays,
  ).length;

  // Higher volume ratio + denser recent sessions → higher fatigue.
  // Rest days pull fatigue down.
  const density = clamp(recentSessionCount / 5, 0, 1);
  const loadPressure = clamp((volumeRatio - 0.8) / 1.2, 0, 1);
  const restRelief = clamp(daysSinceLastSession / 4, 0, 1);
  const fatigueScore = roundToTwo(
    clamp(0.55 * loadPressure + 0.35 * density - 0.25 * restRelief, 0, 1),
  );

  let level: RecoveryStatus["level"];
  if (daysSinceLastSession >= 5) {
    level = "recovered";
  } else if (fatigueScore < 0.35) {
    level = "moderate";
  } else if (fatigueScore < 0.65) {
    level = "elevated";
  } else {
    level = "high";
  }

  const recovery: RecoveryStatus = Object.freeze({
    level,
    daysSinceLastSession,
    fatigueScore,
  });

  if (level === "high" || (level === "elevated" && volumeRatio >= 1.4)) {
    const severity = level === "high" ? "high" : "medium";
    return Object.freeze({
      recovery,
      risk: Object.freeze({
        code: "elevated_fatigue" as const,
        severity: severity as RiskFlag["severity"],
        evidence: Object.freeze({
          fatigueScore,
          volumeRatio: roundToTwo(volumeRatio),
          daysSinceLastSession,
          recentSessionCount,
        }),
      }),
      insightKind: "fatigue" as const,
    });
  }

  if (volumeRatio >= 1.6 && recentAvg > 0) {
    return Object.freeze({
      recovery,
      risk: Object.freeze({
        code: "volume_spike" as const,
        severity: "medium" as const,
        evidence: Object.freeze({
          volumeRatio: roundToTwo(volumeRatio),
          recentAvg: roundToTwo(recentAvg),
          baselineAvg: roundToTwo(baselineAvg),
        }),
      }),
      insightKind: "recovery_risk" as const,
    });
  }

  return Object.freeze({
    recovery,
    risk: null,
    insightKind: null,
  });
}

import type { CompletedWorkout } from "../../workout/models/CompletedWorkout";
import type { CoachInsight } from "../models/CoachInsight";
import { daysBetween } from "./math";

export interface DetectInactivityOptions {
  readonly referenceDate: Date;
  /** Flag inactivity when days since last session exceed this. Default 10. */
  readonly thresholdDays?: number;
}

/**
 * Detect long gaps since the most recent completed session.
 */
export function detectInactivity(
  sessions: readonly CompletedWorkout[],
  options: DetectInactivityOptions,
): CoachInsight | null {
  const thresholdDays = options.thresholdDays ?? 10;
  if (sessions.length === 0) {
    return null;
  }

  let latest = sessions[0]!.completedAt;
  for (const session of sessions) {
    if (Date.parse(session.completedAt) > Date.parse(latest)) {
      latest = session.completedAt;
    }
  }

  const daysSinceLastSession = daysBetween(latest, options.referenceDate);
  if (daysSinceLastSession < thresholdDays) {
    return null;
  }

  const confidence = Math.min(
    1,
    0.5 + daysSinceLastSession / (thresholdDays * 4),
  );

  return Object.freeze({
    id: "insight:inactivity",
    kind: "inactivity" as const,
    confidence: Math.round(confidence * 100) / 100,
    detectedAt: options.referenceDate.toISOString(),
    payload: Object.freeze({
      daysSinceLastSession,
      thresholdDays,
      lastSessionAt: latest,
      hasHistory: true,
    }),
  });
}

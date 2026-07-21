import type { CompletedWorkout } from "../../workout/models/CompletedWorkout";
import type { WeeklyAnalytics } from "../models/WeeklyAnalytics";
import { roundToTwo } from "./round";
import {
  addUtcWeeks,
  enumerateWeekKeys,
  startOfUtcWeek,
  toUtcDateString,
  weekKeyFromIso,
} from "./weekBounds";

function volumeByWeek(
  sessions: readonly CompletedWorkout[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const session of sessions) {
    const key = weekKeyFromIso(session.completedAt);
    map.set(key, (map.get(key) ?? 0) + session.estimatedVolumeKg);
  }
  return map;
}

function sessionsByWeek(
  sessions: readonly CompletedWorkout[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const session of sessions) {
    const key = weekKeyFromIso(session.completedAt);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

/**
 * Current / previous week volume and average sessions-per-week rate.
 *
 * @param referenceDate - Anchor for "current" week (defaults to now in callers).
 */
export function computeWeeklyAnalytics(
  sessions: readonly CompletedWorkout[],
  referenceDate: Date,
): WeeklyAnalytics {
  const currentMonday = startOfUtcWeek(referenceDate);
  const previousMonday = addUtcWeeks(currentMonday, -1);
  const currentKey = toUtcDateString(currentMonday);
  const previousKey = toUtcDateString(previousMonday);

  const volumes = volumeByWeek(sessions);
  const currentWeekVolumeKg = roundToTwo(volumes.get(currentKey) ?? 0);
  const previousWeekVolumeKg = roundToTwo(volumes.get(previousKey) ?? 0);

  if (sessions.length === 0) {
    return Object.freeze({
      currentWeekVolumeKg,
      previousWeekVolumeKg,
      sessionsPerWeek: 0,
    });
  }

  let earliest = sessions[0]!.completedAt;
  for (const session of sessions) {
    if (session.completedAt < earliest) {
      earliest = session.completedAt;
    }
  }

  const firstMonday = startOfUtcWeek(new Date(earliest));
  const weekKeys = enumerateWeekKeys(firstMonday, currentMonday);
  const weekCount = Math.max(weekKeys.length, 1);
  const counts = sessionsByWeek(sessions);
  let totalSessionsInSpan = 0;
  for (const key of weekKeys) {
    totalSessionsInSpan += counts.get(key) ?? 0;
  }

  return Object.freeze({
    currentWeekVolumeKg,
    previousWeekVolumeKg,
    sessionsPerWeek: roundToTwo(totalSessionsInSpan / weekCount),
  });
}

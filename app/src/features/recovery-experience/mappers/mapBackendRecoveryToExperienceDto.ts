import { toNumberOrNull } from "../../shared/utils/userAdapters";
import type {
  ReadinessLevelDto,
  ReadinessReadDto,
  RecoveryCheckInReadDto,
} from "../../../types/api";
import type { RecoveryDay } from "../models";
import type {
  ReadinessProgressDto,
  RecoveryDashboardDto,
  RecoverySignalDto,
  SleepStateDto,
} from "../services";

/**
 * Maps Recovery API DTOs (`src/types/api.ts`) onto the Recovery Experience
 * read model. Counterpart to Nutrition's `mapBackendNutritionToExperienceDto`
 * — only projects fields the backend actually returns.
 *
 * Backend check-ins carry Likert sleep_quality / soreness / fatigue (1–5).
 * Backend readiness is a computed engine projection (`ReadinessRead`), not a
 * writable score. Experience sleep quality is 0–100; readiness labels use the
 * same closed unions as the rest of Recovery Experience.
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/** Neutral Likert midpoint used only when creating a check-in from sleep hours. */
export const NEUTRAL_LIKERT = 3;

function shiftIsoDate(isoDate: string, deltaDays: number): string {
  const shifted = new Date(`${isoDate}T00:00:00.000Z`).getTime() + deltaDays * ONE_DAY_MS;
  return new Date(shifted).toISOString().slice(0, 10);
}

function buildAvailableDays(base: RecoveryDay): readonly RecoveryDay[] {
  const yesterdayIsoDate = shiftIsoDate(base.isoDate, -1);
  const tomorrowIsoDate = shiftIsoDate(base.isoDate, 1);

  return Object.freeze([
    Object.freeze({
      ...base,
      id: `${yesterdayIsoDate}-minus-1`,
      isoDate: yesterdayIsoDate,
      label: "Yesterday",
      shortLabel: "Yday",
      relativeLabel: "Yesterday",
      isToday: false,
    }),
    Object.freeze({ ...base }),
    Object.freeze({
      ...base,
      id: `${tomorrowIsoDate}-plus-1`,
      isoDate: tomorrowIsoDate,
      label: "Tomorrow",
      shortLabel: "Tom",
      relativeLabel: "Tomorrow",
      isToday: false,
    }),
  ]);
}

function toHours(value: string | number | null | undefined): number {
  return toNumberOrNull(value) ?? 0;
}

function toScore(value: string | number | null | undefined): number {
  const n = toNumberOrNull(value);
  if (n == null) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Projects backend Likert sleep quality (1–5) onto Experience 0–100. */
export function mapLikertSleepQualityToPercent(likert: number): number {
  return Math.max(0, Math.min(100, Math.round(likert * 20)));
}

/**
 * Projects Experience sleep hours onto backend Likert sleep_quality (1–5),
 * mirroring the runtime heuristic `quality ≈ hours * 10` then scaled to 1–5.
 */
export function mapSleepHoursToLikertQuality(hours: number): number {
  const quality100 = Math.max(0, Math.min(100, Math.round(hours * 10)));
  return Math.max(1, Math.min(5, Math.round(quality100 / 20) || 1));
}

function inferSleepLabel(
  hours: number,
  qualityPercent: number,
): SleepStateDto["label"] {
  if (hours >= 8 && qualityPercent >= 80) return "excellent";
  if (hours >= 7 && qualityPercent >= 65) return "good";
  if (hours >= 6) return "fair";
  return "poor";
}

function inferReadinessLabel(score: number): ReadinessProgressDto["label"] {
  if (score >= 80) return "excellent";
  if (score >= 65) return "good";
  if (score >= 50) return "fair";
  return "poor";
}

function mapReadinessLevelToStatus(level: ReadinessLevelDto): string {
  return level;
}

function buildEmptyDashboard(day: RecoveryDay): RecoveryDashboardDto {
  return Object.freeze({
    day,
    availableDays: buildAvailableDays(day),
    headline: "No recovery data yet",
    summary: "Log sleep and check readiness to unlock recovery guidance.",
    todaysGoal: "Build your first consistent recovery baseline.",
    recoveryScore: 0,
    status: "",
    sleep: Object.freeze({
      hours: 0,
      quality: 0,
      label: "fair",
      logged: false,
      destination: "/(app)/recovery/history",
    }),
    readiness: Object.freeze({
      score: 0,
      label: "fair",
      destination: "/(app)/recovery/readiness",
    }),
    signals: Object.freeze([]),
    assessmentAvailable: false,
    historyDestination: "/(app)/recovery/history",
  });
}

/** Maps a check-in onto Experience sleep state. */
export function mapCheckInToSleepState(checkIn: RecoveryCheckInReadDto): SleepStateDto {
  const hours = toHours(checkIn.sleep_hours);
  const quality = mapLikertSleepQualityToPercent(checkIn.sleep_quality);
  return Object.freeze({
    hours,
    quality,
    label: inferSleepLabel(hours, quality),
    logged: hours > 0,
    destination: "/(app)/recovery/history",
  });
}

/** Maps `ReadinessRead` onto Experience readiness progress. */
export function mapReadinessToProgress(readiness: ReadinessReadDto): ReadinessProgressDto {
  const score = toScore(readiness.readiness_score);
  return Object.freeze({
    score,
    label: inferReadinessLabel(score),
    destination: "/(app)/recovery/readiness",
  });
}

function buildSignals(
  checkIn: RecoveryCheckInReadDto | null,
  readiness: ReadinessReadDto | null,
): readonly RecoverySignalDto[] {
  const signals: RecoverySignalDto[] = [];
  if (checkIn) {
    signals.push(
      Object.freeze({
        id: "fatigue",
        summary: `Fatigue ${checkIn.fatigue}/5`,
      }),
      Object.freeze({
        id: "soreness",
        summary: `Soreness ${checkIn.soreness}/5`,
      }),
      Object.freeze({
        id: "sleep",
        summary: `Sleep ${toHours(checkIn.sleep_hours)}h (quality ${checkIn.sleep_quality}/5)`,
      }),
    );
  }
  if (readiness) {
    for (const [index, protocol] of readiness.protocols.entries()) {
      const trimmed = protocol.trim();
      if (trimmed.length === 0) {
        continue;
      }
      signals.push(
        Object.freeze({
          id: `protocol-${index}`,
          summary: trimmed,
        }),
      );
    }
  }
  return Object.freeze(signals);
}

export interface MapBackendRecoveryToDashboardInput {
  readonly day: RecoveryDay;
  readonly checkIn: RecoveryCheckInReadDto | null;
  readonly readiness: ReadinessReadDto | null;
}

/** Assembles the Recovery Experience dashboard from check-in + readiness. */
export function mapBackendRecoveryToExperienceDto(
  input: MapBackendRecoveryToDashboardInput,
): RecoveryDashboardDto {
  const { day, checkIn, readiness } = input;

  if (!checkIn && !readiness) {
    return buildEmptyDashboard(day);
  }

  const sleep = checkIn
    ? mapCheckInToSleepState(checkIn)
    : Object.freeze({
        hours: 0,
        quality: 0,
        label: "fair" as const,
        logged: false,
        destination: "/(app)/recovery/history",
      });

  const readinessProgress = readiness
    ? mapReadinessToProgress(readiness)
    : Object.freeze({
        score: 0,
        label: "fair" as const,
        destination: "/(app)/recovery/readiness",
      });

  const recoveryScore = readiness
    ? toScore(readiness.readiness_score)
    : readinessProgress.score;
  const status = readiness ? mapReadinessLevelToStatus(readiness.readiness_level) : "";
  const summary = readiness
    ? readiness.recommendation_text
    : sleep.logged
      ? `Sleep ${sleep.hours}h (${sleep.label}). Assess readiness for guidance.`
      : "Log sleep and check readiness to unlock recovery guidance.";

  return Object.freeze({
    day,
    availableDays: buildAvailableDays(day),
    headline: readiness || checkIn ? `${recoveryScore}% recovery` : "No recovery data yet",
    summary,
    todaysGoal: sleep.logged
      ? "Protect sleep quality and keep training load manageable today."
      : "Log sleep to establish today's recovery baseline.",
    recoveryScore,
    status,
    sleep,
    readiness: readinessProgress,
    signals: buildSignals(checkIn, readiness),
    assessmentAvailable: checkIn != null,
    historyDestination: "/(app)/recovery/history",
  });
}

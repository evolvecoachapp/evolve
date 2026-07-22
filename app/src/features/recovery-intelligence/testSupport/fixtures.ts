import { buildAthleteHistory } from "../../athlete-history/application";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import {
  createAchievementResultFixture,
  createFullBuildInputs,
  createPerformanceSnapshotFixture,
  createWorkoutResultFixture,
  FIXED_TIMESTAMP as HISTORY_TS,
} from "../../athlete-history/testSupport/fixtures";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { DensityLoad } from "../models/DensityLoad";
import type { FatigueScore } from "../models/FatigueScore";
import type { FrequencyLoad } from "../models/FrequencyLoad";
import type { RecoveryContext } from "../models/RecoveryContext";
import type { RecoveryStatus } from "../models/RecoveryStatus";
import { RecoveryStatusLevels } from "../models/RecoveryStatus";
import type { RecoveryWindow } from "../models/RecoveryWindow";
import type { TrainingLoad } from "../models/TrainingLoad";
import { RecoveryMetricsBuilder } from "../builders/RecoveryMetricsBuilder";
import { formatStatusLabel } from "../utils/formatting";

export const FIXED_TIMESTAMP = "2026-07-23T12:00:00.000Z";

export {
  createAchievementResultFixture,
  createPerformanceSnapshotFixture,
  createWorkoutResultFixture,
  HISTORY_TS,
};

export function createAthleteHistoryFixture(
  overrides: {
    readonly performanceSnapshot?: PerformanceSnapshot;
    readonly workoutResult?: WorkoutResult;
    readonly achievementResult?: AchievementResult;
    readonly builtAt?: string;
    readonly historyId?: string;
  } = {},
): AthleteHistory {
  const inputs = createFullBuildInputs();
  const result = buildAthleteHistory({
    workoutResult: overrides.workoutResult ?? inputs.workoutResult,
    performanceSnapshot:
      overrides.performanceSnapshot ?? inputs.performanceSnapshot,
    achievementResult: overrides.achievementResult ?? inputs.achievementResult,
    builtAt: overrides.builtAt ?? FIXED_TIMESTAMP,
    historyId: overrides.historyId ?? "hist:recovery-fixture",
  });
  return result.history;
}

export function createRecoveryContext(
  overrides: Partial<RecoveryContext> = {},
): RecoveryContext {
  return Object.freeze({
    athleteId: overrides.athleteId ?? null,
    sessionId: overrides.sessionId ?? "session-1",
    runtimeId: overrides.runtimeId ?? "runtime-1",
    dayId: overrides.dayId ?? "day-1",
    weekNumber: overrides.weekNumber ?? 1,
    historyId: overrides.historyId ?? "hist:recovery-fixture",
    performanceSnapshotId: overrides.performanceSnapshotId ?? "perf-1",
    achievementEvaluationId: overrides.achievementEvaluationId ?? null,
    analyzedAt: overrides.analyzedAt ?? FIXED_TIMESTAMP,
    frequencyWindowDays: overrides.frequencyWindowDays ?? 7,
  });
}

export function createTrainingLoadFixture(
  overrides: Partial<TrainingLoad> = {},
): TrainingLoad {
  return Object.freeze({
    sessionLoad: overrides.sessionLoad ?? 1960,
    volumeLoad: overrides.volumeLoad ?? 1960,
    completedSets: overrides.completedSets ?? 4,
    completedRepetitions: overrides.completedRepetitions ?? 26,
    cumulativeTonnage: overrides.cumulativeTonnage ?? 1960,
    averageSessionLoad: overrides.averageSessionLoad ?? 1960,
    relativeLoad: overrides.relativeLoad ?? 1,
    loadScore: overrides.loadScore ?? 39.2,
  });
}

export function createDensityLoadFixture(
  overrides: Partial<DensityLoad> = {},
): DensityLoad {
  return Object.freeze({
    durationMs: overrides.durationMs ?? 45 * 60_000,
    durationMinutes: overrides.durationMinutes ?? 45,
    tonnagePerMinute: overrides.tonnagePerMinute ?? 43.556,
    setsPerMinute: overrides.setsPerMinute ?? 4 / 45,
    repetitionsPerMinute: overrides.repetitionsPerMinute ?? 26 / 45,
    densityScore: overrides.densityScore ?? 87.112,
  });
}

export function createFrequencyLoadFixture(
  overrides: Partial<FrequencyLoad> = {},
): FrequencyLoad {
  return Object.freeze({
    windowDays: overrides.windowDays ?? 7,
    workoutsInWindow: overrides.workoutsInWindow ?? 1,
    performanceEntriesInWindow: overrides.performanceEntriesInWindow ?? 1,
    frequencyScore: overrides.frequencyScore ?? 14.2857,
  });
}

export function createFatigueScoreFixture(
  overrides: Partial<FatigueScore> = {},
): FatigueScore {
  return Object.freeze({
    score: overrides.score ?? 45,
    loadComponent: overrides.loadComponent ?? 39.2,
    densityComponent: overrides.densityComponent ?? 87.112,
    frequencyComponent: overrides.frequencyComponent ?? 14.2857,
  });
}

export function createRecoveryWindowFixture(
  overrides: Partial<RecoveryWindow> = {},
): RecoveryWindow {
  const durationHours = overrides.durationHours ?? 36;
  return Object.freeze({
    startAt: overrides.startAt ?? FIXED_TIMESTAMP,
    endAt: overrides.endAt ?? "2026-07-25T00:00:00.000Z",
    durationHours,
    durationMs: overrides.durationMs ?? durationHours * 3_600_000,
  });
}

export function createRecoveryStatusFixture(
  overrides: Partial<RecoveryStatus> = {},
): RecoveryStatus {
  const level = overrides.level ?? RecoveryStatusLevels.MODERATE;
  return Object.freeze({
    level,
    score: overrides.score === undefined ? 45 : overrides.score,
    label: overrides.label ?? formatStatusLabel(level),
  });
}

export function createRecoveryMetricsFixture() {
  return new RecoveryMetricsBuilder()
    .withTrainingLoad(createTrainingLoadFixture())
    .withFatigue(createFatigueScoreFixture())
    .withDensityLoad(createDensityLoadFixture())
    .withFrequencyLoad(createFrequencyLoadFixture())
    .withRecoveryWindow(createRecoveryWindowFixture())
    .withStatus(createRecoveryStatusFixture())
    .build();
}

export function createFullRecoveryInputs(): {
  readonly athleteHistory: AthleteHistory;
  readonly performanceSnapshot: PerformanceSnapshot;
  readonly workoutResult: WorkoutResult;
  readonly achievementResult: AchievementResult;
} {
  const performanceSnapshot = createPerformanceSnapshotFixture();
  const workoutResult = createWorkoutResultFixture();
  const achievementResult = createAchievementResultFixture();
  const athleteHistory = createAthleteHistoryFixture({
    performanceSnapshot,
    workoutResult,
    achievementResult,
  });

  return Object.freeze({
    athleteHistory,
    performanceSnapshot,
    workoutResult,
    achievementResult,
  });
}

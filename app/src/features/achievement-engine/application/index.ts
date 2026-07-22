import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import type { AchievementEngineResult } from "../models/AchievementEngineResult";
import type { AchievementResult } from "../models/AchievementResult";
import type { AchievementSummary } from "../models/AchievementSummary";
import type { PersonalRecordBaselineProvider } from "../models/PersonalRecordBaseline";
import type { PersonalRecordResult } from "../models/PersonalRecordResult";
import {
  createAchievementEngineService,
  type AchievementEngineService,
} from "../services/AchievementEngineService";

function resolveService(
  service?: AchievementEngineService,
): AchievementEngineService {
  return service ?? createAchievementEngineService();
}

/**
 * Public API — evaluate achievements from a performance snapshot + workout result.
 */
export function evaluateAchievements(
  performanceSnapshot: PerformanceSnapshot,
  workoutResult: WorkoutResult,
  baselineProvider: PersonalRecordBaselineProvider,
  options: {
    readonly evaluatedAt?: string;
    readonly evaluationId?: string;
    readonly service?: AchievementEngineService;
  } = {},
): AchievementEngineResult {
  const { service, ...rest } = options;
  return resolveService(service).evaluateAchievements(
    performanceSnapshot,
    workoutResult,
    baselineProvider,
    rest,
  );
}

/**
 * Public API — detect Personal Records only.
 */
export function detectPersonalRecords(
  performanceSnapshot: PerformanceSnapshot,
  workoutResult: WorkoutResult,
  baselineProvider: PersonalRecordBaselineProvider,
  options: {
    readonly evaluatedAt?: string;
    readonly evaluationId?: string;
    readonly service?: AchievementEngineService;
  } = {},
): PersonalRecordResult {
  const { service, ...rest } = options;
  return resolveService(service).detectPersonalRecords(
    performanceSnapshot,
    workoutResult,
    baselineProvider,
    rest,
  );
}

/**
 * Public API — summarize an achievement evaluation result.
 */
export function summarizeAchievements(
  result: AchievementResult,
  service?: AchievementEngineService,
): AchievementSummary {
  return resolveService(service).summarizeAchievements(result);
}

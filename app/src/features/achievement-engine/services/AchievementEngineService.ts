import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import type { AchievementEngineResult } from "../models/AchievementEngineResult";
import type { AchievementSummary } from "../models/AchievementSummary";
import type { PersonalRecordBaselineProvider } from "../models/PersonalRecordBaseline";
import type { PersonalRecordResult } from "../models/PersonalRecordResult";
import {
  AchievementEngine,
  createAchievementEngine,
} from "../engine/AchievementEngine";
import { summarizeAchievementsList } from "../utils";

/**
 * Service facade over AchievementEngine.
 * Hides engine internals from application consumers.
 */
export class AchievementEngineService {
  constructor(
    private readonly engine: AchievementEngine = createAchievementEngine(),
  ) {}

  evaluateAchievements(
    performanceSnapshot: PerformanceSnapshot,
    workoutResult: WorkoutResult,
    baselineProvider: PersonalRecordBaselineProvider,
    options: {
      readonly evaluatedAt?: string;
      readonly evaluationId?: string;
    } = {},
  ): AchievementEngineResult {
    return this.engine.evaluate({
      performanceSnapshot,
      workoutResult,
      baselineProvider,
      evaluatedAt: options.evaluatedAt,
      evaluationId: options.evaluationId,
    });
  }

  detectPersonalRecords(
    performanceSnapshot: PerformanceSnapshot,
    workoutResult: WorkoutResult,
    baselineProvider: PersonalRecordBaselineProvider,
    options: {
      readonly evaluatedAt?: string;
      readonly evaluationId?: string;
    } = {},
  ): PersonalRecordResult {
    return this.engine.detectPersonalRecords({
      performanceSnapshot,
      workoutResult,
      baselineProvider,
      evaluatedAt: options.evaluatedAt,
      evaluationId: options.evaluationId,
    });
  }

  summarizeAchievements(
    result: AchievementEngineResult["result"],
  ): AchievementSummary {
    return summarizeAchievementsList(
      result.evaluationId,
      result.sessionId,
      result.runtimeId,
      result.achievements,
    );
  }
}

export function createAchievementEngineService(): AchievementEngineService {
  return new AchievementEngineService();
}

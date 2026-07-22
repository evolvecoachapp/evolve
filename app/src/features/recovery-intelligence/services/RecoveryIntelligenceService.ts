import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import type { RecoveryAssessment } from "../models/RecoveryAssessment";
import type { RecoveryContext } from "../models/RecoveryContext";
import type { RecoveryEngineResult } from "../models/RecoveryEngineResult";
import type { RecoveryMetrics } from "../models/RecoveryMetrics";
import type { RecoverySnapshot } from "../models/RecoverySnapshot";
import type { RecoverySummary } from "../models/RecoverySummary";
import {
  createRecoveryIntelligenceEngine,
  RecoveryIntelligenceEngine,
} from "../engine/RecoveryIntelligenceEngine";

/**
 * Service facade over RecoveryIntelligenceEngine.
 * Hides engine internals from application consumers.
 */
export class RecoveryIntelligenceService {
  constructor(
    private readonly engine: RecoveryIntelligenceEngine = createRecoveryIntelligenceEngine(),
  ) {}

  analyzeRecovery(options: {
    readonly athleteHistory: AthleteHistory;
    readonly performanceSnapshot: PerformanceSnapshot;
    readonly workoutResult?: WorkoutResult | null;
    readonly achievementResult?: AchievementResult | null;
    readonly analyzedAt?: string;
    readonly snapshotId?: string;
    readonly frequencyWindowDays?: number;
  }): RecoveryEngineResult {
    return this.engine.analyze(options);
  }

  createRecoverySnapshot(
    parts: {
      readonly metrics: RecoveryMetrics;
      readonly assessment: RecoveryAssessment;
      readonly context: RecoveryContext;
      readonly summary?: RecoverySummary;
    },
    options: {
      readonly snapshotId?: string;
      readonly frozenAt?: string;
    } = {},
  ): RecoverySnapshot {
    return this.engine.createSnapshot(parts, options);
  }

  summarizeRecovery(
    snapshotOrParts:
      | RecoverySnapshot
      | {
          readonly snapshotId: string;
          readonly athleteId: string | null;
          readonly metrics: RecoveryMetrics;
        },
  ): RecoverySummary {
    return this.engine.summarize(snapshotOrParts);
  }
}

export function createRecoveryIntelligenceService(): RecoveryIntelligenceService {
  return new RecoveryIntelligenceService();
}

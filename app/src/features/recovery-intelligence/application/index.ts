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
  createRecoveryIntelligenceService,
  type RecoveryIntelligenceService,
} from "../services/RecoveryIntelligenceService";

function resolveService(
  service?: RecoveryIntelligenceService,
): RecoveryIntelligenceService {
  return service ?? createRecoveryIntelligenceService();
}

/**
 * Public API — analyze recovery from Athlete History + Performance Snapshot.
 */
export function analyzeRecovery(options: {
  readonly athleteHistory: AthleteHistory;
  readonly performanceSnapshot: PerformanceSnapshot;
  readonly workoutResult?: WorkoutResult | null;
  readonly achievementResult?: AchievementResult | null;
  readonly analyzedAt?: string;
  readonly snapshotId?: string;
  readonly frequencyWindowDays?: number;
  readonly service?: RecoveryIntelligenceService;
}): RecoveryEngineResult {
  const { service, ...rest } = options;
  return resolveService(service).analyzeRecovery(rest);
}

/**
 * Public API — create a RecoverySnapshot from analysis parts.
 */
export function createRecoverySnapshot(
  parts: {
    readonly metrics: RecoveryMetrics;
    readonly assessment: RecoveryAssessment;
    readonly context: RecoveryContext;
    readonly summary?: RecoverySummary;
  },
  options: {
    readonly snapshotId?: string;
    readonly frozenAt?: string;
    readonly service?: RecoveryIntelligenceService;
  } = {},
): RecoverySnapshot {
  const { service, ...rest } = options;
  return resolveService(service).createRecoverySnapshot(parts, rest);
}

/**
 * Public API — summarize a recovery snapshot or metrics.
 */
export function summarizeRecovery(
  snapshotOrParts:
    | RecoverySnapshot
    | {
        readonly snapshotId: string;
        readonly athleteId: string | null;
        readonly metrics: RecoveryMetrics;
      },
  service?: RecoveryIntelligenceService,
): RecoverySummary {
  return resolveService(service).summarizeRecovery(snapshotOrParts);
}

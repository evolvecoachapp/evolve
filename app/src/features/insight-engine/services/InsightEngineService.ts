import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { AthleteHistory } from "../../athlete-history/models/AthleteHistory";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { RecoverySnapshot } from "../../recovery-intelligence/models/RecoverySnapshot";
import type { InsightCollection } from "../models/InsightCollection";
import type { InsightContext } from "../models/InsightContext";
import type { InsightEngineResult } from "../models/InsightEngineResult";
import type { InsightSnapshot } from "../models/InsightSnapshot";
import type { InsightSummary } from "../models/InsightSummary";
import {
  createInsightEngine,
  InsightEngine,
} from "../engine/InsightEngine";

/**
 * Service facade over InsightEngine.
 * Hides engine internals from application consumers.
 */
export class InsightEngineService {
  constructor(private readonly engine: InsightEngine = createInsightEngine()) {}

  generateInsights(options: {
    readonly performanceSnapshot: PerformanceSnapshot;
    readonly achievementResult: AchievementResult;
    readonly recoverySnapshot: RecoverySnapshot;
    readonly athleteHistory: AthleteHistory;
    readonly generatedAt?: string;
    readonly snapshotId?: string;
  }): InsightEngineResult {
    return this.engine.generate(options);
  }

  createInsightSnapshot(
    parts: {
      readonly collection: InsightCollection;
      readonly context: InsightContext;
      readonly summary?: InsightSummary;
    },
    options: {
      readonly snapshotId?: string;
      readonly frozenAt?: string;
    } = {},
  ): InsightSnapshot {
    return this.engine.createSnapshot(parts, options);
  }

  summarizeInsights(
    snapshotOrParts:
      | InsightSnapshot
      | {
          readonly snapshotId: string;
          readonly athleteId: string | null;
          readonly collection: InsightCollection;
        },
  ): InsightSummary {
    return this.engine.summarize(snapshotOrParts);
  }
}

export function createInsightEngineService(): InsightEngineService {
  return new InsightEngineService();
}

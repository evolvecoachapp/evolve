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
  createInsightEngineService,
  type InsightEngineService,
} from "../services/InsightEngineService";

function resolveService(
  service?: InsightEngineService,
): InsightEngineService {
  return service ?? createInsightEngineService();
}

/**
 * Public API — generate deterministic insights from upstream domain snapshots.
 */
export function generateInsights(options: {
  readonly performanceSnapshot: PerformanceSnapshot;
  readonly achievementResult: AchievementResult;
  readonly recoverySnapshot: RecoverySnapshot;
  readonly athleteHistory: AthleteHistory;
  readonly generatedAt?: string;
  readonly snapshotId?: string;
  readonly service?: InsightEngineService;
}): InsightEngineResult {
  const { service, ...rest } = options;
  return resolveService(service).generateInsights(rest);
}

/**
 * Public API — create an InsightSnapshot from collection parts.
 */
export function createInsightSnapshot(
  parts: {
    readonly collection: InsightCollection;
    readonly context: InsightContext;
    readonly summary?: InsightSummary;
  },
  options: {
    readonly snapshotId?: string;
    readonly frozenAt?: string;
    readonly service?: InsightEngineService;
  } = {},
): InsightSnapshot {
  const { service, ...rest } = options;
  return resolveService(service).createInsightSnapshot(parts, rest);
}

/**
 * Public API — summarize an insight snapshot or collection.
 */
export function summarizeInsights(
  snapshotOrParts:
    | InsightSnapshot
    | {
        readonly snapshotId: string;
        readonly athleteId: string | null;
        readonly collection: InsightCollection;
      },
  service?: InsightEngineService,
): InsightSummary {
  return resolveService(service).summarizeInsights(snapshotOrParts);
}

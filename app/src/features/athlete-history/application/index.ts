import type { AchievementResult } from "../../achievement-engine/models/AchievementResult";
import type { EventStream } from "../../../core/domain-events/models/EventStream";
import type { PerformanceSnapshot } from "../../performance-engine/models/PerformanceSnapshot";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import type { AthleteHistory } from "../models/AthleteHistory";
import type { HistoryEngineResult } from "../models/HistoryEngineResult";
import type { HistoryEntry } from "../models/HistoryEntry";
import type { HistorySnapshot } from "../models/HistorySnapshot";
import type { HistorySummary } from "../models/HistorySummary";
import {
  createAthleteHistoryService,
  type AthleteHistoryService,
} from "../services/AthleteHistoryService";

function resolveService(
  service?: AthleteHistoryService,
): AthleteHistoryService {
  return service ?? createAthleteHistoryService();
}

/**
 * Public API — build immutable AthleteHistory from domain facts.
 */
export function buildAthleteHistory(
  options: {
    readonly workoutResult?: WorkoutResult | null;
    readonly performanceSnapshot?: PerformanceSnapshot | null;
    readonly achievementResult?: AchievementResult | null;
    readonly eventStream?: EventStream | null;
    readonly athleteId?: string | null;
    readonly historyId?: string;
    readonly snapshotId?: string;
    readonly builtAt?: string;
    readonly service?: AthleteHistoryService;
  } = {},
): HistoryEngineResult {
  const { service, ...rest } = options;
  return resolveService(service).buildAthleteHistory(rest);
}

/**
 * Public API — create a HistorySnapshot from an AthleteHistory.
 */
export function createHistorySnapshot(
  history: AthleteHistory,
  options: {
    readonly snapshotId?: string;
    readonly createdAt?: string;
    readonly service?: AthleteHistoryService;
  } = {},
): HistorySnapshot {
  const { service, ...rest } = options;
  return resolveService(service).createHistorySnapshot(history, rest);
}

/**
 * Public API — summarize athlete history.
 */
export function summarizeHistory(
  historyOrParts:
    | AthleteHistory
    | {
        readonly historyId: string;
        readonly athleteId: string | null;
        readonly entries: readonly HistoryEntry[];
      },
  service?: AthleteHistoryService,
): HistorySummary {
  return resolveService(service).summarizeHistory(historyOrParts);
}

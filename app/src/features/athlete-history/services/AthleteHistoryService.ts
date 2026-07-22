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
  AthleteHistoryEngine,
  createAthleteHistoryEngine,
} from "../engine/AthleteHistoryEngine";

/**
 * Service facade over AthleteHistoryEngine.
 * Hides engine internals from application consumers.
 */
export class AthleteHistoryService {
  constructor(
    private readonly engine: AthleteHistoryEngine = createAthleteHistoryEngine(),
  ) {}

  buildAthleteHistory(options: {
    readonly workoutResult?: WorkoutResult | null;
    readonly performanceSnapshot?: PerformanceSnapshot | null;
    readonly achievementResult?: AchievementResult | null;
    readonly eventStream?: EventStream | null;
    readonly athleteId?: string | null;
    readonly historyId?: string;
    readonly snapshotId?: string;
    readonly builtAt?: string;
  }): HistoryEngineResult {
    return this.engine.build(options);
  }

  createHistorySnapshot(
    history: AthleteHistory,
    options: {
      readonly snapshotId?: string;
      readonly createdAt?: string;
    } = {},
  ): HistorySnapshot {
    return this.engine.createSnapshot(history, options);
  }

  summarizeHistory(
    historyOrParts:
      | AthleteHistory
      | {
          readonly historyId: string;
          readonly athleteId: string | null;
          readonly entries: readonly HistoryEntry[];
        },
  ): HistorySummary {
    if ("entries" in historyOrParts && "id" in historyOrParts) {
      const history = historyOrParts as AthleteHistory;
      return this.engine.summarize(
        history.id,
        history.athleteId,
        history.entries,
      );
    }

    const parts = historyOrParts as {
      readonly historyId: string;
      readonly athleteId: string | null;
      readonly entries: readonly HistoryEntry[];
    };
    return this.engine.summarize(
      parts.historyId,
      parts.athleteId,
      parts.entries,
    );
  }
}

export function createAthleteHistoryService(): AthleteHistoryService {
  return new AthleteHistoryService();
}

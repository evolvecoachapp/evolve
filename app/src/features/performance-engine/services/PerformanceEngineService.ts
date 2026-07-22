import type { DecisionReport } from "../../../core/decision-intelligence/models/DecisionReport";
import type { EventStream } from "../../../core/domain-events/models/EventStream";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import type { PerformanceEngineResult } from "../models/PerformanceEngineResult";
import type { PerformanceGrade } from "../models/PerformanceGrade";
import type { PerformanceSnapshot } from "../models/PerformanceSnapshot";
import type { PerformanceSummary } from "../models/PerformanceSummary";
import {
  createPerformanceEngine,
  PerformanceEngine,
} from "../engine/PerformanceEngine";
import { gradeFromMetrics, summarizeSnapshot } from "../utils";

/**
 * Service facade over PerformanceEngine.
 * Hides engine internals from application consumers.
 */
export class PerformanceEngineService {
  constructor(
    private readonly engine: PerformanceEngine = createPerformanceEngine(),
  ) {}

  analyzeWorkoutPerformance(
    workoutResult: WorkoutResult,
    eventStream: EventStream,
    options: {
      readonly decisionReport?: DecisionReport | null;
      readonly analyzedAt?: string;
      readonly snapshotId?: string;
    } = {},
  ): PerformanceEngineResult {
    return this.engine.analyze({
      workoutResult,
      eventStream,
      decisionReport: options.decisionReport,
      analyzedAt: options.analyzedAt,
      snapshotId: options.snapshotId,
    });
  }

  summarizePerformance(snapshot: PerformanceSnapshot): PerformanceSummary {
    return summarizeSnapshot(snapshot);
  }

  gradePerformance(snapshot: PerformanceSnapshot): PerformanceGrade {
    return gradeFromMetrics(snapshot.metrics, snapshot.session.finalState);
  }
}

export function createPerformanceEngineService(): PerformanceEngineService {
  return new PerformanceEngineService();
}

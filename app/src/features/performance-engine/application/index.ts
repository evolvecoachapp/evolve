import type { DecisionReport } from "../../../core/decision-intelligence/models/DecisionReport";
import type { EventStream } from "../../../core/domain-events/models/EventStream";
import type { WorkoutResult } from "../../workout-runtime/models/WorkoutResult";
import type { PerformanceEngineResult } from "../models/PerformanceEngineResult";
import type { PerformanceGrade } from "../models/PerformanceGrade";
import type { PerformanceSnapshot } from "../models/PerformanceSnapshot";
import type { PerformanceSummary } from "../models/PerformanceSummary";
import {
  createPerformanceEngineService,
  type PerformanceEngineService,
} from "../services/PerformanceEngineService";

function resolveService(
  service?: PerformanceEngineService,
): PerformanceEngineService {
  return service ?? createPerformanceEngineService();
}

/**
 * Public API — analyze completed workout performance (single session).
 */
export function analyzeWorkoutPerformance(
  workoutResult: WorkoutResult,
  eventStream: EventStream,
  options: {
    readonly decisionReport?: DecisionReport | null;
    readonly analyzedAt?: string;
    readonly snapshotId?: string;
    readonly service?: PerformanceEngineService;
  } = {},
): PerformanceEngineResult {
  const { service, ...rest } = options;
  return resolveService(service).analyzeWorkoutPerformance(
    workoutResult,
    eventStream,
    rest,
  );
}

/**
 * Public API — summarize a performance snapshot.
 */
export function summarizePerformance(
  snapshot: PerformanceSnapshot,
  service?: PerformanceEngineService,
): PerformanceSummary {
  return resolveService(service).summarizePerformance(snapshot);
}

/**
 * Public API — grade a performance snapshot (single-session heuristic).
 */
export function gradePerformance(
  snapshot: PerformanceSnapshot,
  service?: PerformanceEngineService,
): PerformanceGrade {
  return resolveService(service).gradePerformance(snapshot);
}

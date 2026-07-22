import type { ExercisePerformance } from "./ExercisePerformance";
import type { MovementPerformance } from "./MovementPerformance";
import type { PerformanceContext } from "./PerformanceContext";
import type { PerformanceGrade } from "./PerformanceGrade";
import type { PerformanceMetrics } from "./PerformanceMetrics";
import type { PerformanceSummary } from "./PerformanceSummary";
import type { PerformanceTrend } from "./PerformanceTrend";
import type { SessionPerformance } from "./SessionPerformance";

/**
 * Immutable single-session performance snapshot.
 * Never mutates workout execution or program generation.
 */
export interface PerformanceSnapshot {
  readonly id: string;
  readonly context: PerformanceContext;
  readonly session: SessionPerformance;
  readonly metrics: PerformanceMetrics;
  readonly exercises: readonly ExercisePerformance[];
  readonly movements: readonly MovementPerformance[];
  readonly grade: PerformanceGrade;
  readonly summary: PerformanceSummary;
  readonly trend: PerformanceTrend;
  readonly frozenAt: string;
}

import type { PerformanceGrade } from "./PerformanceGrade";
import type { PerformanceMetrics } from "./PerformanceMetrics";

/**
 * Session-level performance summary embedded in a snapshot.
 */
export interface SessionPerformance {
  readonly sessionId: string;
  readonly runtimeId: string;
  readonly finalState: "Completed" | "Cancelled";
  readonly grade: PerformanceGrade;
  readonly metrics: PerformanceMetrics;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly durationMs: number;
}

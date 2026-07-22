import type { PerformanceSnapshot } from "./PerformanceSnapshot";
import type { PerformanceSummary } from "./PerformanceSummary";

/**
 * Public result of a Performance Engine analysis.
 */
export interface PerformanceEngineResult {
  readonly snapshot: PerformanceSnapshot;
  readonly summary: PerformanceSummary;
  readonly validationIssues: readonly string[];
}

import type { CoachInsight } from "../../coach-intelligence/models/CoachInsight";
import type { ProgressStatus } from "../../coach-intelligence/models/ProgressStatus";

/**
 * Performance signals (progress, PRs, plateaus) for the prompt context.
 *
 * Structured evidence only — never natural language.
 */
export interface PerformanceContext {
  readonly progress: ProgressStatus;
  readonly personalRecordInsights: readonly CoachInsight[];
  readonly plateauInsights: readonly CoachInsight[];
}

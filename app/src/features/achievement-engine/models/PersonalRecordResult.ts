import type { PersonalRecord } from "./PersonalRecord";

/**
 * Result of Personal Record detection for one evaluation.
 */
export interface PersonalRecordResult {
  readonly personalRecords: readonly PersonalRecord[];
  readonly detectedCount: number;
  readonly validationIssues: readonly string[];
}

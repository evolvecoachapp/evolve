import type { GoalMetadata } from "./GoalMetadata";

export const GoalConfidenceCodes = {
  SIGNAL_PRESENT: "signal_present",
  TRIGGER_FIRED: "trigger_fired",
  CONDITION_MET: "condition_met",
  PRIORITY_ORDERING: "priority_ordering",
  SEVERITY_LEVEL: "severity_level",
  DEPENDENCY_REQUIRED: "dependency_required",
  CONSTRAINT_APPLIED: "constraint_applied",
  CONSISTENCY_CHECK: "consistency_check",
  HISTORY_REFERENCE: "history_reference",
  WINDOW_MATCH: "window_match",
} as const;

export type GoalConfidenceCode =
  (typeof GoalConfidenceCodes)[keyof typeof GoalConfidenceCodes];

export interface GoalConfidence {
  readonly id: string;
  readonly code: GoalConfidenceCode;
  readonly subjectId: string;
  readonly category: string;
  readonly statementKey: string;
  readonly signalKeys: readonly string[];
  readonly metadata: GoalMetadata;
}

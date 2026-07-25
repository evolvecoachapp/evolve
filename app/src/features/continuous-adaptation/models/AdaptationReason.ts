import type { AdaptationMetadata } from "./AdaptationMetadata";

export const AdaptationReasonCodes = {
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

export type AdaptationReasonCode =
  (typeof AdaptationReasonCodes)[keyof typeof AdaptationReasonCodes];

export interface AdaptationReason {
  readonly id: string;
  readonly code: AdaptationReasonCode;
  readonly subjectId: string;
  readonly category: string;
  readonly statementKey: string;
  readonly signalKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
}

import type { DecisionCategory } from "./DecisionCategory";
  import type { DecisionIntent } from "./DecisionIntent";
  import type { DecisionMetadata } from "./DecisionMetadata";

export const DecisionStepStatuses = {
  PLANNED: "planned",
  READY: "ready",
  BLOCKED: "blocked",
  COMPLETE: "complete",
  SKIPPED: "skipped",
} as const;

export type DecisionStepStatus =
  (typeof DecisionStepStatuses)[keyof typeof DecisionStepStatuses];

/**
 * Immutable plan step — planning only, never executed here.
 */
export interface DecisionStep {
  readonly id: string;
  readonly decisionId: string;
  readonly order: number;
  readonly category: DecisionCategory;
  readonly intent: DecisionIntent;
  readonly status: DecisionStepStatus;
  readonly dependsOn: readonly string[];
  readonly metadata: DecisionMetadata;
}

import type { ContextMetadata } from "./ContextMetadata";
import type { ContextResolution } from "./ContextResolution";
import type { ContextSourceKind } from "./ContextSource";

export const ContextMergeStrategies = {
  PRIORITY_OVERLAY: "priority_overlay",
  UNION: "union",
  REPLACE: "replace",
} as const;

export type ContextMergeStrategy =
  (typeof ContextMergeStrategies)[keyof typeof ContextMergeStrategies];

/**
 * Immutable merge record for a fusion operation.
 */
export interface ContextMerge {
  readonly id: string;
  readonly strategy: ContextMergeStrategy;
  readonly sourceKinds: readonly ContextSourceKind[];
  readonly resolutions: readonly ContextResolution[];
  readonly notes: readonly string[];
  readonly metadata: ContextMetadata;
  readonly mergedAt: string;
}

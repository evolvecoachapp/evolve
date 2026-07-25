import type { ContextSourceKind } from "./ContextSource";

export const ContextResolutionStrategies = {
  PRIORITY: "priority",
  FIRST: "first",
  LAST: "last",
  KEEP_EXISTING: "keep_existing",
  EXPLICIT: "explicit",
} as const;

export type ContextResolutionStrategy =
  (typeof ContextResolutionStrategies)[keyof typeof ContextResolutionStrategies];

/**
 * Immutable deterministic resolution of a conflict.
 */
export interface ContextResolution {
  readonly id: string;
  readonly conflictId: string;
  readonly strategy: ContextResolutionStrategy;
  readonly winnerSource: ContextSourceKind;
  readonly winnerValue: string | null;
  readonly reason: string;
}

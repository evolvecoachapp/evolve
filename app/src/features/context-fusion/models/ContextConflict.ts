import type { ContextSourceKind } from "./ContextSource";

export const ContextConflictKinds = {
  FIELD: "field",
  VERSION: "version",
  DEPENDENCY: "dependency",
  SOURCE: "source",
} as const;

export type ContextConflictKind =
  (typeof ContextConflictKinds)[keyof typeof ContextConflictKinds];

/**
 * Immutable detected conflict between sources (representation only).
 */
export interface ContextConflict {
  readonly id: string;
  readonly kind: ContextConflictKind;
  readonly path: string;
  readonly sources: readonly ContextSourceKind[];
  readonly values: readonly string[];
  readonly notes: readonly string[];
}

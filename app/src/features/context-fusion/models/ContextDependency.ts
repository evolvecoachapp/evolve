import type { ContextSourceKind } from "./ContextSource";

export const ContextDependencyKinds = {
  REQUIRES: "requires",
  INFORMS: "informs",
  OVERRIDES: "overrides",
} as const;

export type ContextDependencyKind =
  (typeof ContextDependencyKinds)[keyof typeof ContextDependencyKinds];

/**
 * Immutable dependency edge between context sources/sections.
 */
export interface ContextDependency {
  readonly id: string;
  readonly kind: ContextDependencyKind;
  readonly from: ContextSourceKind;
  readonly to: ContextSourceKind;
  readonly path: string | null;
  readonly notes: readonly string[];
}

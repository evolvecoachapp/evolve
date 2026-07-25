import type { ContextMetadata } from "./ContextMetadata";
import type { ContextSourceKind } from "./ContextSource";

export const ContextSectionKinds = {
  CONVERSATION: "conversation",
  SESSION: "session",
  ATHLETE: "athlete",
  WORKOUT: "workout",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
  GOAL: "goal",
  SUPERVISOR: "supervisor",
  MERGE: "merge",
  CUSTOM: "custom",
} as const;

export type ContextSectionKind =
  (typeof ContextSectionKinds)[keyof typeof ContextSectionKinds];

/**
 * Immutable fused section carrying opaque facts from a source.
 */
export interface ContextSection {
  readonly id: string;
  readonly kind: ContextSectionKind;
  readonly sourceKind: ContextSourceKind;
  readonly sourceId: string;
  readonly title: string;
  readonly facts: Readonly<Record<string, string | number | boolean | null>>;
  readonly notes: readonly string[];
  readonly metadata: ContextMetadata;
}

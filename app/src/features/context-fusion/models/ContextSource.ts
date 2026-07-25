import type { ContextMetadata } from "./ContextMetadata";
import type { ContextVersion } from "./ContextVersion";

export const ContextSourceKinds = {
  CONVERSATION: "conversation",
  SESSION: "session",
  ATHLETE: "athlete",
  WORKOUT: "workout",
  NUTRITION: "nutrition",
  RECOVERY: "recovery",
  GOAL: "goal",
  SUPERVISOR: "supervisor",
} as const;

export type ContextSourceKind =
  (typeof ContextSourceKinds)[keyof typeof ContextSourceKinds];

/**
 * Immutable description of a single upstream context source.
 */
export interface ContextSource {
  readonly id: string;
  readonly kind: ContextSourceKind;
  readonly label: string;
  readonly referenceId: string | null;
  readonly version: ContextVersion | null;
  readonly available: boolean;
  readonly notes: readonly string[];
  readonly metadata: ContextMetadata;
  readonly contributedAt: string;
}

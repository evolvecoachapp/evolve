import type { ContextSourceKind } from "./ContextSource";

/**
 * Immutable reference to an upstream entity.
 */
export interface ContextReference {
  readonly id: string;
  readonly kind: ContextSourceKind;
  readonly targetId: string;
  readonly label: string | null;
}

import type { ContextMetadata } from "./ContextMetadata";
import type { ContextSourceKind } from "./ContextSource";

/**
 * Opaque immutable slice from an upstream runtime/agent.
 * Fusion stores facts only — no domain interpretation.
 */
export interface ContextSlice {
  readonly id: string;
  readonly sourceKind: ContextSourceKind;
  readonly referenceId: string | null;
  readonly label: string;
  readonly facts: Readonly<Record<string, string | number | boolean | null>>;
  readonly notes: readonly string[];
  readonly metadata: ContextMetadata;
  readonly contributedAt: string;
}

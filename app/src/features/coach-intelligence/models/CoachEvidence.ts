import type { CoachPriority } from "./CoachPriority";

/**
 * Immutable evidence attribution for coaching context.
 * Source facts only — not AI-generated narrative.
 */
export interface CoachEvidence {
  readonly id: string;
  readonly sourceType: string;
  readonly sourceId: string;
  readonly statement: string;
  readonly priority: CoachPriority;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}

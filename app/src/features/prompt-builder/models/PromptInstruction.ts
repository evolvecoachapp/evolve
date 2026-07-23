import type { PromptMetadata } from "./PromptMetadata";
import type { PromptPriority } from "./PromptPriority";

/**
 * Structured composition instruction fact.
 */
export interface PromptInstruction {
  readonly id: string;
  readonly code: string;
  readonly statement: string;
  readonly priority: PromptPriority;
  readonly sourceRefs: readonly string[];
  readonly metadata: PromptMetadata;
}

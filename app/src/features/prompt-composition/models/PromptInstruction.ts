import type { PromptMetadata } from "./PromptMetadata";
import type { PromptPriority } from "./PromptPriority";

/**
 * Structured composition instruction fact.
 * Not a provider-ready prompt string.
 */
export interface PromptInstruction {
  readonly id: string;
  readonly code: string;
  readonly statement: string;
  readonly priority: PromptPriority;
  readonly sourceRefs: readonly string[];
  readonly metadata: PromptMetadata;
}

import type { PromptPackage } from "./PromptPackage";
import type { PromptSummary } from "./PromptSummary";

/**
 * Immutable prompt package snapshot — frozen composition artifact.
 * No persistence. No provider calls. Structured blocks only.
 */
export interface PromptSnapshot {
  readonly id: string;
  readonly promptPackage: PromptPackage;
  readonly summary: PromptSummary;
  readonly frozenAt: string;
}

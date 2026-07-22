import type { PromptPackage } from "./PromptPackage";
import type { PromptSnapshot } from "./PromptSnapshot";
import type { PromptSummary } from "./PromptSummary";

/**
 * Frozen Prompt Composition Engine result.
 */
export interface PromptEngineResult {
  readonly snapshot: PromptSnapshot;
  readonly promptPackage: PromptPackage;
  readonly summary: PromptSummary;
  readonly validationIssues: readonly string[];
}

import type { PromptComposition } from "./PromptComposition";
import type { PromptContextSelection } from "./PromptContextSelection";
import type { PromptIntent } from "./PromptIntent";

/**
 * Complete result of one orchestration pass.
 */
export interface PromptOrchestrationResult {
  readonly intent: PromptIntent;
  readonly selection: PromptContextSelection;
  /** Frozen final composition — safe to share across layers. */
  readonly composition: PromptComposition;
}

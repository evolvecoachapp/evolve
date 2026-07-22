import type { PromptBudget } from "./PromptBudget";
import type { PromptIntent } from "./PromptIntent";
import type { PromptPriority } from "./PromptPriority";
import type { PromptContextKind } from "./PromptContextKind";

/**
 * Configurable orchestration policy aggregate.
 *
 * Pure configuration — no I/O, no AI, no templates.
 */
export interface PromptPolicy {
  readonly selection: Readonly<Record<PromptIntent, readonly PromptContextKind[]>>;
  readonly priority: PromptPriority;
  readonly budget: PromptBudget;
}

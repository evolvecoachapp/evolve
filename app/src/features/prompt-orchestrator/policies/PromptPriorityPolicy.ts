import type { PromptContextKind } from "../models/PromptContextKind";
import type { PromptPriority } from "../models/PromptPriority";
import { createDefaultPromptPolicy } from "../utils/createDefaultPromptPolicy";

/**
 * Pure priority rules — lower rank is trimmed first under budget pressure.
 */
export class PromptPriorityPolicy {
  private readonly priority: PromptPriority;

  constructor(
    priority: PromptPriority = createDefaultPromptPolicy().priority,
  ) {
    this.priority = Object.freeze({
      ranks: Object.freeze({ ...priority.ranks }),
    });
  }

  rankOf(kind: PromptContextKind): number {
    return this.priority.ranks[kind];
  }

  /** Ascending rank order — lowest priority first. */
  ascending(kinds: readonly PromptContextKind[]): readonly PromptContextKind[] {
    return Object.freeze(
      [...kinds].sort((a, b) => this.rankOf(a) - this.rankOf(b)),
    );
  }

  /** Descending rank order — highest priority first. */
  descending(kinds: readonly PromptContextKind[]): readonly PromptContextKind[] {
    return Object.freeze(
      [...kinds].sort((a, b) => this.rankOf(b) - this.rankOf(a)),
    );
  }

  toPriority(): PromptPriority {
    return this.priority;
  }
}

import type { PromptContextKind } from "./PromptContextKind";

/**
 * Priority ranks for context kinds.
 *
 * Higher rank is kept longer when trimming. Low priority is removed first.
 */
export interface PromptPriority {
  /** Rank per context kind — higher means more important. */
  readonly ranks: Readonly<Record<PromptContextKind, number>>;
}

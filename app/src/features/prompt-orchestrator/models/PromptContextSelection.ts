import type { PromptContextKind } from "./PromptContextKind";

/**
 * Intent-driven selection of which context domains to include.
 */
export interface PromptContextSelection {
  readonly kinds: readonly PromptContextKind[];
  readonly includeConversation: boolean;
  readonly includeAthlete: boolean;
  readonly includeMemory: boolean;
  readonly includeWorkout: boolean;
  readonly includeCoach: boolean;
}

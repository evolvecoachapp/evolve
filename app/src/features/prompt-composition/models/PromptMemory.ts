/**
 * Structured memory references for composition.
 * Placeholder-capable — may be empty without redesign.
 */
export interface PromptMemory {
  readonly id: string;
  readonly conversationContextId: string;
  readonly memoryRefs: readonly string[];
  readonly historyReferenced: boolean;
  readonly statement: string;
}

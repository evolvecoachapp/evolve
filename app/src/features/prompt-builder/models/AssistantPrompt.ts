import type { PromptMetadata } from "./PromptMetadata";

/**
 * Placeholder assistant-role structure only — never generated replies.
 */
export interface AssistantPrompt {
  readonly id: string;
  readonly role: "assistant";
  readonly statements: readonly string[];
  readonly blockIds: readonly string[];
  readonly metadata: PromptMetadata;
  readonly frozenAt: string;
}

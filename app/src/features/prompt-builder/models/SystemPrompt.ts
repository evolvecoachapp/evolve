import type { PromptMetadata } from "./PromptMetadata";

/**
 * Aggregated system-role prompt facts (domain composition, not provider syntax).
 */
export interface SystemPrompt {
  readonly id: string;
  readonly role: "system";
  readonly statements: readonly string[];
  readonly blockIds: readonly string[];
  readonly metadata: PromptMetadata;
  readonly frozenAt: string;
}

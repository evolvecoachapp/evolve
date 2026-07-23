import type { PromptMetadata } from "./PromptMetadata";

/**
 * Aggregated user-role prompt facts (domain composition, not provider syntax).
 */
export interface UserPrompt {
  readonly id: string;
  readonly role: "user";
  readonly statements: readonly string[];
  readonly blockIds: readonly string[];
  readonly requestId: string | null;
  readonly metadata: PromptMetadata;
  readonly frozenAt: string;
}

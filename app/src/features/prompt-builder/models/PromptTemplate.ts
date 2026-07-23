import type { PromptBlockType } from "./PromptBlockType";
import type { PromptMetadata } from "./PromptMetadata";
import type { PromptSection } from "./PromptSection";

/**
 * Reusable domain prompt template — no provider-specific syntax.
 */
export interface PromptTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly section: PromptSection;
  readonly blockTypes: readonly PromptBlockType[];
  readonly statementPattern: string;
  readonly metadata: PromptMetadata;
}

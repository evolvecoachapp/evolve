import type { PromptBlockType } from "./PromptBlockType";
import type { PromptMetadata } from "./PromptMetadata";
import type { PromptPriority } from "./PromptPriority";
import type { PromptSection } from "./PromptSection";

/**
 * Immutable structured prompt block.
 *
 * Composition fact for Future Provider Abstraction — not a rendered
 * provider-specific prompt string.
 */
export interface PromptBlock {
  readonly id: string;
  readonly type: PromptBlockType;
  readonly section: PromptSection;
  readonly priority: PromptPriority;
  readonly order: number;
  readonly title: string;
  readonly statement: string;
  readonly refs: readonly string[];
  readonly metadata: PromptMetadata;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}

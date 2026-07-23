import type { PromptBlock } from "../models/PromptBlock";
import type { PromptTemplate } from "../models/PromptTemplate";

/**
 * Select domain templates matching present block types.
 */
export function selectTemplatesForBlocks(
  blocks: readonly PromptBlock[],
  templates: readonly PromptTemplate[],
): readonly PromptTemplate[] {
  const types = new Set(blocks.map((b) => b.type));
  return Object.freeze(
    templates.filter((template) =>
      template.blockTypes.some((type) => types.has(type)),
    ),
  );
}

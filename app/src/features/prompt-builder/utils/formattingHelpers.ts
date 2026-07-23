import type { PromptBlock } from "../models/PromptBlock";
import type { PromptSection } from "../models/PromptSection";
import { DEFAULT_SECTION_ORDER } from "../models/PromptSection";
import { normalizeWhitespace } from "./normalizeWhitespace";

/**
 * Format a block statement for composition (normalize whitespace only).
 */
export function formatBlockStatement(statement: string): string {
  return normalizeWhitespace(statement);
}

/**
 * Aggregate unique sections from blocks in default section order.
 */
export function aggregateSections(
  blocks: readonly PromptBlock[],
): readonly PromptSection[] {
  const present = new Set(blocks.map((block) => block.section));
  return Object.freeze(
    [...present].sort(
      (a, b) =>
        (DEFAULT_SECTION_ORDER[a] ?? 999) - (DEFAULT_SECTION_ORDER[b] ?? 999),
    ),
  );
}

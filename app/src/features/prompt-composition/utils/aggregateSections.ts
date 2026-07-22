import type { PromptBlock } from "../models/PromptBlock";
import type { PromptSection } from "../models/PromptSection";
import { DEFAULT_SECTION_ORDER } from "../models/PromptSection";

/**
 * Aggregate unique sections from blocks in canonical order.
 */
export function aggregateSections(
  blocks: readonly PromptBlock[],
): readonly PromptSection[] {
  const seen = new Set<PromptSection>();
  for (const block of blocks) {
    seen.add(block.section);
  }

  return Object.freeze(
    [...seen].sort(
      (a, b) =>
        (DEFAULT_SECTION_ORDER[a] ?? 999) - (DEFAULT_SECTION_ORDER[b] ?? 999),
    ),
  );
}

/**
 * Group blocks by section (frozen map-like entries).
 */
export function groupBlocksBySection(
  blocks: readonly PromptBlock[],
): ReadonlyArray<{
  readonly section: PromptSection;
  readonly blocks: readonly PromptBlock[];
}> {
  const map = new Map<PromptSection, PromptBlock[]>();
  for (const block of blocks) {
    const list = map.get(block.section) ?? [];
    list.push(block);
    map.set(block.section, list);
  }

  return Object.freeze(
    [...map.entries()]
      .sort(
        ([a], [b]) =>
          (DEFAULT_SECTION_ORDER[a] ?? 999) - (DEFAULT_SECTION_ORDER[b] ?? 999),
      )
      .map(([section, sectionBlocks]) =>
        Object.freeze({
          section,
          blocks: Object.freeze([...sectionBlocks]),
        }),
      ),
  );
}

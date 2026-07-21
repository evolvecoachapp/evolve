import type { AIStreamChunk } from "../models/AIStreamChunk";

/**
 * Concatenate stream deltas in index order into a single content string.
 *
 * Does not format, trim, or interpret markdown.
 */
export function aggregateChunks(
  chunks: readonly AIStreamChunk[],
): string {
  return [...chunks]
    .sort((left, right) => left.index - right.index)
    .map((chunk) => chunk.delta)
    .join("");
}

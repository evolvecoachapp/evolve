import type { StreamChunk } from "../models/StreamChunk";

/**
 * Validate chunk order integrity (soft issues).
 */
export function validateChunkOrder(
  chunks: readonly StreamChunk[],
): readonly string[] {
  const issues: string[] = [];

  if (!chunks) {
    return Object.freeze(["stream_chunks_missing"]);
  }

  let previousIndex = -1;
  const seenIndexes = new Set<number>();

  for (const chunk of chunks) {
    if (chunk.index == null || Number.isNaN(chunk.index)) {
      issues.push("stream_chunk_index_missing");
      continue;
    }

    if (chunk.index < 0) {
      issues.push(`stream_chunk_index_negative:${chunk.index}`);
    }

    if (seenIndexes.has(chunk.index)) {
      issues.push(`stream_chunk_index_duplicate:${chunk.index}`);
    }
    seenIndexes.add(chunk.index);

    if (chunk.index < previousIndex) {
      issues.push(
        `stream_chunk_order_invalid:expected_gte_${previousIndex}_got_${chunk.index}`,
      );
    }

    previousIndex = chunk.index;
  }

  return Object.freeze(issues);
}

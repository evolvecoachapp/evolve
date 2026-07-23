import type { StreamChunk } from "../models/StreamChunk";
import { freezeChunk } from "./freezeObjects";

/**
 * Normalize a chunk (trim delta identity, freeze).
 * No business logic.
 */
export function normalizeChunk(chunk: StreamChunk): StreamChunk {
  return freezeChunk({
    ...chunk,
    delta: chunk.delta ?? "",
    finishReason: chunk.finishReason ?? null,
    isFinal: Boolean(chunk.isFinal),
  });
}

/**
 * Sort chunks by index ascending (stable for equal indexes).
 */
export function sortChunksByIndex(
  chunks: readonly StreamChunk[],
): readonly StreamChunk[] {
  return Object.freeze(
    [...chunks]
      .sort((a, b) => a.index - b.index || a.id.localeCompare(b.id))
      .map(normalizeChunk),
  );
}

/**
 * Concatenate chunk deltas in index order.
 */
export function concatenateChunkDeltas(
  chunks: readonly StreamChunk[],
): string {
  return sortChunksByIndex(chunks)
    .map((chunk) => chunk.delta)
    .join("");
}

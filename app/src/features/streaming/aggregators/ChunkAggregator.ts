import type { StreamChunk } from "../models/StreamChunk";
import {
  concatenateChunkDeltas,
  normalizeChunk,
  sortChunksByIndex,
} from "../utils/normalizeChunks";

/**
 * Aggregate stream chunks. No business logic.
 */
export class ChunkAggregator {
  private chunks: StreamChunk[] = [];

  add(chunk: StreamChunk): void {
    this.chunks.push(normalizeChunk(chunk));
  }

  getChunks(): readonly StreamChunk[] {
    return sortChunksByIndex(this.chunks);
  }

  getContent(): string {
    return concatenateChunkDeltas(this.chunks);
  }

  getCount(): number {
    return this.chunks.length;
  }

  getLastIndex(): number | null {
    if (this.chunks.length === 0) {
      return null;
    }
    return Math.max(...this.chunks.map((chunk) => chunk.index));
  }

  reset(): void {
    this.chunks = [];
  }
}

export function createChunkAggregator(): ChunkAggregator {
  return new ChunkAggregator();
}

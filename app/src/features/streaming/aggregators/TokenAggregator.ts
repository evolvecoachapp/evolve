import type { StreamChunk } from "../models/StreamChunk";
import type { StreamToken } from "../models/StreamToken";
import { freezeToken } from "../utils/freezeObjects";

/**
 * Aggregate tokens derived from chunk deltas.
 * Whitespace-split only — not a real tokenizer. No business logic.
 */
export class TokenAggregator {
  private tokens: StreamToken[] = [];
  private nextIndex = 0;

  addFromChunk(chunk: StreamChunk): readonly StreamToken[] {
    const parts = chunk.delta.length === 0 ? [] : chunk.delta.split(/(\s+)/).filter(Boolean);
    const created: StreamToken[] = [];

    for (const part of parts) {
      const token = freezeToken({
        id: `stream-tok:${chunk.streamId}:${this.nextIndex}`,
        streamId: chunk.streamId,
        chunkId: chunk.id,
        chunkIndex: chunk.index,
        index: this.nextIndex,
        value: part,
        createdAt: chunk.createdAt,
      });
      this.tokens.push(token);
      created.push(token);
      this.nextIndex += 1;
    }

    return Object.freeze(created);
  }

  getTokens(): readonly StreamToken[] {
    return Object.freeze([...this.tokens]);
  }

  getCount(): number {
    return this.tokens.length;
  }

  reset(): void {
    this.tokens = [];
    this.nextIndex = 0;
  }
}

export function createTokenAggregator(): TokenAggregator {
  return new TokenAggregator();
}

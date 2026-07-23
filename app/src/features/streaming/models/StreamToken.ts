/**
 * Immutable token derived from a stream chunk delta.
 *
 * Aggregation only — no tokenizer / provider logic.
 */
export interface StreamToken {
  readonly id: string;
  readonly streamId: string;
  readonly chunkId: string;
  readonly chunkIndex: number;
  readonly index: number;
  readonly value: string;
  readonly createdAt: string;
}

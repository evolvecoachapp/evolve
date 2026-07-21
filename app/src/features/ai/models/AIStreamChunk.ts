/** One incremental text delta from a provider stream. */
export interface AIStreamChunk {
  readonly id: string;
  readonly delta: string;
  readonly index: number;
  /** ISO-8601 timestamp. */
  readonly createdAt: string;
}

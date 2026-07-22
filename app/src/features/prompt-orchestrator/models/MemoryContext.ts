/**
 * Semantic-memory contribution for prompt orchestration.
 *
 * Structured memory only — never embeddings, vectors, or retrieval logic.
 * Semantic Memory domain owns persistence; this is the orchestration view.
 */
export interface MemoryContextEntry {
  readonly id: string;
  readonly category: string;
  readonly summary: string;
  /** Importance in `[0, 1]`. */
  readonly importance: number;
  /** ISO-8601 timestamp. */
  readonly capturedAt: string;
}

export interface MemoryContext {
  readonly entries: readonly MemoryContextEntry[];
  /** ISO-8601 timestamp when this context was assembled. */
  readonly capturedAt: string;
}

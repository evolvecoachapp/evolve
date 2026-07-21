import type { AIModel } from "./AIModel";
import type { AIProviderType } from "./AIProviderType";

/** Provider/model timing metadata for an active or completed stream. */
export interface StreamingMetadata {
  readonly provider: AIProviderType;
  readonly model: AIModel;
  /** ISO-8601 timestamp. */
  readonly startedAt: string;
  /** ISO-8601 timestamp when the stream finished, else null. */
  readonly completedAt: string | null;
  readonly chunkCount: number;
}

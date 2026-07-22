import type { AIFinishReason } from "./AIFinishReason";
import type { AIProviderId } from "./AIProviderId";
import type { AITokenUsage } from "./AITokenUsage";

/**
 * Standardized streaming chunk contract for future streaming providers.
 */
export interface AIResponseChunk {
  readonly id: string;
  readonly requestId: string;
  readonly providerId: AIProviderId;
  readonly index: number;
  readonly delta: string;
  readonly finishReason: AIFinishReason | null;
  readonly usage: AITokenUsage | null;
  readonly createdAt: string;
}

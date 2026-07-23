import type { AIError } from "./AIError";
import type { AIProviderId } from "./AIProviderId";
import type { AIResponse } from "./AIResponse";
import type { AIUsage } from "./AIUsage";

/**
 * Immutable execution outcome descriptor (preparation / future adapters).
 *
 * This foundation never executes providers — adapters fill this later.
 */
export interface AIExecutionResult {
  readonly id: string;
  readonly requestId: string;
  readonly providerId: AIProviderId;
  readonly success: boolean;
  readonly response: AIResponse | null;
  readonly error: AIError | null;
  readonly usage: AIUsage | null;
  readonly latencyMs: number | null;
  readonly completedAt: string;
}

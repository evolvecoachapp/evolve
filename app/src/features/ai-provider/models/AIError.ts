import type { AIProviderId } from "./AIProviderId";

/**
 * Immutable structured AI error descriptor (non-throwing form).
 *
 * Distinct from {@link AIProviderError} which is the throwable class.
 */
export interface AIError {
  readonly code: string;
  readonly message: string;
  readonly providerId: AIProviderId | null;
  readonly retryable: boolean;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;
  readonly occurredAt: string;
}

import type { AIProviderId } from "./AIProviderId";

/**
 * Hard failure from AI Provider Abstraction orchestration.
 */
export class AIProviderError extends Error {
  readonly code: string;
  readonly providerId: AIProviderId | null;

  constructor(
    code: string,
    message: string,
    providerId: AIProviderId | null = null,
  ) {
    super(message);
    this.name = "AIProviderError";
    this.code = code;
    this.providerId = providerId;
  }
}

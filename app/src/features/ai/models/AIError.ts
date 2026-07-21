import type { AIProviderType } from "./AIProviderType";

/** Structured error codes at the AI boundary. */
export type AIErrorCode =
  | "invalid_request"
  | "invalid_response"
  | "provider_unavailable"
  | "unsupported_provider"
  | "generation_failed";

/**
 * Single error type for the AI abstraction layer.
 *
 * Callers never need provider-specific failure knowledge.
 */
export class AIError extends Error {
  readonly code: AIErrorCode;
  readonly providerType?: AIProviderType;

  constructor(
    code: AIErrorCode,
    message: string,
    providerType?: AIProviderType,
  ) {
    super(message);
    this.name = "AIError";
    this.code = code;
    this.providerType = providerType;
  }
}

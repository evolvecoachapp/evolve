/**
 * Provider-layer OpenAI error (immutable facts).
 *
 * Mapped to AIProviderError at the provider boundary.
 */
export interface OpenAIError {
  readonly code: string;
  readonly message: string;
  readonly status: number | null;
  readonly type: string | null;
  readonly retryable: boolean;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;
}

export class OpenAIProviderError extends Error {
  readonly code: string;
  readonly status: number | null;
  readonly type: string | null;
  readonly retryable: boolean;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(error: OpenAIError) {
    super(error.message);
    this.name = "OpenAIProviderError";
    this.code = error.code;
    this.status = error.status;
    this.type = error.type;
    this.retryable = error.retryable;
    this.details = error.details;
  }
}

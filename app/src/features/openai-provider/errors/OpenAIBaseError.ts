import type { AIError } from "../../ai-provider/models/AIError";
import { AIProviderIds } from "../../ai-provider/models/AIProviderId";
import type { OpenAIError } from "../models/OpenAIError";

/**
 * Base OpenAI provider error — everything maps into AIError.
 */
export abstract class OpenAIBaseError extends Error {
  abstract readonly code: string;
  abstract readonly retryable: boolean;
  readonly status: number | null;
  readonly type: string | null;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;
  readonly occurredAt: string;

  constructor(
    message: string,
    options: {
      readonly status?: number | null;
      readonly type?: string | null;
      readonly details?: Readonly<Record<string, string | number | boolean | null>>;
      readonly occurredAt?: string;
    } = {},
  ) {
    super(message);
    this.name = new.target.name;
    this.status = options.status ?? null;
    this.type = options.type ?? null;
    this.details = Object.freeze({ ...(options.details ?? {}) });
    this.occurredAt = options.occurredAt ?? new Date().toISOString();
  }

  toOpenAIError(): OpenAIError {
    return Object.freeze({
      code: this.code,
      message: this.message,
      status: this.status,
      type: this.type,
      retryable: this.retryable,
      details: this.details,
    });
  }

  toAIError(): AIError {
    return Object.freeze({
      code: this.code,
      message: this.message,
      providerId: AIProviderIds.OPENAI,
      retryable: this.retryable,
      details: Object.freeze({
        ...this.details,
        status: this.status,
        type: this.type,
      }),
      occurredAt: this.occurredAt,
    });
  }
}

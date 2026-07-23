import { AIProviderError } from "../../ai-provider/models/AIProviderError";
import { AIProviderIds } from "../../ai-provider/models/AIProviderId";
import type { OpenAIError } from "../models/OpenAIError";
import { OpenAIProviderError } from "../models/OpenAIError";
import { freezeError } from "../utils/freezeObjects";

/**
 * Maps SDK / transport failures → immutable OpenAIError / AIProviderError.
 *
 * No business logic.
 */
export class ErrorMapper {
  static toOpenAIError(error: unknown): OpenAIError {
    if (error instanceof OpenAIProviderError) {
      return freezeError({
        code: error.code,
        message: error.message,
        status: error.status,
        type: error.type,
        retryable: error.retryable,
        details: error.details,
      });
    }

    if (isRecord(error)) {
      const status = typeof error.status === "number" ? error.status : null;
      const code =
        (typeof error.code === "string" && error.code) ||
        (status === 401
          ? "authentication_error"
          : status === 429
            ? "rate_limit_error"
            : status != null && status >= 500
              ? "server_error"
              : "openai_error");
      const message =
        (typeof error.message === "string" && error.message) ||
        "OpenAI request failed";
      const type =
        (typeof error.type === "string" && error.type) ||
        (typeof error.name === "string" && error.name) ||
        null;

      return freezeError({
        code,
        message,
        status,
        type,
        retryable: status === 429 || (status != null && status >= 500),
        details: Object.freeze({
          name: typeof error.name === "string" ? error.name : null,
        }),
      });
    }

    return freezeError({
      code: "openai_unknown_error",
      message: error instanceof Error ? error.message : "Unknown OpenAI error",
      status: null,
      type: error instanceof Error ? error.name : null,
      retryable: false,
      details: Object.freeze({}),
    });
  }

  static toProviderError(error: unknown): AIProviderError {
    const mapped = ErrorMapper.toOpenAIError(error);
    return new AIProviderError(
      mapped.code,
      mapped.message,
      AIProviderIds.OPENAI,
    );
  }

  static toOpenAIProviderError(error: unknown): OpenAIProviderError {
    return new OpenAIProviderError(ErrorMapper.toOpenAIError(error));
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

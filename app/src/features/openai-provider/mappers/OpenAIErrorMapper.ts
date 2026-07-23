import type { AIError } from "../../ai-provider/models/AIError";
import { AIProviderError } from "../../ai-provider/models/AIProviderError";
import { AIProviderIds } from "../../ai-provider/models/AIProviderId";
import {
  AuthenticationError,
  ConfigurationError,
  InvalidResponseError,
  NetworkError,
  OpenAIBaseError,
  ProviderUnavailableError,
  RateLimitError,
  TimeoutError,
} from "../errors";
import type { OpenAIError } from "../models/OpenAIError";
import { OpenAIProviderError } from "../models/OpenAIError";
import { freezeError } from "../utils/freezeObjects";

/**
 * Maps SDK / transport failures → OpenAI error hierarchy / AIError / AIProviderError.
 *
 * No business logic.
 */
export class OpenAIErrorMapper {
  static toTypedError(error: unknown): OpenAIBaseError {
    if (error instanceof OpenAIBaseError) {
      return error;
    }

    if (error instanceof OpenAIProviderError) {
      return OpenAIErrorMapper.fromFacts({
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
      const message =
        (typeof error.message === "string" && error.message) ||
        "OpenAI request failed";
      const type =
        (typeof error.type === "string" && error.type) ||
        (typeof error.name === "string" && error.name) ||
        null;
      const code =
        (typeof error.code === "string" && error.code) ||
        classifyCode(status, type, message);
      const details = Object.freeze({
        name: typeof error.name === "string" ? error.name : null,
      });

      return OpenAIErrorMapper.fromFacts({
        code,
        message,
        status,
        type,
        retryable: isRetryable(code, status),
        details,
      });
    }

    return new InvalidResponseError(
      error instanceof Error ? error.message : "Unknown OpenAI error",
      {
        type: error instanceof Error ? error.name : null,
        details: Object.freeze({}),
      },
    );
  }

  static toOpenAIError(error: unknown): OpenAIError {
    return freezeError(OpenAIErrorMapper.toTypedError(error).toOpenAIError());
  }

  static toAIError(error: unknown): AIError {
    return OpenAIErrorMapper.toTypedError(error).toAIError();
  }

  static toProviderError(error: unknown): AIProviderError {
    const mapped = OpenAIErrorMapper.toOpenAIError(error);
    return new AIProviderError(
      mapped.code,
      mapped.message,
      AIProviderIds.OPENAI,
    );
  }

  static toOpenAIProviderError(error: unknown): OpenAIProviderError {
    return new OpenAIProviderError(OpenAIErrorMapper.toOpenAIError(error));
  }

  static fromFacts(facts: OpenAIError): OpenAIBaseError {
    const options = {
      status: facts.status,
      type: facts.type,
      details: facts.details,
    };

    switch (facts.code) {
      case "authentication_error":
        return new AuthenticationError(facts.message, options);
      case "rate_limit_error":
        return new RateLimitError(facts.message, options);
      case "timeout_error":
        return new TimeoutError(facts.message, options);
      case "network_error":
        return new NetworkError(facts.message, options);
      case "provider_unavailable_error":
      case "server_error":
        return new ProviderUnavailableError(facts.message, {
          ...options,
          details: Object.freeze({
            ...facts.details,
            originalCode: facts.code,
          }),
        });
      case "configuration_error":
      case "openai_api_key_missing":
        return new ConfigurationError(facts.message, options);
      case "invalid_response_error":
        return new InvalidResponseError(facts.message, options);
      default:
        if (facts.status === 401 || facts.status === 403) {
          return new AuthenticationError(facts.message, options);
        }
        if (facts.status === 429) {
          return new RateLimitError(facts.message, options);
        }
        if (facts.status != null && facts.status >= 500) {
          return new ProviderUnavailableError(facts.message, options);
        }
        return new InvalidResponseError(facts.message, options);
    }
  }
}

/** @deprecated Prefer {@link OpenAIErrorMapper} */
export const ErrorMapper = OpenAIErrorMapper;

function classifyCode(
  status: number | null,
  type: string | null,
  message: string,
): string {
  const lowered = `${type ?? ""} ${message}`.toLowerCase();
  if (status === 401 || status === 403 || lowered.includes("auth")) {
    return "authentication_error";
  }
  if (status === 429 || lowered.includes("rate")) {
    return "rate_limit_error";
  }
  if (lowered.includes("timeout") || lowered.includes("timed out")) {
    return "timeout_error";
  }
  if (
    lowered.includes("network") ||
    lowered.includes("econn") ||
    lowered.includes("fetch failed")
  ) {
    return "network_error";
  }
  if (status != null && status >= 500) {
    return "provider_unavailable_error";
  }
  return "openai_error";
}

function isRetryable(code: string, status: number | null): boolean {
  return (
    code === "rate_limit_error" ||
    code === "timeout_error" ||
    code === "network_error" ||
    code === "provider_unavailable_error" ||
    code === "server_error" ||
    status === 429 ||
    (status != null && status >= 500)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

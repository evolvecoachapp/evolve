import { HttpError } from "../../../http/models/HttpError";
import { AIError, type AIErrorCode } from "../../models/AIError";

/**
 * Maps HTTP / transport failures → AIError.
 *
 * No raw HttpError values leave the OpenAI provider boundary.
 */
export class OpenAIErrorMapper {
  static map(error: unknown): AIError {
    if (error instanceof AIError) {
      return error;
    }

    if (error instanceof HttpError) {
      return mapHttpError(error);
    }

    if (error instanceof Error) {
      return new AIError(
        "generation_failed",
        error.message,
        "openai",
      );
    }

    return new AIError(
      "generation_failed",
      "OpenAI request failed",
      "openai",
    );
  }
}

function mapHttpError(error: HttpError): AIError {
  if (error.code === "timeout") {
    return new AIError("timeout", error.message, "openai");
  }

  if (error.code === "network" || error.code === "aborted") {
    return new AIError("provider_unavailable", error.message, "openai");
  }

  if (error.code === "parse") {
    return new AIError("invalid_response", error.message, "openai");
  }

  const status = error.status;
  if (status === undefined) {
    return new AIError("generation_failed", error.message, "openai");
  }

  const code = mapStatusCode(status);
  return new AIError(code, messageForStatus(status, error.message), "openai");
}

function mapStatusCode(status: number): AIErrorCode {
  switch (status) {
    case 401:
      return "authentication_failed";
    case 403:
      return "authorization_failed";
    case 404:
      return "not_found";
    case 408:
      return "timeout";
    case 429:
      return "rate_limited";
    case 500:
    case 502:
    case 503:
    case 504:
      return "provider_unavailable";
    case 400:
      return "invalid_request";
    default:
      return "generation_failed";
  }
}

function messageForStatus(status: number, fallback: string): string {
  switch (status) {
    case 401:
      return "OpenAI authentication failed";
    case 403:
      return "OpenAI authorization failed";
    case 404:
      return "OpenAI resource not found";
    case 408:
      return "OpenAI request timed out";
    case 429:
      return "OpenAI rate limit exceeded";
    case 500:
    case 502:
    case 503:
    case 504:
      return "OpenAI provider unavailable";
    default:
      return fallback;
  }
}

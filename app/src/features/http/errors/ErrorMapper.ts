import { HttpError } from "../models/HttpError";

const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

/**
 * Maps transport / HTTP failures into structured HttpError values.
 *
 * Provider-agnostic — no OpenAI or domain knowledge.
 */
export class ErrorMapper {
  /** Map a non-2xx HTTP response to HttpError. */
  static fromHttpStatus(
    status: number,
    body: unknown,
    statusText?: string,
  ): HttpError {
    const message =
      statusText && statusText.length > 0
        ? `HTTP ${status}: ${statusText}`
        : `HTTP ${status}`;

    return new HttpError("http", message, {
      status,
      body,
      retryable: RETRYABLE_STATUSES.has(status),
    });
  }

  /** Map an AbortError / timeout into HttpError. */
  static fromTimeout(timeoutMs: number, cause?: unknown): HttpError {
    return new HttpError(
      "timeout",
      `Request timed out after ${timeoutMs}ms`,
      {
        retryable: true,
        cause,
      },
    );
  }

  /** Map a network / fetch failure into HttpError. */
  static fromNetwork(cause: unknown): HttpError {
    const message =
      cause instanceof Error ? cause.message : "Network request failed";

    return new HttpError("network", message, {
      retryable: true,
      cause,
    });
  }

  /** Map a JSON parse failure into HttpError. */
  static fromParse(cause: unknown): HttpError {
    const message =
      cause instanceof Error ? cause.message : "Failed to parse response JSON";

    return new HttpError("parse", message, {
      retryable: false,
      cause,
    });
  }

  /** Map an explicit abort (non-timeout) into HttpError. */
  static fromAbort(cause?: unknown): HttpError {
    return new HttpError("aborted", "Request was aborted", {
      retryable: false,
      cause,
    });
  }
}

/** Structured failure codes at the HTTP boundary. */
export type HttpErrorCode =
  | "timeout"
  | "network"
  | "http"
  | "parse"
  | "aborted";

/**
 * Single error type for the shared HTTP layer.
 *
 * Providers map this to domain errors — callers never see raw fetch failures.
 */
export class HttpError extends Error {
  readonly code: HttpErrorCode;
  readonly status?: number;
  readonly body?: unknown;
  readonly retryable: boolean;

  constructor(
    code: HttpErrorCode,
    message: string,
    options: {
      readonly status?: number;
      readonly body?: unknown;
      readonly retryable?: boolean;
      readonly cause?: unknown;
    } = {},
  ) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "HttpError";
    this.code = code;
    this.status = options.status;
    this.body = options.body;
    this.retryable = options.retryable ?? false;
  }
}

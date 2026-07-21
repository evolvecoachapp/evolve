import { ErrorMapper } from "../errors/ErrorMapper";
import { HttpError } from "../models/HttpError";
import type { HttpHeaders } from "../models/HttpHeaders";
import type { HttpRequest } from "../models/HttpRequest";
import type { HttpResponse } from "../models/HttpResponse";
import { RetryPolicy } from "../policies/RetryPolicy";
import { TimeoutPolicy } from "../policies/TimeoutPolicy";

export type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export interface HttpClientOptions {
  readonly defaultTimeoutMs?: number;
  readonly defaultMaxRetries?: number;
  readonly fetchImpl?: FetchLike;
  /** Injectable delay for tests — defaults to setTimeout. */
  readonly sleep?: (ms: number) => Promise<void>;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 0;

/**
 * Shared HTTP transport for AI providers and future gateways.
 *
 * Responsibilities: execute requests, enforce timeout, retry, parse JSON.
 * No provider-specific logic.
 */
export class HttpClient {
  private readonly defaultTimeoutMs: number;
  private readonly defaultMaxRetries: number;
  private readonly fetchImpl: FetchLike;
  private readonly sleep: (ms: number) => Promise<void>;

  constructor(options: HttpClientOptions = {}) {
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.defaultMaxRetries = options.defaultMaxRetries ?? DEFAULT_MAX_RETRIES;
    this.fetchImpl = options.fetchImpl ?? fetch.bind(globalThis);
    this.sleep =
      options.sleep ??
      ((ms: number) =>
        new Promise((resolve) => {
          setTimeout(resolve, ms);
        }));
  }

  async request<T = unknown>(request: HttpRequest): Promise<HttpResponse<T>> {
    const timeoutMs = request.timeoutMs ?? this.defaultTimeoutMs;
    const retryPolicy = new RetryPolicy(
      request.retry ?? { maxRetries: this.defaultMaxRetries },
    );

    let attempt = 0;
    let lastError: HttpError | undefined;

    while (true) {
      try {
        return await this.executeOnce<T>(request, timeoutMs);
      } catch (error) {
        const httpError =
          error instanceof HttpError
            ? error
            : ErrorMapper.fromNetwork(error);

        lastError = httpError;

        if (!retryPolicy.shouldRetry(attempt, httpError)) {
          throw httpError;
        }

        await this.sleep(retryPolicy.delayMs(attempt));
        attempt += 1;
      }
    }

    // Unreachable — satisfies TypeScript control-flow analysis.
    throw lastError ?? new HttpError("network", "Request failed");
  }

  private async executeOnce<T>(
    request: HttpRequest,
    timeoutMs: number,
  ): Promise<HttpResponse<T>> {
    const timeout = new TimeoutPolicy(timeoutMs).createSignal();

    try {
      const init: RequestInit = {
        method: request.method,
        headers: {
          Accept: "application/json",
          ...request.headers,
        },
        signal: timeout.signal,
      };

      if (request.body !== undefined) {
        init.body = JSON.stringify(request.body);
        init.headers = {
          "Content-Type": "application/json",
          ...init.headers,
        };
      }

      let response: Response;
      try {
        response = await this.fetchImpl(request.url, init);
      } catch (error) {
        if (isAbortError(error)) {
          throw ErrorMapper.fromTimeout(timeoutMs, error);
        }
        throw ErrorMapper.fromNetwork(error);
      }

      const headers = toHeaders(response.headers);
      const body = await this.parseBody(response);

      if (!response.ok) {
        throw ErrorMapper.fromHttpStatus(
          response.status,
          body,
          response.statusText,
        );
      }

      return Object.freeze({
        status: response.status,
        headers,
        body: body as T,
        ok: true,
      });
    } finally {
      timeout.dispose();
    }
  }

  private async parseBody(response: Response): Promise<unknown> {
    const text = await response.text();

    if (!text) {
      return undefined;
    }

    try {
      return JSON.parse(text) as unknown;
    } catch (error) {
      // Non-JSON error bodies are still useful for status mapping.
      if (!response.ok) {
        return text;
      }
      throw ErrorMapper.fromParse(error);
    }
  }
}

function toHeaders(headers: Headers): HttpHeaders {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return Object.freeze(result);
}

function isAbortError(error: unknown): boolean {
  if (error instanceof Error && error.name === "AbortError") {
    return true;
  }
  if (
    typeof DOMException !== "undefined" &&
    error instanceof DOMException &&
    error.name === "AbortError"
  ) {
    return true;
  }
  return false;
}

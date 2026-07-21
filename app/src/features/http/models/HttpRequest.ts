import type { HttpHeaders } from "./HttpHeaders";
import type { HttpMethod } from "./HttpMethod";
import type { RetryPolicyOptions } from "../policies/RetryPolicy";

/**
 * Provider-agnostic HTTP request descriptor.
 *
 * No vendor-specific fields — providers compose URLs, headers, and bodies.
 */
export interface HttpRequest {
  readonly url: string;
  readonly method: HttpMethod;
  readonly headers?: HttpHeaders;
  /** JSON-serializable body (stringified by HttpClient). */
  readonly body?: unknown;
  /** Per-request timeout override in milliseconds. */
  readonly timeoutMs?: number;
  /** Per-request retry override. */
  readonly retry?: RetryPolicyOptions;
}

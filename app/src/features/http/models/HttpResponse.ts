import type { HttpHeaders } from "./HttpHeaders";

/** Typed HTTP response returned by HttpClient. */
export interface HttpResponse<T = unknown> {
  readonly status: number;
  readonly headers: HttpHeaders;
  readonly body: T;
  readonly ok: boolean;
}

import { clearTokens, getAccessToken, getTokens, saveTokens, TokenPair } from "../auth/secureStorage";
import type { ApiErrorBody } from "../types/api";
import { API_BASE_URL } from "./config";

/**
 * Raised for any non-2xx response from the EVOLVE API. `detail` carries the
 * parsed response body (typically a FastAPI `{"detail": "..."}` shape) so
 * callers can surface a server-provided message when one exists.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, detail: unknown, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  /**
   * Whether this request should attach the stored access token (and, on a
   * `401`, attempt the refresh-and-retry-once flow below). Defaults to
   * `true`; set to `false` for the login/register/refresh calls themselves,
   * which never carry — or need — a bearer token.
   */
  auth?: boolean;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractErrorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = (payload as ApiErrorBody).detail;
    if (typeof detail === "string") {
      return detail;
    }
  }
  return `Request failed with status ${status}.`;
}

async function performFetch(
  path: string,
  options: Pick<RequestOptions, "method" | "body" | "headers">,
  accessToken?: string | null,
): Promise<unknown> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(response.status, payload, extractErrorMessage(payload, response.status));
  }

  return payload;
}

/**
 * Redeems the stored refresh token for a new access/refresh pair via
 * `POST /api/v1/auth/refresh`, persisting the result. Calls `performFetch`
 * directly (never `request()`) so a failed refresh can never recursively
 * trigger another refresh attempt.
 */
async function refreshAccessToken(): Promise<TokenPair | null> {
  const tokens = await getTokens();
  if (!tokens) {
    return null;
  }

  try {
    const payload = (await performFetch("/api/v1/auth/refresh", {
      method: "POST",
      body: { refresh_token: tokens.refreshToken },
    })) as { access_token: string; refresh_token: string };

    const refreshed: TokenPair = {
      accessToken: payload.access_token,
      refreshToken: payload.refresh_token,
    };
    await saveTokens(refreshed);
    return refreshed;
  } catch {
    await clearTokens();
    return null;
  }
}

/**
 * Typed request helper against the EVOLVE API. On a `401` from an
 * authenticated call, attempts exactly one silent token refresh and retries
 * the original request once; if the refresh also fails, tokens are cleared
 * and the original `401` `ApiError` is rethrown — callers (see
 * `AuthContext`) treat that as "session expired, show the login screen."
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, ...fetchOptions } = options;
  const accessToken = auth ? await getAccessToken() : null;

  try {
    return (await performFetch(path, fetchOptions, accessToken)) as T;
  } catch (error) {
    if (auth && error instanceof ApiError && error.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return (await performFetch(path, fetchOptions, refreshed.accessToken)) as T;
      }
    }
    throw error;
  }
}

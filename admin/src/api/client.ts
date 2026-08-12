import { API_BASE_URL } from "../config";
import { AdminApiError } from "../types/admin";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "../auth/tokenStore";

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  retry?: boolean;
};

function userMessageForStatus(status: number): string {
  if (status === 401) {
    return "Invalid email or password.";
  }
  if (status === 403) {
    return "Administrator access required.";
  }
  if (status === 404) {
    return "The requested record was not found.";
  }
  return "Something went wrong. Please try again.";
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!response.ok) {
    clearTokens();
    return null;
  }
  const payload = (await response.json()) as { access_token: string; refresh_token: string };
  setTokens(payload.access_token, payload.refresh_token);
  return payload.access_token;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = options.token === undefined ? getAccessToken() : options.token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (response.status === 401 && options.retry !== false && token) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      return apiRequest<T>(path, { ...options, token: nextToken, retry: false });
    }
  }

  if (!response.ok) {
    await parseBody(response);
    throw new AdminApiError(userMessageForStatus(response.status), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await parseBody(response)) as T;
}

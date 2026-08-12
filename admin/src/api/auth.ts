import { apiRequest } from "./client";
import { clearTokens, setTokens } from "../auth/tokenStore";
import type { AdminSession, TokenResponse } from "../types/admin";

export async function loginAdmin(email: string, password: string): Promise<AdminSession> {
  const tokens = await apiRequest<TokenResponse>("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
    token: null,
    retry: false,
  });
  setTokens(tokens.access_token, tokens.refresh_token);
  try {
    return await apiRequest<AdminSession>("/api/v1/admin/session", {
      method: "POST",
      token: tokens.access_token,
      retry: false,
    });
  } catch (error) {
    clearTokens();
    throw error;
  }
}

export async function fetchAdminMe(): Promise<AdminSession> {
  return apiRequest<AdminSession>("/api/v1/admin/me");
}

export async function logoutAdmin(): Promise<void> {
  try {
    await apiRequest<void>("/api/v1/admin/session", { method: "DELETE", retry: false });
  } catch {
    // Token discard is client-side; audit failure must not block logout.
  }
}

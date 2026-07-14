import type { TokenResponse, UserCreate, UserPublic } from "../types/api";
import { request } from "./client";

/**
 * Typed calls against the existing `/api/v1/auth/*` and `/api/v1/users/me`
 * endpoints — no backend changes were needed for this sprint. This module
 * only calls the API; token persistence and auth state live in
 * `src/auth/AuthContext.tsx`, not here.
 */

export async function registerUser(data: UserCreate): Promise<UserPublic> {
  return request<UserPublic>("/api/v1/auth/register", {
    method: "POST",
    body: data,
    auth: false,
  });
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  return request<TokenResponse>("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export async function getCurrentUser(): Promise<UserPublic> {
  return request<UserPublic>("/api/v1/users/me", { method: "GET" });
}

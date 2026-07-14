import type { UserPublic, UserUpdate } from "../types/api";
import { request } from "./client";

/**
 * Typed calls against `/api/v1/users/me` for profile updates.
 * Reads continue to use `getCurrentUser()` in `src/api/auth.ts`.
 */

export async function updateCurrentUser(data: UserUpdate): Promise<UserPublic> {
  return request<UserPublic>("/api/v1/users/me", {
    method: "PATCH",
    body: data,
  });
}

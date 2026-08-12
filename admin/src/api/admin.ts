import { apiRequest } from "./client";
import type {
  AdminDashboardSummary,
  AdminSystemHealth,
  AdminUser,
  AdminUserPage,
} from "../types/admin";

export function fetchDashboard(): Promise<AdminDashboardSummary> {
  return apiRequest<AdminDashboardSummary>("/api/v1/admin/dashboard");
}

export function fetchHealth(): Promise<AdminSystemHealth> {
  return apiRequest<AdminSystemHealth>("/api/v1/admin/health");
}

export function fetchUsers(params?: {
  isActive?: boolean;
  limit?: number;
  offset?: number;
}): Promise<AdminUserPage> {
  const search = new URLSearchParams();
  if (params?.isActive !== undefined) {
    search.set("is_active", String(params.isActive));
  }
  search.set("limit", String(params?.limit ?? 20));
  search.set("offset", String(params?.offset ?? 0));
  return apiRequest<AdminUserPage>(`/api/v1/admin/users?${search.toString()}`);
}

export function fetchUser(userId: string): Promise<AdminUser> {
  return apiRequest<AdminUser>(`/api/v1/admin/users/${userId}`);
}

export function updateUserStatus(userId: string, isActive: boolean): Promise<AdminUser> {
  return apiRequest<AdminUser>(`/api/v1/admin/users/${userId}/status`, {
    method: "PATCH",
    body: { is_active: isActive },
  });
}

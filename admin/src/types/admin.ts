export type AdminSession = {
  id: string;
  email: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  is_superuser: boolean;
};

export type AdminUser = AdminSession & {
  birth_date: string | null;
  gender: string | null;
  height_cm: string | null;
  current_weight_kg: string | null;
  target_weight_kg: string | null;
  activity_level: string | null;
  goal: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type AdminUserPage = {
  items: AdminUser[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminDashboardSummary = {
  users: {
    total: number;
    active: number;
    inactive: number;
    superusers: number;
  };
  activity: {
    workout_logs: number;
    meal_logs: number;
    recovery_check_ins: number;
    goals: number;
    progress_entries: number;
    conversations: number;
  };
};

export type AdminSystemHealth = {
  status: string;
  api: string;
  database: string;
  version: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export class AdminApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

import { apiRequest } from "./client";
import type {
  AdminDashboardSummary,
  AdminSystemHealth,
  AdminUser,
  AdminUserPage,
  CatalogItem,
  Conversation,
  ChatMessage,
  Exercise,
  Goal,
  Meal,
  MealLog,
  NutritionTargets,
  Page,
  Program,
  ProgramDetail,
  ProgressEntry,
  ProgressSummary,
  Readiness,
  RecoveryCheckIn,
  Workout,
  WorkoutLogDetail,
  WorkoutLogSummary,
} from "../types/admin";

function withPaging(search: URLSearchParams, limit?: number, offset?: number) {
  search.set("limit", String(limit ?? 20));
  search.set("offset", String(offset ?? 0));
}

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
  withPaging(search, params?.limit, params?.offset);
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

export function fetchMuscleGroups(): Promise<CatalogItem[]> {
  return apiRequest<CatalogItem[]>("/api/v1/admin/muscle-groups");
}

export function createMuscleGroup(body: {
  name: string;
  slug: string;
  description?: string;
}): Promise<CatalogItem> {
  return apiRequest<CatalogItem>("/api/v1/admin/muscle-groups", { method: "POST", body });
}

export function fetchEquipment(): Promise<CatalogItem[]> {
  return apiRequest<CatalogItem[]>("/api/v1/admin/equipment");
}

export function createEquipment(body: {
  name: string;
  slug: string;
  description?: string;
}): Promise<CatalogItem> {
  return apiRequest<CatalogItem>("/api/v1/admin/equipment", { method: "POST", body });
}

export function fetchExercises(params?: {
  q?: string;
  category?: string;
  difficulty_level?: string;
  muscle_group_id?: string;
  limit?: number;
  offset?: number;
}): Promise<Page<Exercise>> {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.category) search.set("category", params.category);
  if (params?.difficulty_level) search.set("difficulty_level", params.difficulty_level);
  if (params?.muscle_group_id) search.set("muscle_group_id", params.muscle_group_id);
  withPaging(search, params?.limit, params?.offset);
  return apiRequest<Page<Exercise>>(`/api/v1/admin/exercises?${search.toString()}`);
}

export function fetchExercise(id: string): Promise<Exercise> {
  return apiRequest<Exercise>(`/api/v1/admin/exercises/${id}`);
}

export function createExercise(body: Record<string, unknown>): Promise<Exercise> {
  return apiRequest<Exercise>("/api/v1/admin/exercises", { method: "POST", body });
}

export function updateExercise(id: string, body: Record<string, unknown>): Promise<Exercise> {
  return apiRequest<Exercise>(`/api/v1/admin/exercises/${id}`, { method: "PATCH", body });
}

export function deactivateExercise(id: string): Promise<Exercise> {
  return apiRequest<Exercise>(`/api/v1/admin/exercises/${id}/deactivate`, { method: "POST" });
}

export function fetchPrograms(params?: {
  q?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<Page<Program>> {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.status) search.set("status", params.status);
  withPaging(search, params?.limit, params?.offset);
  return apiRequest<Page<Program>>(`/api/v1/admin/programs?${search.toString()}`);
}

export function fetchProgram(id: string): Promise<ProgramDetail> {
  return apiRequest<ProgramDetail>(`/api/v1/admin/programs/${id}`);
}

export function createProgram(body: Record<string, unknown>): Promise<Program> {
  return apiRequest<Program>("/api/v1/admin/programs", { method: "POST", body });
}

export function updateProgram(id: string, body: Record<string, unknown>): Promise<Program> {
  return apiRequest<Program>(`/api/v1/admin/programs/${id}`, { method: "PATCH", body });
}

export function publishProgram(id: string): Promise<Program> {
  return apiRequest<Program>(`/api/v1/admin/programs/${id}/publish`, { method: "POST" });
}

export function archiveProgram(id: string): Promise<Program> {
  return apiRequest<Program>(`/api/v1/admin/programs/${id}/archive`, { method: "POST" });
}

export function fetchWorkouts(params?: {
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<Page<Workout>> {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  withPaging(search, params?.limit, params?.offset);
  return apiRequest<Page<Workout>>(`/api/v1/admin/workouts?${search.toString()}`);
}

export function fetchWorkout(id: string): Promise<Workout> {
  return apiRequest<Workout>(`/api/v1/admin/workouts/${id}`);
}

export function createWorkout(body: Record<string, unknown>): Promise<Workout> {
  return apiRequest<Workout>("/api/v1/admin/workouts", { method: "POST", body });
}

export function updateWorkout(id: string, body: Record<string, unknown>): Promise<Workout> {
  return apiRequest<Workout>(`/api/v1/admin/workouts/${id}`, { method: "PATCH", body });
}

export function deactivateWorkout(id: string): Promise<Workout> {
  return apiRequest<Workout>(`/api/v1/admin/workouts/${id}/deactivate`, { method: "POST" });
}

export function fetchWorkoutLogs(params?: {
  userId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<Page<WorkoutLogSummary>> {
  const search = new URLSearchParams();
  if (params?.userId) search.set("user_id", params.userId);
  if (params?.status) search.set("status", params.status);
  withPaging(search, params?.limit, params?.offset);
  return apiRequest<Page<WorkoutLogSummary>>(`/api/v1/admin/workout-logs?${search.toString()}`);
}

export function fetchWorkoutLog(id: string): Promise<WorkoutLogDetail> {
  return apiRequest<WorkoutLogDetail>(`/api/v1/admin/workout-logs/${id}`);
}

export function fetchMeals(params?: {
  createdById?: string;
  limit?: number;
  offset?: number;
}): Promise<Page<Meal>> {
  const search = new URLSearchParams();
  if (params?.createdById) search.set("created_by_id", params.createdById);
  withPaging(search, params?.limit, params?.offset);
  return apiRequest<Page<Meal>>(`/api/v1/admin/meals?${search.toString()}`);
}

export function fetchMeal(id: string): Promise<Meal> {
  return apiRequest<Meal>(`/api/v1/admin/meals/${id}`);
}

export function fetchMealLogs(params?: {
  userId?: string;
  limit?: number;
  offset?: number;
}): Promise<Page<MealLog>> {
  const search = new URLSearchParams();
  if (params?.userId) search.set("user_id", params.userId);
  withPaging(search, params?.limit, params?.offset);
  return apiRequest<Page<MealLog>>(`/api/v1/admin/meal-logs?${search.toString()}`);
}

export function fetchMealLog(id: string): Promise<MealLog> {
  return apiRequest<MealLog>(`/api/v1/admin/meal-logs/${id}`);
}

export function fetchNutritionTargets(userId: string, forDate?: string): Promise<NutritionTargets> {
  const search = new URLSearchParams({ user_id: userId });
  if (forDate) search.set("for_date", forDate);
  return apiRequest<NutritionTargets>(`/api/v1/admin/nutrition/targets?${search.toString()}`);
}

export function fetchCheckIns(params?: {
  userId?: string;
  limit?: number;
  offset?: number;
}): Promise<Page<RecoveryCheckIn>> {
  const search = new URLSearchParams();
  if (params?.userId) search.set("user_id", params.userId);
  withPaging(search, params?.limit, params?.offset);
  return apiRequest<Page<RecoveryCheckIn>>(`/api/v1/admin/recovery/check-ins?${search.toString()}`);
}

export function fetchCheckIn(id: string): Promise<RecoveryCheckIn> {
  return apiRequest<RecoveryCheckIn>(`/api/v1/admin/recovery/check-ins/${id}`);
}

export function fetchReadiness(userId: string, forDate?: string): Promise<Readiness> {
  const search = new URLSearchParams({ user_id: userId });
  if (forDate) search.set("for_date", forDate);
  return apiRequest<Readiness>(`/api/v1/admin/recovery/readiness?${search.toString()}`);
}

export function fetchGoals(params?: {
  userId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<Page<Goal>> {
  const search = new URLSearchParams();
  if (params?.userId) search.set("user_id", params.userId);
  if (params?.status) search.set("status", params.status);
  withPaging(search, params?.limit, params?.offset);
  return apiRequest<Page<Goal>>(`/api/v1/admin/goals?${search.toString()}`);
}

export function fetchGoal(id: string): Promise<Goal> {
  return apiRequest<Goal>(`/api/v1/admin/goals/${id}`);
}

export function fetchProgress(params?: {
  userId?: string;
  metricType?: string;
  limit?: number;
  offset?: number;
}): Promise<Page<ProgressEntry>> {
  const search = new URLSearchParams();
  if (params?.userId) search.set("user_id", params.userId);
  if (params?.metricType) search.set("metric_type", params.metricType);
  withPaging(search, params?.limit, params?.offset);
  return apiRequest<Page<ProgressEntry>>(`/api/v1/admin/progress?${search.toString()}`);
}

export function fetchProgressEntry(id: string): Promise<ProgressEntry> {
  return apiRequest<ProgressEntry>(`/api/v1/admin/progress/${id}`);
}

export function fetchProgressSummary(params: {
  userId: string;
  metricType: string;
  goalId?: string;
}): Promise<ProgressSummary> {
  const search = new URLSearchParams({
    user_id: params.userId,
    metric_type: params.metricType,
  });
  if (params.goalId) search.set("goal_id", params.goalId);
  return apiRequest<ProgressSummary>(`/api/v1/admin/progress/summary?${search.toString()}`);
}

export function fetchConversations(params?: {
  userId?: string;
  limit?: number;
  offset?: number;
}): Promise<Page<Conversation>> {
  const search = new URLSearchParams();
  if (params?.userId) search.set("user_id", params.userId);
  withPaging(search, params?.limit, params?.offset);
  return apiRequest<Page<Conversation>>(`/api/v1/admin/conversations?${search.toString()}`);
}

export function fetchConversation(id: string): Promise<Conversation> {
  return apiRequest<Conversation>(`/api/v1/admin/conversations/${id}`);
}

export function fetchConversationMessages(
  id: string,
  params?: { limit?: number; offset?: number },
): Promise<Page<ChatMessage>> {
  const search = new URLSearchParams();
  withPaging(search, params?.limit, params?.offset);
  return apiRequest<Page<ChatMessage>>(
    `/api/v1/admin/conversations/${id}/messages?${search.toString()}`,
  );
}

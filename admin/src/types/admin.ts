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

export type Page<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
};

export type CatalogItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type MuscleGroupRole = CatalogItem & { is_primary: boolean };
export type EquipmentRole = CatalogItem & { is_required: boolean };

export type Exercise = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  instructions: string | null;
  difficulty_level: string;
  category: string;
  video_url: string | null;
  image_url: string | null;
  is_active: boolean;
  muscle_groups: MuscleGroupRole[];
  equipment: EquipmentRole[];
  created_at: string;
  updated_at: string;
};

export type Program = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_weeks: number;
  goal: string;
  difficulty_level: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ProgramDay = {
  id: string;
  program_id: string;
  week_number: number;
  day_number: number;
  label: string | null;
  workout_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProgramAssignment = {
  id: string;
  program_id: string;
  user_id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  current_week_number: number;
  current_day_number: number;
  cursor_exhausted: boolean;
  created_at: string;
  updated_at: string;
};

export type ProgramDetail = {
  program: Program;
  days: ProgramDay[];
  assignments: ProgramAssignment[];
};

export type WorkoutExercise = {
  id: string;
  exercise_id: string;
  order_index: number;
  target_sets: number;
  target_reps_min: number | null;
  target_reps_max: number | null;
  rest_seconds: number | null;
  notes: string | null;
};

export type Workout = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  estimated_duration_minutes: number | null;
  is_active: boolean;
  exercises: WorkoutExercise[];
  created_at: string;
  updated_at: string;
};

export type WorkoutLogSummary = {
  id: string;
  user_id: string;
  program_assignment_id: string | null;
  workout_id: string | null;
  status: string;
  scheduled_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_actual_minutes: number | null;
  notes: string | null;
  exercise_count: number;
  created_at: string;
};

export type WorkoutLogDetail = WorkoutLogSummary & {
  exercises: Array<{
    id: string;
    exercise_id: string;
    exercise_name_snapshot: string;
    skipped: boolean;
    sets: Array<{
      id: string;
      set_number: number;
      weight_kg: string | null;
      reps: number | null;
      rpe: string | null;
    }>;
  }>;
};

export type Meal = {
  id: string;
  created_by_id: string | null;
  is_public: boolean;
  name: string;
  description: string | null;
  meal_type: string;
  calories: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MealLog = {
  id: string;
  user_id: string;
  meal_id: string | null;
  name_snapshot: string;
  meal_type: string;
  calories: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
  consumed_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type NutritionTargets = {
  targets: { calories: string; protein_g: string; carbs_g: string; fat_g: string };
  actual: { calories: string; protein_g: string; carbs_g: string; fat_g: string };
  summary_text: string;
  for_date: string;
};

export type RecoveryCheckIn = {
  id: string;
  user_id: string;
  checkin_date: string;
  sleep_hours: string;
  sleep_quality: number;
  soreness: number;
  fatigue: number;
  resting_heart_rate: number | null;
  hrv_ms: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Readiness = {
  readiness_score: string;
  readiness_level: string;
  recommendation_text: string;
  protocols: string[];
  for_date: string;
};

export type Goal = {
  id: string;
  user_id: string;
  goal_type: string;
  description: string;
  target_metric_type: string | null;
  target_value: string | null;
  target_unit: string | null;
  start_date: string;
  target_date: string | null;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
};

export type ProgressEntry = {
  id: string;
  user_id: string;
  goal_id: string | null;
  exercise_id: string | null;
  metric_type: string;
  value: string;
  unit: string;
  recorded_date: string;
  source: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ProgressSummary = {
  metric_type: string;
  unit: string;
  window_start: string;
  window_end: string;
  stats: {
    trend_direction: string;
    slope_per_week: string;
    consistency_pct: string;
    plateau_detected: boolean;
    projected_target_date: string | null;
  };
  narrative_text: string;
  for_date: string;
};

export type Conversation = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
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

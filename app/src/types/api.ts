/**
 * Types mirroring the backend's Pydantic schemas (backend/app/schemas/).
 * Kept in lockstep by hand for now — there is no shared-schema generation
 * step yet, so any backend schema change must be reflected here manually.
 */

/** Mirrors `app.models.user.Gender`. */
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

/** Mirrors `app.models.user.ActivityLevel`. */
export type ActivityLevel =
  | "sedentary"
  | "lightly_active"
  | "moderately_active"
  | "very_active"
  | "extremely_active";

/** Mirrors `app.models.user.Goal`. */
export type Goal =
  | "lose_weight"
  | "maintain_weight"
  | "gain_muscle"
  | "improve_endurance"
  | "general_fitness";

/**
 * Mirrors `app.schemas.user.UserCreate` (backend/app/schemas/user.py).
 *
 * Only `email`/`username`/`password` are collected by this sprint's
 * Register screen — the optional profile fields exist here for type
 * completeness against the backend contract but are not yet surfaced in
 * any onboarding UI (full profile-completion is a later mobile sprint).
 */
export interface UserCreate {
  email: string;
  username: string;
  password: string;
  first_name?: string | null;
  last_name?: string | null;
  birth_date?: string | null;
  gender?: Gender | null;
  height_cm?: number | null;
  current_weight_kg?: number | null;
  target_weight_kg?: number | null;
  activity_level?: ActivityLevel | null;
  goal?: Goal | null;
}

/** Mirrors `app.schemas.user.UserUpdate`. */
export interface UserUpdate {
  email?: string;
  username?: string;
  first_name?: string | null;
  last_name?: string | null;
  birth_date?: string | null;
  gender?: Gender | null;
  height_cm?: number | null;
  current_weight_kg?: number | null;
  target_weight_kg?: number | null;
  activity_level?: ActivityLevel | null;
  goal?: Goal | null;
}

/** Mirrors `app.schemas.user.UserPublic`. */
export interface UserPublic {
  id: string;
  email: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  gender: Gender | null;
  height_cm: number | null;
  current_weight_kg: number | null;
  target_weight_kg: number | null;
  activity_level: ActivityLevel | null;
  goal: Goal | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

/** Mirrors `app.schemas.auth.TokenResponse`. */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/** Shape of a FastAPI `HTTPException` error body: `{ "detail": "..." }`. */
export interface ApiErrorBody {
  detail?: string;
}

/*
 * ---------------------------------------------------------------------------
 * Workout domain (backend/app/schemas/exercise.py, workout.py, workout_log.py,
 * workout_resolution.py, program.py).
 *
 * Decimal fields (`weight_kg`, `rpe`) are serialized by FastAPI/Pydantic as
 * JSON *strings* (e.g. `"60.00"`), never numbers — callers must `Number(...)`
 * them before doing arithmetic.
 * ---------------------------------------------------------------------------
 */

/** Mirrors `app.models.exercise.ExerciseCategory`. */
export type ExerciseCategoryDto = "compound" | "isolation" | "cardio" | "mobility";

/** Mirrors `app.models.exercise.DifficultyLevel`. */
export type DifficultyLevelDto = "beginner" | "intermediate" | "advanced";

/** Mirrors `app.schemas.exercise.ExerciseCatalogRef`. */
export interface ExerciseCatalogRefDto {
  id: string;
  name: string;
  slug: string;
  category: ExerciseCategoryDto;
  difficulty_level: DifficultyLevelDto;
  video_url: string | null;
  image_url: string | null;
  primary_muscle_group: string | null;
  equipment_slugs: string[];
}

/** Mirrors `app.schemas.workout.WorkoutExerciseRead`. */
export interface WorkoutExerciseReadDto {
  id: string;
  exercise_id: string;
  exercise: ExerciseCatalogRefDto;
  order_index: number;
  target_sets: number;
  target_reps_min: number | null;
  target_reps_max: number | null;
  rest_seconds: number | null;
  notes: string | null;
}

/** Mirrors `app.schemas.workout.WorkoutPublic`. */
export interface WorkoutPublicDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  estimated_duration_minutes: number | null;
  is_active: boolean;
  exercises: WorkoutExerciseReadDto[];
  created_at: string;
  updated_at: string;
}

/** Mirrors `app.schemas.workout.WorkoutPage`. */
export interface WorkoutPageDto {
  items: WorkoutPublicDto[];
  total: number;
  limit: number;
  offset: number;
}

/** Mirrors `app.models.program.ProgramGoal`. */
export type ProgramGoalDto = "strength" | "hypertrophy" | "endurance" | "general_fitness";

/** Mirrors `app.models.program.ProgramStatus`. */
export type ProgramStatusDto = "draft" | "published" | "archived";

/** Mirrors `app.schemas.program.ProgramPublic`. */
export interface ProgramPublicDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  duration_weeks: number;
  goal: ProgramGoalDto;
  difficulty_level: DifficultyLevelDto;
  status: ProgramStatusDto;
  created_at: string;
  updated_at: string;
}

/** Mirrors `app.schemas.workout_resolution.WorkoutResolutionState`. */
export type WorkoutResolutionStateDto =
  | "training_day"
  | "rest_day"
  | "program_complete"
  | "no_active_program";

/** Mirrors `app.schemas.workout_resolution.TodayLogStatus`. */
export type TodayLogStatusDto = "none" | "in_progress" | "completed" | "skipped";

/** Mirrors `app.schemas.workout_resolution.WorkoutPreview`. */
export interface WorkoutPreviewDto {
  state: WorkoutResolutionStateDto;
  program: ProgramPublicDto | null;
  assignment_id: string | null;
  week_number: number | null;
  day_number: number | null;
  day_label: string | null;
  workout: WorkoutPublicDto | null;
  today_log_status: TodayLogStatusDto;
  active_workout_log_id: string | null;
}

/** Mirrors `app.models.workout_log.WorkoutLogStatus`. */
export type WorkoutLogStatusDto = "planned" | "in_progress" | "completed" | "skipped";

/** Mirrors `app.schemas.workout_log.WorkoutLogStart`. */
export interface WorkoutLogStartRequest {
  workout_id?: string | null;
  program_assignment_id?: string | null;
  scheduled_date?: string | null;
  notes?: string | null;
}

/** Mirrors `app.schemas.workout_log.WorkoutLogFinish`. */
export interface WorkoutLogFinishRequest {
  duration_actual_minutes?: number | null;
  notes?: string | null;
}

/** Mirrors `app.schemas.workout_log.WorkoutLogExerciseCreate`. */
export interface WorkoutLogExerciseCreateRequest {
  exercise_id: string;
  order_index?: number | null;
  notes?: string | null;
}

/** Mirrors `app.schemas.workout_log.WorkoutSetLogCreate`. `weight_kg`/`rpe` are numbers on the wire in requests (unlike Decimal responses). */
export interface WorkoutSetLogCreateRequest {
  weight_kg?: number | null;
  reps?: number | null;
  rpe?: number | null;
  duration_seconds?: number | null;
  is_warmup?: boolean;
  notes?: string | null;
}

/** Mirrors `app.schemas.workout_log.WorkoutSetLogUpdate`. */
export interface WorkoutSetLogUpdateRequest {
  weight_kg?: number | null;
  reps?: number | null;
  rpe?: number | null;
  duration_seconds?: number | null;
  is_warmup?: boolean | null;
  notes?: string | null;
}

/** Mirrors `app.schemas.workout_log.WorkoutSetLogRead`. */
export interface WorkoutSetLogReadDto {
  id: string;
  set_number: number;
  weight_kg: string | null;
  reps: number | null;
  rpe: string | null;
  duration_seconds: number | null;
  is_warmup: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Mirrors `app.schemas.workout_log.WorkoutLogExerciseRead`. */
export interface WorkoutLogExerciseReadDto {
  id: string;
  exercise_id: string;
  exercise: ExerciseCatalogRefDto;
  workout_exercise_id: string | null;
  order_index: number;
  exercise_name_snapshot: string;
  target_sets: number | null;
  target_reps_min: number | null;
  target_reps_max: number | null;
  rest_seconds: number | null;
  notes: string | null;
  skipped: boolean;
  sets: WorkoutSetLogReadDto[];
  created_at: string;
  updated_at: string;
}

/** Mirrors `app.schemas.workout_log.WorkoutLogDetail`. */
export interface WorkoutLogDetailDto {
  id: string;
  user_id: string;
  program_assignment_id: string | null;
  workout_id: string | null;
  status: WorkoutLogStatusDto;
  scheduled_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_actual_minutes: number | null;
  notes: string | null;
  exercises: WorkoutLogExerciseReadDto[];
  created_at: string;
  updated_at: string;
}

/** Mirrors `app.schemas.workout_log.WorkoutLogSummary`. */
export interface WorkoutLogSummaryDto {
  id: string;
  program_assignment_id: string | null;
  workout_id: string | null;
  status: WorkoutLogStatusDto;
  scheduled_date: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_actual_minutes: number | null;
  notes: string | null;
  exercise_count: number;
  created_at: string;
}

/** Mirrors `app.schemas.workout_log.WorkoutLogPage`. */
export interface WorkoutLogPageDto {
  items: WorkoutLogSummaryDto[];
  total: number;
  limit: number;
  offset: number;
}

/*
 * ---------------------------------------------------------------------------
 * Nutrition domain (backend/app/schemas/nutrition.py).
 *
 * Macro Decimal fields are serialized by FastAPI/Pydantic as JSON *strings*
 * (e.g. `"520.00"`), never numbers — callers must coerce before arithmetic.
 * ---------------------------------------------------------------------------
 */

/** Mirrors `app.models.meal.MealType`. */
export type MealTypeDto =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "snack"
  | "pre_workout"
  | "post_workout"
  | "other";

/** Mirrors `app.schemas.nutrition.MealLogRead`. */
export interface MealLogReadDto {
  id: string;
  user_id: string;
  meal_id: string | null;
  name_snapshot: string;
  meal_type: MealTypeDto;
  calories: string | number;
  protein_g: string | number;
  carbs_g: string | number;
  fat_g: string | number;
  consumed_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Mirrors `app.schemas.nutrition.MealLogPage`. */
export interface MealLogPageDto {
  items: MealLogReadDto[];
  total: number;
  limit: number;
  offset: number;
}

/** Mirrors `app.schemas.nutrition.MacroBreakdown`. */
export interface MacroBreakdownDto {
  calories: string | number;
  protein_g: string | number;
  carbs_g: string | number;
  fat_g: string | number;
}

/** Mirrors `app.schemas.nutrition.DailyNutritionRead`. */
export interface DailyNutritionReadDto {
  targets: MacroBreakdownDto;
  actual: MacroBreakdownDto;
  adherence: Record<string, string>;
  summary_text: string;
  for_date: string;
}

/*
 * ---------------------------------------------------------------------------
 * Recovery domain (backend/app/schemas/recovery.py).
 *
 * `sleep_hours` / `readiness_score` Decimal fields are serialized by
 * FastAPI/Pydantic as JSON *strings* (e.g. `"7.50"`), never numbers —
 * callers must coerce before arithmetic.
 * ---------------------------------------------------------------------------
 */

/** Mirrors `app.ai.recovery_engine.ReadinessLevel`. */
export type ReadinessLevelDto = "low" | "moderate" | "high";

/** Mirrors `app.schemas.recovery.RecoveryCheckInCreate`. */
export interface RecoveryCheckInCreateRequest {
  checkin_date: string;
  sleep_hours: number | string;
  sleep_quality: number;
  soreness: number;
  fatigue: number;
  resting_heart_rate?: number | null;
  hrv_ms?: number | null;
  notes?: string | null;
}

/** Mirrors `app.schemas.recovery.RecoveryCheckInUpdate`. */
export interface RecoveryCheckInUpdateRequest {
  sleep_hours?: number | string | null;
  sleep_quality?: number | null;
  soreness?: number | null;
  fatigue?: number | null;
  resting_heart_rate?: number | null;
  hrv_ms?: number | null;
  notes?: string | null;
}

/** Mirrors `app.schemas.recovery.RecoveryCheckInRead`. */
export interface RecoveryCheckInReadDto {
  id: string;
  user_id: string;
  checkin_date: string;
  sleep_hours: string | number;
  sleep_quality: number;
  soreness: number;
  fatigue: number;
  resting_heart_rate: number | null;
  hrv_ms: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Mirrors `app.schemas.recovery.RecoveryCheckInPage`. */
export interface RecoveryCheckInPageDto {
  items: RecoveryCheckInReadDto[];
  total: number;
  limit: number;
  offset: number;
}

/** Mirrors `app.schemas.recovery.ReadinessRead`. */
export interface ReadinessReadDto {
  readiness_score: string | number;
  readiness_level: ReadinessLevelDto;
  recommendation_text: string;
  protocols: string[];
  for_date: string;
}

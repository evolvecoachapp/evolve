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

import type { FeatureFlagKey } from "../models";

/** Branded identifier for user-scoped entities. */
export type UserId = string;

/** Preference sections addressable for partial updates in future providers. */
export type PreferenceSection =
  | "units"
  | "theme"
  | "notifications"
  | "coach"
  | "recovery"
  | "workout"
  | "nutrition"
  | "privacy";

/** Compile-time list of all remote feature flag keys. */
export type FeatureFlagKeys = readonly FeatureFlagKey[];

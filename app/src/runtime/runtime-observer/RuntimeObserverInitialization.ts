/**
 * Ordered phases recorded when runtime observation starts successfully.
 */
export type RuntimeObserverPhase =
  | "bootstrap_ready_validated"
  | "services_wrapped"
  | "observation_active"
  | "observer_frozen";

export const RUNTIME_OBSERVER_PHASES = [
  "bootstrap_ready_validated",
  "services_wrapped",
  "observation_active",
  "observer_frozen",
] as const satisfies readonly RuntimeObserverPhase[];

export const RUNTIME_OBSERVER_WATCHED_SERVICES = [
  "AthleteIdentityService",
  "RuntimeEnvironmentService",
  "UnifiedWorkspaceService",
] as const;

export type RuntimeObserverWatchedService =
  (typeof RUNTIME_OBSERVER_WATCHED_SERVICES)[number];

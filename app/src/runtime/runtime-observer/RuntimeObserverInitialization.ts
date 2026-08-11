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

/**
 * Every service whose `build()` method `RuntimeObserver.start()` actually
 * wraps (Sprint 36.6 — kept in sync with the wrap calls in
 * `RuntimeObserver.ts`; previously listed only the first three services and
 * silently under-reported the domain-persistence services added in Sprint
 * 35.4, so `RuntimeObserverResult.watchedServices` misrepresented what was
 * actually being observed).
 */
export const RUNTIME_OBSERVER_WATCHED_SERVICES = [
  "AthleteIdentityService",
  "RuntimeEnvironmentService",
  "UnifiedWorkspaceService",
  "WorkoutRuntimePersistenceService",
  "NutritionRuntimePersistenceService",
  "RecoveryRuntimePersistenceService",
] as const;

export type RuntimeObserverWatchedService =
  (typeof RUNTIME_OBSERVER_WATCHED_SERVICES)[number];

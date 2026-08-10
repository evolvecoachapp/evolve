/**
 * Composition Root configuration.
 * Training Intelligence repositories remain in-memory; runtime persistence uses SQLite.
 */
export interface CompositionConfiguration {
  /** Repository backing for Training Intelligence pipeline: in-memory only. */
  readonly repositoryMode: "in-memory";
  /** Runtime persistence backing: SQLite repository adapters (Sprint 34.1). */
  readonly runtimePersistenceMode: "sqlite";
  /** Strategy source: default feature strategies. */
  readonly strategyMode: "default";
  /**
   * When true, register pipeline services as singletons (default).
   * Leaf helpers may still use transient lifecycle where appropriate.
   */
  readonly preferSingletons: boolean;
}

export const DEFAULT_COMPOSITION_CONFIGURATION: CompositionConfiguration = {
  repositoryMode: "in-memory",
  runtimePersistenceMode: "sqlite",
  strategyMode: "default",
  preferSingletons: true,
};

export function mergeCompositionConfiguration(
  overrides: Partial<CompositionConfiguration> = {},
): CompositionConfiguration {
  return {
    ...DEFAULT_COMPOSITION_CONFIGURATION,
    ...overrides,
    // Hard-lock unsupported modes for this sprint.
    repositoryMode: "in-memory",
    runtimePersistenceMode: "sqlite",
    strategyMode: "default",
  };
}

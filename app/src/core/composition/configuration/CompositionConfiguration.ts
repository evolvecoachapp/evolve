/**
 * Composition Root configuration.
 * Current implementations remain in-memory (no persistence / networking).
 */
export interface CompositionConfiguration {
  /** Repository backing: in-memory only for this foundation sprint. */
  readonly repositoryMode: "in-memory";
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
    strategyMode: "default",
  };
}

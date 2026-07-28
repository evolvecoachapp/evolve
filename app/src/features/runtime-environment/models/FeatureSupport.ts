/**
 * Immutable feature-support descriptors for Runtime Environment (Sprint 29.2).
 *
 * Declared feature keys only — not feature-flag evaluation or remote config.
 */
export interface FeatureSupport {
  readonly featureKeys: readonly string[];
}

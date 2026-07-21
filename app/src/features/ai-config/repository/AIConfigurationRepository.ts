import type { AIConfiguration } from "../models/AIConfiguration";
import type { ConfigurationValidationResult } from "../models/ConfigurationValidationResult";

/** Loaded configuration plus structured validation outcome. */
export interface AIConfigurationLoadResult {
  readonly configuration: AIConfiguration;
  readonly validation: ConfigurationValidationResult;
}

/**
 * Loads and validates AI configuration.
 *
 * Implementations must return immutable AIConfiguration and must never
 * expose raw environment variable maps.
 */
export interface AIConfigurationRepository {
  getConfiguration(): Promise<AIConfigurationLoadResult>;
}

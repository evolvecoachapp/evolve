import type { CompositionConfiguration } from "../configuration/CompositionConfiguration";
import {
  DEFAULT_COMPOSITION_CONFIGURATION,
  mergeCompositionConfiguration,
} from "../configuration/CompositionConfiguration";

/**
 * Provides immutable composition configuration to factories / bootstrap.
 */
export class ConfigurationProvider {
  private readonly configuration: CompositionConfiguration;

  constructor(overrides: Partial<CompositionConfiguration> = {}) {
    this.configuration = Object.freeze(
      mergeCompositionConfiguration(overrides),
    );
  }

  getConfiguration(): CompositionConfiguration {
    return this.configuration;
  }

  static defaults(): ConfigurationProvider {
    return new ConfigurationProvider(DEFAULT_COMPOSITION_CONFIGURATION);
  }
}

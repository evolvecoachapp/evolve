import type { AIConfiguration } from "../models/AIConfiguration";

const MASK = "***";

/**
 * Return a copy of configuration with API key material masked.
 *
 * No networking. No provider logic.
 */
export function maskSecrets(configuration: AIConfiguration): AIConfiguration {
  return Object.freeze({
    ...configuration,
    provider: Object.freeze({
      ...configuration.provider,
      apiKey:
        configuration.provider.apiKey == null ||
        configuration.provider.apiKey.length === 0
          ? configuration.provider.apiKey
          : MASK,
    }),
    model: Object.freeze({ ...configuration.model }),
    tokens: Object.freeze({ ...configuration.tokens }),
    retry: Object.freeze({ ...configuration.retry }),
    timeout: Object.freeze({ ...configuration.timeout }),
    environment: Object.freeze({ ...configuration.environment }),
  });
}

import type { EnvironmentConfiguration } from "./EnvironmentConfiguration";
import type { ModelConfiguration } from "./ModelConfiguration";
import type { ProviderConfiguration } from "./ProviderConfiguration";
import type { RetryConfiguration } from "./RetryConfiguration";
import type { TimeoutConfiguration } from "./TimeoutConfiguration";
import type { TokenConfiguration } from "./TokenConfiguration";

/**
 * Complete immutable AI configuration.
 *
 * Consumed by AIService via dependency injection.
 * Providers must never read environment variables directly.
 */
export interface AIConfiguration {
  readonly provider: ProviderConfiguration;
  readonly model: ModelConfiguration;
  readonly tokens: TokenConfiguration;
  readonly retry: RetryConfiguration;
  readonly timeout: TimeoutConfiguration;
  readonly environment: EnvironmentConfiguration;
}

/**
 * Environment-derived configuration metadata.
 *
 * Never contains raw API key values — only presence flags and non-secret
 * normalized settings. Secrets live on ProviderConfiguration.apiKey.
 */
export interface EnvironmentConfiguration {
  readonly provider: string | null;
  readonly model: string | null;
  readonly timeoutMs: number | null;
  readonly maxRetries: number | null;
  readonly maxOutputTokens: number | null;
  readonly hasOpenAIApiKey: boolean;
  readonly hasAnthropicApiKey: boolean;
  readonly hasGeminiApiKey: boolean;
}

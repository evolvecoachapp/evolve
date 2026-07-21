/** Default AI configuration values applied when environment is unset. */
export const AI_CONFIGURATION_DEFAULTS = Object.freeze({
  provider: "local",
  model: "local-default",
  timeoutMs: 30_000,
  maxRetries: 2,
  maxOutputTokens: 1_024,
});

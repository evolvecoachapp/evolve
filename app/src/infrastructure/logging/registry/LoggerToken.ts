/**
 * Canonical logger provider tokens.
 * Future providers (opentelemetry, sentry, datadog, azure-monitor,
 * grafana, elastic, console, file) register under additional tokens
 * without changing Domain.
 */
export const LOGGER_TOKENS = ["mock"] as const;

export type LoggerToken = (typeof LOGGER_TOKENS)[number];

export function isLoggerToken(value: string): value is LoggerToken {
  return (LOGGER_TOKENS as readonly string[]).includes(value);
}

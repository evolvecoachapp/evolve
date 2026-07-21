import { AI_CONFIGURATION_DEFAULTS } from "./defaults";

/**
 * Normalized environment values after reading process.env.
 *
 * Includes secret material for factory/repository use only.
 * Never returned directly to callers of AIConfigurationRepository.
 */
export interface LoadedEnvironment {
  readonly provider: string;
  readonly model: string;
  readonly timeoutMs: number;
  readonly maxRetries: number;
  readonly maxOutputTokens: number;
  readonly openAIApiKey: string | null;
  readonly anthropicApiKey: string | null;
  readonly geminiApiKey: string | null;
  readonly providerFromEnv: boolean;
  readonly modelFromEnv: boolean;
  readonly timeoutFromEnv: boolean;
  readonly maxRetriesFromEnv: boolean;
  readonly maxOutputTokensFromEnv: boolean;
}

export type EnvironmentSource = Record<string, string | undefined>;

/**
 * Reads and normalizes AI-related environment variables.
 *
 * Responsibilities: read, normalize, apply defaults.
 * Does not validate and contains no provider logic.
 */
export class EnvironmentLoader {
  load(source: EnvironmentSource = process.env): LoadedEnvironment {
    const providerRaw = normalizeString(source.AI_PROVIDER);
    const modelRaw = normalizeString(source.AI_MODEL);
    const timeoutRaw = normalizeString(source.AI_TIMEOUT);
    const retriesRaw = normalizeString(source.AI_MAX_RETRIES);
    const tokensRaw = normalizeString(source.AI_MAX_OUTPUT_TOKENS);

    const timeoutParsed = parsePositiveNumber(timeoutRaw);
    const retriesParsed = parseNonNegativeInteger(retriesRaw);
    const tokensParsed = parsePositiveInteger(tokensRaw);

    return Object.freeze({
      provider: providerRaw ?? AI_CONFIGURATION_DEFAULTS.provider,
      model: modelRaw ?? AI_CONFIGURATION_DEFAULTS.model,
      timeoutMs: timeoutParsed ?? AI_CONFIGURATION_DEFAULTS.timeoutMs,
      maxRetries: retriesParsed ?? AI_CONFIGURATION_DEFAULTS.maxRetries,
      maxOutputTokens: tokensParsed ?? AI_CONFIGURATION_DEFAULTS.maxOutputTokens,
      openAIApiKey: normalizeString(source.OPENAI_API_KEY),
      anthropicApiKey: normalizeString(source.ANTHROPIC_API_KEY),
      geminiApiKey: normalizeString(source.GEMINI_API_KEY),
      providerFromEnv: providerRaw != null,
      modelFromEnv: modelRaw != null,
      timeoutFromEnv: timeoutParsed != null,
      maxRetriesFromEnv: retriesParsed != null,
      maxOutputTokensFromEnv: tokensParsed != null,
    });
  }
}

function normalizeString(value: string | undefined): string | null {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parsePositiveNumber(value: string | null): number | null {
  if (value == null) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function parsePositiveInteger(value: string | null): number | null {
  const parsed = parsePositiveNumber(value);
  if (parsed == null || !Number.isInteger(parsed)) {
    return null;
  }
  return parsed;
}

function parseNonNegativeInteger(value: string | null): number | null {
  if (value == null) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

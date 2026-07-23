import {
  DEFAULT_OPENAI_MAX_RETRIES,
  DEFAULT_OPENAI_TIMEOUT_MS,
  OPENAI_API_BASE_URL,
} from "../models/OpenAIClientOptions";
import { DEFAULT_OPENAI_MODELS } from "../models/OpenAIModelConfiguration";
import type { OpenAIProviderConfiguration } from "../models/OpenAIProviderConfiguration";
import {
  DEFAULT_OPENAI_MODEL,
  DEFAULT_OPENAI_TEMPERATURE,
} from "../models/OpenAIProviderConfiguration";
import { freezeProviderConfiguration } from "./freezeObjects";
import { normalizeModelName } from "./normalizeModelName";

export type EnvironmentSource = Record<string, string | undefined>;

/**
 * Load OpenAI provider configuration from environment.
 *
 * Reads OPENAI_API_KEY, OPENAI_MODEL, OPENAI_TIMEOUT.
 * Optional: OPENAI_BASE_URL, OPENAI_ORG, OPENAI_MAX_RETRIES.
 */
export function loadOpenAIConfiguration(
  source: EnvironmentSource = process.env,
): OpenAIProviderConfiguration {
  const apiKey = normalizeString(source.OPENAI_API_KEY) ?? "";
  const modelRaw = normalizeString(source.OPENAI_MODEL);
  const defaultModelId = modelRaw
    ? normalizeModelName(modelRaw) || DEFAULT_OPENAI_MODEL
    : DEFAULT_OPENAI_MODEL;
  const timeoutMs =
    parsePositiveInteger(normalizeString(source.OPENAI_TIMEOUT)) ??
    DEFAULT_OPENAI_TIMEOUT_MS;
  const maxRetries =
    parseNonNegativeInteger(normalizeString(source.OPENAI_MAX_RETRIES)) ??
    DEFAULT_OPENAI_MAX_RETRIES;
  const baseURL =
    normalizeString(source.OPENAI_BASE_URL) ?? OPENAI_API_BASE_URL;
  const organization = normalizeString(source.OPENAI_ORG);

  return freezeProviderConfiguration({
    enabled: apiKey.length > 0,
    defaultModelId,
    models: DEFAULT_OPENAI_MODELS,
    client: {
      apiKey,
      baseURL,
      timeoutMs,
      organization,
      maxRetries,
    },
    defaultTemperature: DEFAULT_OPENAI_TEMPERATURE,
    defaultMaxOutputTokens: null,
  });
}

function normalizeString(value: string | undefined): string | null {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parsePositiveInteger(value: string | null): number | null {
  if (value == null) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
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

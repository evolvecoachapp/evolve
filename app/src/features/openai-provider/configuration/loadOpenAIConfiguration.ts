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
  DEFAULT_OPENAI_TOP_P,
} from "../models/OpenAIProviderConfiguration";
import {
  DEFAULT_OPENAI_RETRY_POLICY,
  type OpenAIRetryPolicy,
} from "../models/OpenAIRetryPolicy";
import { freezeProviderConfiguration } from "../utils/freezeObjects";
import { normalizeModelName } from "../utils/normalizeModelName";

export type EnvironmentSource = Record<string, string | undefined>;

/**
 * Load immutable OpenAI provider configuration from environment.
 *
 * Required: OPENAI_API_KEY
 * Defaults: OPENAI_MODEL, OPENAI_TIMEOUT, temperature, topP, retry, streaming
 * Optional: OPENAI_BASE_URL, OPENAI_ORG, OPENAI_PROJECT, OPENAI_MAX_RETRIES,
 *           OPENAI_TOP_P, OPENAI_TEMPERATURE, OPENAI_STREAMING,
 *           OPENAI_RETRY_INITIAL_DELAY_MS, OPENAI_RETRY_MAX_DELAY_MS
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
  const project = normalizeString(source.OPENAI_PROJECT);
  const defaultTemperature =
    parseFloatInRange(normalizeString(source.OPENAI_TEMPERATURE), 0, 2) ??
    DEFAULT_OPENAI_TEMPERATURE;
  const defaultTopP =
    parseFloatInRange(normalizeString(source.OPENAI_TOP_P), 0, 1) ??
    DEFAULT_OPENAI_TOP_P;
  const streaming = parseBoolean(normalizeString(source.OPENAI_STREAMING)) ?? false;
  const retryPolicy = loadRetryPolicy(source, maxRetries);

  return freezeProviderConfiguration({
    enabled: apiKey.length > 0,
    defaultModelId,
    models: DEFAULT_OPENAI_MODELS,
    client: {
      apiKey,
      baseURL,
      timeoutMs,
      organization,
      project,
      maxRetries,
      retryPolicy,
    },
    defaultTemperature,
    defaultTopP,
    defaultMaxOutputTokens: null,
    streaming,
    retryPolicy,
  });
}

function loadRetryPolicy(
  source: EnvironmentSource,
  maxRetries: number,
): OpenAIRetryPolicy {
  return Object.freeze({
    maxRetries,
    initialDelayMs:
      parsePositiveInteger(
        normalizeString(source.OPENAI_RETRY_INITIAL_DELAY_MS),
      ) ?? DEFAULT_OPENAI_RETRY_POLICY.initialDelayMs,
    maxDelayMs:
      parsePositiveInteger(normalizeString(source.OPENAI_RETRY_MAX_DELAY_MS)) ??
      DEFAULT_OPENAI_RETRY_POLICY.maxDelayMs,
    multiplier: DEFAULT_OPENAI_RETRY_POLICY.multiplier,
    jitter: DEFAULT_OPENAI_RETRY_POLICY.jitter,
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

function parseFloatInRange(
  value: string | null,
  min: number,
  max: number,
): number | null {
  if (value == null) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return null;
  }
  return parsed;
}

function parseBoolean(value: string | null): boolean | null {
  if (value == null) {
    return null;
  }
  const normalized = value.toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }
  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }
  return null;
}

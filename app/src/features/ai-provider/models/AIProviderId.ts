/**
 * Provider identifier — lowercase slug used for registry resolution.
 *
 * Reserved ids are architecture placeholders only; this module ships
 * no concrete OpenAI / Anthropic / Gemini / Ollama implementations.
 */
export type AIProviderId = string;

export const AIProviderIds = Object.freeze({
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GEMINI: "gemini",
  OLLAMA: "ollama",
} as const);

export type ReservedAIProviderId =
  (typeof AIProviderIds)[keyof typeof AIProviderIds];

export const RESERVED_PROVIDER_IDS: readonly ReservedAIProviderId[] =
  Object.freeze([
    AIProviderIds.OPENAI,
    AIProviderIds.ANTHROPIC,
    AIProviderIds.GEMINI,
    AIProviderIds.OLLAMA,
  ]);

const PROVIDER_ID_PATTERN = /^[a-z][a-z0-9_-]{1,63}$/;

export function isValidProviderIdFormat(id: string): boolean {
  return PROVIDER_ID_PATTERN.test(id);
}

export function isReservedProviderId(id: string): boolean {
  return (RESERVED_PROVIDER_IDS as readonly string[]).includes(id);
}

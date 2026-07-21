/** Supported AI backend identifiers. */
export type AIProviderType = "openai" | "anthropic" | "gemini" | "local";

export const AI_PROVIDER_TYPES: readonly AIProviderType[] = Object.freeze([
  "openai",
  "anthropic",
  "gemini",
  "local",
]);

/**
 * Immutable model configuration for OpenAI execution.
 */
export interface OpenAIModelConfiguration {
  readonly modelId: string;
  readonly displayName: string;
  readonly family: string | null;
  readonly available: boolean;
  readonly maxOutputTokens: number | null;
  readonly contextWindow: number | null;
}

export const DEFAULT_OPENAI_MODELS: readonly OpenAIModelConfiguration[] =
  Object.freeze([
    Object.freeze({
      modelId: "gpt-4o",
      displayName: "GPT-4o",
      family: "gpt-4o",
      available: true,
      maxOutputTokens: 16384,
      contextWindow: 128000,
    }),
    Object.freeze({
      modelId: "gpt-4o-mini",
      displayName: "GPT-4o mini",
      family: "gpt-4o-mini",
      available: true,
      maxOutputTokens: 16384,
      contextWindow: 128000,
    }),
    Object.freeze({
      modelId: "gpt-4.1",
      displayName: "GPT-4.1",
      family: "gpt-4.1",
      available: true,
      maxOutputTokens: 32768,
      contextWindow: 1047576,
    }),
    Object.freeze({
      modelId: "gpt-4.1-mini",
      displayName: "GPT-4.1 mini",
      family: "gpt-4.1-mini",
      available: true,
      maxOutputTokens: 32768,
      contextWindow: 1047576,
    }),
  ]);

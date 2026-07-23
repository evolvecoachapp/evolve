import type { OpenAIMessage } from "./OpenAIMessage";

/**
 * Immutable OpenAI Chat Completions request (provider-layer only).
 *
 * Built by OpenAIRequestBuilder / PromptPackageMapper —
 * never leaked outside openai-provider.
 */
export interface OpenAIRequest {
  readonly model: string;
  readonly messages: readonly OpenAIMessage[];
  readonly temperature: number | null;
  readonly maxTokens: number | null;
  readonly topP: number | null;
  readonly stop: readonly string[] | null;
  readonly stream: boolean;
  readonly timeoutMs: number | null;
}

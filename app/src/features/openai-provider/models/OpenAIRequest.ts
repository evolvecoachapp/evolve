import type { OpenAIMessage } from "./OpenAIMessage";

/**
 * Immutable OpenAI Chat Completions request (provider-layer only).
 *
 * Built by PromptPackageMapper — never leaked outside openai-provider.
 */
export interface OpenAIRequest {
  readonly model: string;
  readonly messages: readonly OpenAIMessage[];
  readonly temperature: number | null;
  readonly maxTokens: number | null;
  readonly topP: number | null;
  readonly stop: readonly string[] | null;
  readonly stream: false;
  readonly timeoutMs: number | null;
}

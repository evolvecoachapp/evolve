import type { OpenAIChoice } from "./OpenAIChoice";
import type { OpenAIUsage } from "./OpenAIUsage";

/**
 * Immutable OpenAI Chat Completions response (provider-layer only).
 *
 * Produced by OpenAIClient from SDK payloads — never exposes SDK types.
 */
export interface OpenAIResponse {
  readonly id: string;
  readonly model: string;
  readonly choices: readonly OpenAIChoice[];
  readonly usage: OpenAIUsage;
  readonly createdAt: string;
  readonly rawFinishReason: string | null;
}

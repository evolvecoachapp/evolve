/**
 * Internal OpenAI Chat Completions shapes.
 *
 * Never exported from the AI public barrel — stay inside the provider.
 */

export interface OpenAIChatMessage {
  readonly role: "system" | "user" | "assistant";
  readonly content: string;
}

export interface OpenAIChatCompletionsRequest {
  readonly model: string;
  readonly messages: readonly OpenAIChatMessage[];
  readonly temperature?: number;
  readonly max_tokens?: number;
  readonly stream: false;
}

export interface OpenAIChatCompletionsChoice {
  readonly index: number;
  readonly message?: {
    readonly role?: string;
    readonly content?: string | null;
  };
  readonly finish_reason?: string | null;
}

export interface OpenAIChatCompletionsUsage {
  readonly prompt_tokens?: number;
  readonly completion_tokens?: number;
  readonly total_tokens?: number;
}

export interface OpenAIChatCompletionsResponse {
  readonly id?: string;
  readonly model?: string;
  readonly choices?: readonly OpenAIChatCompletionsChoice[];
  readonly usage?: OpenAIChatCompletionsUsage;
}

export const OPENAI_API_BASE_URL = "https://api.openai.com/v1";
export const OPENAI_DEFAULT_TEMPERATURE = 0.7;

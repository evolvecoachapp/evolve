/**
 * Immutable OpenAI client options (secrets stay in this layer).
 */
export interface OpenAIClientOptions {
  readonly apiKey: string;
  readonly baseURL: string | null;
  readonly timeoutMs: number;
  readonly organization: string | null;
  readonly maxRetries: number;
}

export const DEFAULT_OPENAI_TIMEOUT_MS = 30_000;
export const DEFAULT_OPENAI_MAX_RETRIES = 0;
export const OPENAI_API_BASE_URL = "https://api.openai.com/v1";

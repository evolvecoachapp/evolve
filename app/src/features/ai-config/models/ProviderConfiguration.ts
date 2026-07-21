import type { AIProviderType } from "../../ai/models/AIProviderType";

/** Active provider selection and secret material for that provider. */
export interface ProviderConfiguration {
  readonly type: AIProviderType;
  /** Selected provider API key, or null when unavailable / local. */
  readonly apiKey: string | null;
}

import type { AIModel } from "./AIModel";
import type { AIProviderType } from "./AIProviderType";

/** Static identity metadata for a provider implementation. */
export interface AIProviderInfo {
  readonly type: AIProviderType;
  readonly name: string;
  readonly model: AIModel;
}

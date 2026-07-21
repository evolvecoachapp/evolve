import type { AIProviderType } from "./AIProviderType";

/** Model descriptor returned by a provider. */
export interface AIModel {
  readonly id: string;
  readonly name: string;
  readonly provider: AIProviderType;
}

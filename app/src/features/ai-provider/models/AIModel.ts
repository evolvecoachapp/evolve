import type { AIProviderId } from "./AIProviderId";

/**
 * Immutable model selection descriptor for an AI request.
 */
export interface AIModel {
  readonly id: string;
  readonly providerId: AIProviderId | null;
  readonly displayName: string;
  readonly family: string | null;
  readonly version: string | null;
}

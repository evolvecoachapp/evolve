import type { IAIProvider } from "./IAIProvider";

/**
 * Reasoning-capable provider extension (contract only).
 */
export interface IReasoningProvider extends IAIProvider {
  supportsReasoning(): boolean;
}

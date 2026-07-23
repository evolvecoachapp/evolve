import type { IAIProvider } from "./IAIProvider";

/**
 * Embedding-capable provider extension (contract only).
 */
export interface IEmbeddingProvider extends IAIProvider {
  supportsEmbeddings(): boolean;
}

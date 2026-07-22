import type { AIExecutionContext } from "../models/AIExecutionContext";
import type { AIRequest } from "../models/AIRequest";
import type { AIResponseChunk } from "../models/AIResponseChunk";
import type { IAIProvider } from "./IAIProvider";

/**
 * Streaming provider contract for future streaming adapters.
 *
 * No streaming execution in this foundation sprint.
 */
export interface IAIStreamingProvider extends IAIProvider {
  supportsStreaming(): boolean;

  /**
   * Future streaming entrypoint — not invoked by AIProviderEngine.
   */
  stream?(
    request: AIRequest,
    context: AIExecutionContext,
  ): AsyncIterable<AIResponseChunk>;
}

import type { StreamChunk } from "../models/StreamChunk";
import type { StreamRequest } from "../models/StreamRequest";
import type { AIProviderId } from "../../ai-provider/models/AIProviderId";

/**
 * Provider-agnostic stream source boundary.
 *
 * Concrete providers (OpenAI, etc.) are wrapped externally.
 * The Streaming Engine never imports provider SDKs.
 */
export interface IStreamSource {
  readonly providerId: AIProviderId;

  /**
   * Yield provider-agnostic stream chunks for a request.
   */
  stream(request: StreamRequest): AsyncIterable<StreamChunk>;
}

/**
 * Resolve a stream source by provider id.
 */
export interface IStreamSourceResolver {
  resolve(providerId: AIProviderId): IStreamSource | null;
}

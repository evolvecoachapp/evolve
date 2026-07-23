import type { AIResponse } from "../../ai-provider/models/AIResponse";
import type { CoachMetadata } from "../models/CoachMetadata";
import { freezeMetadata } from "../utils/freezeObjects";

/**
 * Parse provider-agnostic metadata from an AIResponse.
 */
export class MetadataParser {
  parse(response: AIResponse): CoachMetadata {
    return freezeMetadata({
      tags: Object.freeze([...response.metadata.tags]),
      attributes: Object.freeze({ ...response.metadata.attributes }),
      providerId: response.providerId,
      modelId: response.modelId,
      sourceResponseId: response.id,
      sourceRequestId: response.requestId,
      finishReason: response.finishReason,
    });
  }
}

export const metadataParser = new MetadataParser();

import type { CoachFormattingResult } from "../models/CoachFormattingResult";
import { CoachOutputFormats } from "../models/CoachFormatting";
import type { CoachResponse } from "../models/CoachResponse";
import { freezeFormattingResult } from "../utils/freezeObjects";

/**
 * Future-facing JSON formatter placeholder.
 * Produces a deterministic JSON string of the CoachResponse.
 */
export class FutureJsonFormatter {
  format(
    response: CoachResponse,
    formattedAt: string,
  ): CoachFormattingResult {
    const content = JSON.stringify(response, null, 2);
    return freezeFormattingResult({
      responseId: response.id,
      format: CoachOutputFormats.JSON,
      content,
      sections: Object.freeze({
        json: content,
      }),
      response,
      formattedAt,
    });
  }
}

export const futureJsonFormatter = new FutureJsonFormatter();

import type { CoachFormattingResult } from "../models/CoachFormattingResult";
import { CoachOutputFormats } from "../models/CoachFormatting";
import type { CoachResponse } from "../models/CoachResponse";
import { freezeFormattingResult } from "../utils/freezeObjects";
import { previewText } from "../utils/formattingHelpers";

/**
 * Format CoachResponse as a card-oriented text payload (no UI widgets).
 */
export class CardFormatter {
  format(
    response: CoachResponse,
    formattedAt: string,
  ): CoachFormattingResult {
    const title = previewText(response.message.text, 80);
    const subtitle = `Intent: ${response.intent} · Confidence: ${response.confidence.label}`;
    const bullets = [
      ...response.recommendations.slice(0, 3).map((r) => r.text),
      ...response.actions.slice(0, 2).map((a) => a.label),
    ];

    const content = [
      `CARD_TITLE: ${title}`,
      `CARD_SUBTITLE: ${subtitle}`,
      ...bullets.map((b, i) => `CARD_BULLET_${i + 1}: ${b}`),
    ].join("\n");

    return freezeFormattingResult({
      responseId: response.id,
      format: CoachOutputFormats.CARD,
      content,
      sections: Object.freeze({
        title,
        subtitle,
        bullets: bullets.join("\n"),
      }),
      response,
      formattedAt,
    });
  }
}

export const cardFormatter = new CardFormatter();

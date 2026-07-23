import type { CoachFormattingResult } from "../models/CoachFormattingResult";
import type { CoachOutputFormat } from "../models/CoachFormatting";
import { CoachOutputFormats } from "../models/CoachFormatting";
import type { CoachResponse } from "../models/CoachResponse";
import { CardFormatter } from "./CardFormatter";
import { FutureJsonFormatter } from "./FutureJsonFormatter";
import { MarkdownFormatter } from "./MarkdownFormatter";
import { PlainTextFormatter } from "./PlainTextFormatter";
import { RichContentFormatter } from "./RichContentFormatter";

/**
 * Select a formatter by preferred output format.
 */
export class ResponseFormatterRouter {
  constructor(
    private readonly markdown = new MarkdownFormatter(),
    private readonly plain = new PlainTextFormatter(),
    private readonly rich = new RichContentFormatter(),
    private readonly card = new CardFormatter(),
    private readonly json = new FutureJsonFormatter(),
  ) {}

  format(
    response: CoachResponse,
    format: CoachOutputFormat | null | undefined,
    formattedAt: string,
  ): CoachFormattingResult {
    const preferred = format ?? response.formatting.preferredFormat;
    switch (preferred) {
      case CoachOutputFormats.PLAIN:
        return this.plain.format(response, formattedAt);
      case CoachOutputFormats.RICH:
        return this.rich.format(response, formattedAt);
      case CoachOutputFormats.CARD:
        return this.card.format(response, formattedAt);
      case CoachOutputFormats.JSON:
        return this.json.format(response, formattedAt);
      case CoachOutputFormats.MARKDOWN:
      default:
        return this.markdown.format(response, formattedAt);
    }
  }
}

export const responseFormatterRouter = new ResponseFormatterRouter();

import { MarkdownFormatter } from "../formatters/MarkdownFormatter";
import { PlainTextFormatter } from "../formatters/PlainTextFormatter";
import { RichContentFormatter } from "../formatters/RichContentFormatter";
import { CardFormatter } from "../formatters/CardFormatter";
import { FutureJsonFormatter } from "../formatters/FutureJsonFormatter";
import {
  createAIResponseFixture,
  createTestFormatterHarness,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { CoachOutputFormats } from "../models/CoachFormatting";

describe("response-formatter formatters", () => {
  const { service } = createTestFormatterHarness();
  const response = service.buildCoachResponse(createAIResponseFixture(), {
    createdAt: FIXED_TIMESTAMP,
  });

  it("MarkdownFormatter emits markdown sections", () => {
    const result = new MarkdownFormatter().format(response, FIXED_TIMESTAMP);
    expect(result.format).toBe(CoachOutputFormats.MARKDOWN);
    expect(result.content).toContain("## Recommendations");
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("PlainTextFormatter emits plain text", () => {
    const result = new PlainTextFormatter().format(response, FIXED_TIMESTAMP);
    expect(result.format).toBe(CoachOutputFormats.PLAIN);
    expect(result.content).toContain("Recommendations:");
  });

  it("RichContentFormatter emits structured JSON-like content", () => {
    const result = new RichContentFormatter().format(response, FIXED_TIMESTAMP);
    expect(result.format).toBe(CoachOutputFormats.RICH);
    expect(result.content).toContain('"kind": "rich"');
  });

  it("CardFormatter emits card payload lines", () => {
    const result = new CardFormatter().format(response, FIXED_TIMESTAMP);
    expect(result.format).toBe(CoachOutputFormats.CARD);
    expect(result.content).toContain("CARD_TITLE:");
  });

  it("FutureJsonFormatter serializes CoachResponse", () => {
    const result = new FutureJsonFormatter().format(response, FIXED_TIMESTAMP);
    expect(result.format).toBe(CoachOutputFormats.JSON);
    expect(JSON.parse(result.content).id).toBe(response.id);
  });
});

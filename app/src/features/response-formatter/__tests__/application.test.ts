import {
  buildCoachResponse,
  formatResponse,
  summarizeResponse,
  validateResponse,
} from "../application";
import {
  createAIResponseFixture,
  createPlainAIResponseFixture,
  createTestFormatterHarness,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { CoachOutputFormats } from "../models/CoachFormatting";

describe("response-formatter application", () => {
  it("formatResponse returns package via public API", () => {
    const { service } = createTestFormatterHarness();
    const pkg = formatResponse({
      service,
      response: createAIResponseFixture(),
      createdAt: FIXED_TIMESTAMP,
      outputFormat: CoachOutputFormats.MARKDOWN,
    });

    expect(pkg.response.message.text).toContain("controlled tempo");
    expect(pkg.formatting?.format).toBe(CoachOutputFormats.MARKDOWN);
    expect(pkg.validationIssues).toHaveLength(0);
    expect(Object.isFrozen(pkg.response)).toBe(true);
  });

  it("buildCoachResponse builds immutable CoachResponse", () => {
    const { service } = createTestFormatterHarness();
    const response = buildCoachResponse({
      service,
      response: createAIResponseFixture(),
      createdAt: FIXED_TIMESTAMP,
      responseId: "coach-app:1",
    });

    expect(response.id).toBe("coach-app:1");
    expect(response.recommendations.length).toBe(3);
    expect(response.metadata.providerId).toBe("openai");
  });

  it("summarizeResponse and validateResponse work on plain content", () => {
    const { service } = createTestFormatterHarness();
    const response = buildCoachResponse({
      service,
      response: createPlainAIResponseFixture(),
      createdAt: FIXED_TIMESTAMP,
    });

    const summary = summarizeResponse({ service, response });
    expect(summary.messagePreview).toContain("recovery");
    expect(summary.recommendationCount).toBe(0);
    expect(validateResponse({ service, response })).toHaveLength(0);
  });
});

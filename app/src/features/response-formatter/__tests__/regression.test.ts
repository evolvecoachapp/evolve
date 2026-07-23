import { buildCoachResponse } from "../application";
import {
  createAIResponseFixture,
  createTestFormatterHarness,
  FIXED_TIMESTAMP,
  STRUCTURED_COACH_CONTENT,
} from "../testSupport/fixtures";

describe("response-formatter regression", () => {
  it("identical AIResponse content yields identical CoachResponse shape", () => {
    const { service } = createTestFormatterHarness();
    const a = buildCoachResponse({
      service,
      response: createAIResponseFixture({
        id: "ai-resp:reg-a",
        content: STRUCTURED_COACH_CONTENT,
      }),
      createdAt: FIXED_TIMESTAMP,
      responseId: "coach:reg",
    });
    const b = buildCoachResponse({
      service,
      response: createAIResponseFixture({
        id: "ai-resp:reg-b",
        content: STRUCTURED_COACH_CONTENT,
      }),
      createdAt: FIXED_TIMESTAMP,
      responseId: "coach:reg",
    });

    expect(a.message.text).toBe(b.message.text);
    expect(a.recommendations.map((r) => r.text)).toEqual(
      b.recommendations.map((r) => r.text),
    );
    expect(a.confidence.score).toBe(b.confidence.score);
    expect(a.intent).toBe(b.intent);
  });

  it("empty content still produces a frozen response object", () => {
    const { service } = createTestFormatterHarness();
    const response = buildCoachResponse({
      service,
      response: createAIResponseFixture({
        id: "ai-resp:empty",
        content: "",
      }),
      createdAt: FIXED_TIMESTAMP,
    });

    expect(Object.isFrozen(response)).toBe(true);
    expect(response.message.text).toBe("");
  });
});

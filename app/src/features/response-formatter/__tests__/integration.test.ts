import {
  buildCoachResponse,
  formatResponse,
} from "../application";
import {
  createAIResponseFixture,
  createTestFormatterHarness,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { CoachOutputFormats } from "../models/CoachFormatting";

describe("response-formatter integration", () => {
  it("AIResponse → CoachResponse remains provider-agnostic", () => {
    const { service } = createTestFormatterHarness();

    const openaiLike = createAIResponseFixture({
      providerId: "openai",
      modelId: "gpt-test",
    });
    const anthropicLike = createAIResponseFixture({
      id: "ai-resp:anthropic",
      providerId: "anthropic",
      modelId: "claude-test",
    });
    const geminiLike = createAIResponseFixture({
      id: "ai-resp:gemini",
      providerId: "gemini",
      modelId: "gemini-test",
    });
    const ollamaLike = createAIResponseFixture({
      id: "ai-resp:ollama",
      providerId: "ollama",
      modelId: "llama-test",
    });

    for (const ai of [openaiLike, anthropicLike, geminiLike, ollamaLike]) {
      const coach = buildCoachResponse({
        service,
        response: ai,
        createdAt: FIXED_TIMESTAMP,
      });
      expect(coach.sourceResponseId).toBe(ai.id);
      expect(coach.metadata.providerId).toBe(ai.providerId);
      expect(coach.recommendations.length).toBeGreaterThan(0);
    }
  });

  it("formatResponse pipeline produces snapshot + formatting", () => {
    const { service } = createTestFormatterHarness();
    const pkg = formatResponse({
      service,
      response: createAIResponseFixture(),
      createdAt: FIXED_TIMESTAMP,
      outputFormat: CoachOutputFormats.CARD,
    });

    expect(pkg.snapshot.statistics.recommendationCount).toBe(3);
    expect(pkg.formatting?.format).toBe(CoachOutputFormats.CARD);
    expect(pkg.parsing.sections.length).toBeGreaterThan(5);
  });
});

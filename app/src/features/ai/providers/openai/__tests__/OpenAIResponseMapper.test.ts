import { AIError } from "../../../models/AIError";
import { OpenAIResponseMapper } from "../OpenAIResponseMapper";

const model = Object.freeze({
  id: "gpt-4o-mini",
  name: "gpt-4o-mini",
  provider: "openai" as const,
});

describe("OpenAIResponseMapper", () => {
  it("maps assistant message, usage, finish reason, and provider info", () => {
    const response = OpenAIResponseMapper.map(
      {
        id: "chatcmpl-123",
        model: "gpt-4o-mini-2024",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "Train easy today." },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      },
      {
        model,
        generatedAt: "2026-07-22T00:00:00.000Z",
      },
    );

    expect(response.message.role).toBe("assistant");
    expect(response.message.content).toBe("Train easy today.");
    expect(response.message.id).toBe("msg-chatcmpl-123");
    expect(response.finishReason).toBe("stop");
    expect(response.usage).toEqual({
      promptTokens: 10,
      completionTokens: 5,
      totalTokens: 15,
    });
    expect(response.provider).toBe("openai");
    expect(response.model.id).toBe("gpt-4o-mini-2024");
    expect(response.generatedAt).toBe("2026-07-22T00:00:00.000Z");
  });

  it("maps length finish reason", () => {
    const response = OpenAIResponseMapper.map(
      {
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "truncated" },
            finish_reason: "length",
          },
        ],
      },
      { model, generatedAt: "2026-07-22T00:00:00.000Z" },
    );

    expect(response.finishReason).toBe("length");
  });

  it("throws AIError when assistant content is missing", () => {
    expect(() =>
      OpenAIResponseMapper.map(
        { choices: [{ index: 0, message: { role: "assistant", content: "" } }] },
        { model, generatedAt: "2026-07-22T00:00:00.000Z" },
      ),
    ).toThrow(AIError);
  });
});

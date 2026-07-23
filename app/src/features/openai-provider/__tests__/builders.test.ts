import { OpenAIRequestBuilder } from "../builders/OpenAIRequestBuilder";
import { OpenAIResponseBuilder } from "../builders/OpenAIResponseBuilder";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("openai-provider builders", () => {
  it("builds frozen OpenAIRequest", () => {
    const request = new OpenAIRequestBuilder()
      .withModel("gpt-4o")
      .withMessages([
        Object.freeze({ role: "system", content: "sys" }),
        Object.freeze({ role: "user", content: "hi" }),
      ])
      .withTemperature(0.2)
      .withMaxTokens(256)
      .build();

    expect(Object.isFrozen(request)).toBe(true);
    expect(request.stream).toBe(false);
    expect(request.model).toBe("gpt-4o");
  });

  it("builds frozen OpenAIResponse", () => {
    const response = new OpenAIResponseBuilder()
      .withId("chatcmpl-1")
      .withModel("gpt-4o-mini")
      .withChoices([
        Object.freeze({
          index: 0,
          message: Object.freeze({
            role: "assistant" as const,
            content: "ok",
          }),
          finishReason: "stop",
        }),
      ])
      .withUsage(
        Object.freeze({
          promptTokens: 1,
          completionTokens: 1,
          totalTokens: 2,
        }),
      )
      .withCreatedAt(FIXED_TIMESTAMP)
      .withRawFinishReason("stop")
      .build();

    expect(Object.isFrozen(response)).toBe(true);
    expect(response.choices[0]?.message.content).toBe("ok");
  });
});

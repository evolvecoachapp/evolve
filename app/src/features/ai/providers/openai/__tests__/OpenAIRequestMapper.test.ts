import { createAIRequest, createChatMessage } from "../../../testSupport/fixtures";
import { OpenAIRequestMapper } from "../OpenAIRequestMapper";

describe("OpenAIRequestMapper", () => {
  it("maps system, user, and assistant messages", () => {
    const request = createAIRequest({
      messages: Object.freeze([
        Object.freeze({
          id: "s",
          role: "system" as const,
          content: "You are a coach",
          createdAt: "2026-07-22T00:00:00.000Z",
        }),
        createChatMessage({ id: "u", role: "user", content: "Hello" }),
        createChatMessage({
          id: "a",
          role: "assistant",
          content: "Hi there",
        }),
      ]),
    });

    const payload = OpenAIRequestMapper.map(request, {
      model: "gpt-4o-mini",
      maxOutputTokens: 512,
      temperature: 0.2,
    });

    expect(payload.model).toBe("gpt-4o-mini");
    expect(payload.max_tokens).toBe(512);
    expect(payload.temperature).toBe(0.2);
    expect(payload.stream).toBe(false);
    expect(payload.messages).toEqual([
      { role: "system", content: "You are a coach" },
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there" },
    ]);
  });

  it("applies default temperature when omitted", () => {
    const payload = OpenAIRequestMapper.map(createAIRequest(), {
      model: "gpt-4o-mini",
      maxOutputTokens: 1024,
    });

    expect(payload.temperature).toBe(0.7);
  });

  it("defaults streaming to false", () => {
    const payload = OpenAIRequestMapper.map(createAIRequest(), {
      model: "gpt-4o-mini",
      maxOutputTokens: 100,
    });

    expect(payload.stream).toBe(false);
  });

  it("can enable streaming when requested", () => {
    const payload = OpenAIRequestMapper.map(createAIRequest(), {
      model: "gpt-4o-mini",
      maxOutputTokens: 100,
      stream: true,
    });

    expect(payload.stream).toBe(true);
  });
});

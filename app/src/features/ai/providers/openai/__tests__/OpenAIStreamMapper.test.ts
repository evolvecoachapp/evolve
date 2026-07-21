import { OpenAIProvider } from "../OpenAIProvider";
import { OpenAIStreamMapper } from "../OpenAIStreamMapper";

describe("OpenAIStreamMapper", () => {
  it("parses SSE data lines and [DONE]", () => {
    expect(OpenAIStreamMapper.parseSseDataLine(": keep-alive")).toBeNull();
    expect(OpenAIStreamMapper.parseSseDataLine("data: [DONE]")).toBe("done");
    expect(
      OpenAIStreamMapper.parseSseDataLine(
        'data: {"id":"chatcmpl-1","choices":[{"delta":{"content":"Hi"}}]}',
      ),
    ).toMatchObject({
      id: "chatcmpl-1",
      choices: [{ delta: { content: "Hi" } }],
    });
  });

  it("maps delta content into AIStreamEvent chunks", () => {
    const event = OpenAIStreamMapper.mapDelta(
      {
        choices: [{ delta: { content: "Hello" } }],
      },
      {
        sessionId: "stream-1",
        messageId: "msg-1",
        createdAt: "2026-07-22T00:00:00.000Z",
        chunkIndex: 0,
      },
    );

    expect(event).toEqual({
      type: "chunk",
      sessionId: "stream-1",
      chunk: {
        id: "stream-1-chunk-0",
        delta: "Hello",
        index: 0,
        createdAt: "2026-07-22T00:00:00.000Z",
      },
    });
  });

  it("maps SSE lines into a full AIStreamEvent sequence", () => {
    const events = OpenAIProvider.mapSseLines(
      [
        'data: {"choices":[{"delta":{"content":"Rest"}}]}',
        'data: {"choices":[{"delta":{"content":" now"},"finish_reason":"stop"}]}',
        "data: [DONE]",
      ],
      {
        sessionId: "stream-openai",
        messageId: "msg-openai",
        createdAt: "2026-07-22T00:00:00.000Z",
        fallbackUsage: {
          promptTokens: 1,
          completionTokens: 2,
          totalTokens: 3,
        },
      },
    );

    expect(events[0]?.type).toBe("start");
    expect(events.some((event) => event.type === "chunk")).toBe(true);
    expect(events.some((event) => event.type === "done")).toBe(true);
  });
});

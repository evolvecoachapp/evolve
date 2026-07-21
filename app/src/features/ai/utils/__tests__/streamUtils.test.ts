import { aggregateChunks } from "../aggregateChunks";
import { streamToResponse } from "../streamToResponse";
import { validateChunk } from "../validateChunk";

const FIXED_TIMESTAMP = "2026-07-22T00:00:00.000Z";

describe("stream utilities", () => {
  describe("aggregateChunks", () => {
    it("concatenates deltas in index order", () => {
      const content = aggregateChunks([
        {
          id: "c2",
          delta: "world",
          index: 2,
          createdAt: FIXED_TIMESTAMP,
        },
        {
          id: "c0",
          delta: "Hello",
          index: 0,
          createdAt: FIXED_TIMESTAMP,
        },
        {
          id: "c1",
          delta: " ",
          index: 1,
          createdAt: FIXED_TIMESTAMP,
        },
      ]);

      expect(content).toBe("Hello world");
    });
  });

  describe("validateChunk", () => {
    it("accepts a valid chunk", () => {
      expect(
        validateChunk({
          id: "chunk-1",
          delta: "Hi",
          index: 0,
          createdAt: FIXED_TIMESTAMP,
        }),
      ).toEqual([]);
    });

    it("flags structural issues", () => {
      const issues = validateChunk({
        id: "",
        delta: null as unknown as string,
        index: -1,
        createdAt: "",
      });

      expect(issues).toEqual(
        expect.arrayContaining([
          "invalid_id",
          "invalid_delta",
          "invalid_index",
          "invalid_created_at",
        ]),
      );
    });
  });

  describe("streamToResponse", () => {
    it("builds AIResponse from aggregated chunks", () => {
      const response = streamToResponse({
        messageId: "msg-1",
        chunks: [
          {
            id: "c0",
            delta: "Train",
            index: 0,
            createdAt: FIXED_TIMESTAMP,
          },
          {
            id: "c1",
            delta: " legs",
            index: 1,
            createdAt: FIXED_TIMESTAMP,
          },
        ],
        model: {
          id: "local-stub",
          name: "Local Stub",
          provider: "local",
        },
        provider: "local",
        finishReason: "stop",
        usage: {
          promptTokens: 10,
          completionTokens: 4,
          totalTokens: 14,
        },
        generatedAt: FIXED_TIMESTAMP,
      });

      expect(response.message.content).toBe("Train legs");
      expect(response.message.role).toBe("assistant");
      expect(response.provider).toBe("local");
      expect(response.finishReason).toBe("stop");
    });
  });
});

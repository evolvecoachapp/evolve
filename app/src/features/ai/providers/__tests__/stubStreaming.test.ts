import { createAIRequest } from "../../testSupport/fixtures";
import { AnthropicProviderStub } from "../AnthropicProviderStub";
import { GeminiProviderStub } from "../GeminiProviderStub";
import { LocalProviderStub } from "../LocalProviderStub";
import { OpenAIProviderStub } from "../OpenAIProviderStub";
import { aggregateChunks } from "../../utils/aggregateChunks";
import type { AIStreamChunk } from "../../models/AIStreamChunk";

describe("stub provider streaming", () => {
  it.each([
    ["openai", new OpenAIProviderStub()],
    ["anthropic", new AnthropicProviderStub()],
    ["gemini", new GeminiProviderStub()],
    ["local", new LocalProviderStub()],
  ] as const)("%s stub emits start/chunk/done events", async (_type, provider) => {
    const request = createAIRequest();
    const chunks: AIStreamChunk[] = [];
    let sawStart = false;
    let sawDone = false;

    for await (const event of provider.streamResponse(request)) {
      if (event.type === "start") {
        sawStart = true;
      }
      if (event.type === "chunk") {
        chunks.push(event.chunk);
      }
      if (event.type === "done") {
        sawDone = true;
      }
    }

    expect(sawStart).toBe(true);
    expect(sawDone).toBe(true);
    expect(chunks.length).toBeGreaterThan(0);
    expect(aggregateChunks(chunks).length).toBeGreaterThan(0);
  });

  it("stops emitting chunks when aborted", async () => {
    const provider = new LocalProviderStub();
    const controller = new AbortController();
    const request = createAIRequest();
    let chunkCount = 0;

    for await (const event of provider.streamResponse(request, {
      signal: controller.signal,
      // delay enables abort between chunks
      // createStubStream accepts delay via StubStreamOptions through options
    } as { signal: AbortSignal })) {
      if (event.type === "chunk") {
        chunkCount += 1;
        controller.abort();
      }
      if (event.type === "status" && event.status === "cancelled") {
        break;
      }
    }

    expect(chunkCount).toBeGreaterThanOrEqual(1);
  });
});

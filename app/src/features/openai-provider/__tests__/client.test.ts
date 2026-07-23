import { OpenAIClient } from "../client/OpenAIClient";
import { OpenAIRequestBuilder } from "../builders/OpenAIRequestBuilder";
import { OpenAIProviderError } from "../models/OpenAIError";
import {
  createClientOptions,
  createMockTransport,
  createOpenAIResponseFixture,
} from "../testSupport/fixtures";

describe("openai-provider client", () => {
  it("delegates to injected transport and returns immutable response", async () => {
    const fixture = createOpenAIResponseFixture({ content: "via transport" });
    let seenModel = "";
    const client = new OpenAIClient(
      createClientOptions(),
      createMockTransport(fixture, (request) => {
        seenModel = request.model;
      }),
    );

    const request = new OpenAIRequestBuilder()
      .withModel("gpt-4o-mini")
      .withMessages([
        Object.freeze({ role: "user", content: "hi" }),
      ])
      .build();

    const response = await client.createChatCompletion(request);
    expect(seenModel).toBe("gpt-4o-mini");
    expect(response.choices[0]?.message.content).toBe("via transport");
    expect(Object.isFrozen(response)).toBe(true);
  });

  it("maps transport failures through OpenAIProviderError when using failing transport", async () => {
    const client = new OpenAIClient(createClientOptions(), {
      async createChatCompletion() {
        throw new OpenAIProviderError({
          code: "server_error",
          message: "boom",
          status: 500,
          type: "api_error",
          retryable: true,
          details: Object.freeze({}),
        });
      },
    });

    const request = new OpenAIRequestBuilder()
      .withModel("gpt-4o-mini")
      .withMessages([Object.freeze({ role: "user", content: "hi" })])
      .build();

    await expect(client.createChatCompletion(request)).rejects.toBeInstanceOf(
      OpenAIProviderError,
    );
  });
});

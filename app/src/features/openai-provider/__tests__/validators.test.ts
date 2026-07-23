import { DEFAULT_EXECUTION_OPTIONS } from "../../ai-provider/models/AIExecutionOptions";
import { OpenAIRequestBuilder } from "../builders/OpenAIRequestBuilder";
import { validateApiKey } from "../validators/validateApiKey";
import { validateConfiguration } from "../validators/validateConfiguration";
import { validateOpenAIExecutionOptions } from "../validators/validateExecutionOptions";
import { validateMappedRequest } from "../validators/validateMappedRequest";
import { validateModelAvailability } from "../validators/validateModelAvailability";
import { validateResponse } from "../validators/validateResponse";
import {
  validateStreamChunk,
  validateStreamingEnabled,
} from "../validators/validateStreaming";
import {
  createClientOptions,
  createOpenAIResponseFixture,
  createProviderConfiguration,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("openai-provider validators", () => {
  it("validateConfiguration catches missing default model", () => {
    const configuration = createProviderConfiguration({
      defaultModelId: "   ",
    });
    expect(validateConfiguration(configuration)).toContain(
      "openai_configuration_default_model_missing",
    );
  });

  it("validateApiKey requires key presence", () => {
    const missing = createProviderConfiguration({
      client: createClientOptions({ apiKey: "" }),
    });
    expect(validateApiKey(missing)).toContain("openai_api_key_missing");

    const present = createProviderConfiguration();
    expect(validateApiKey(present)).toEqual([]);
  });

  it("validateModelAvailability checks catalog", () => {
    const configuration = createProviderConfiguration();
    expect(validateModelAvailability("gpt-4o-mini", configuration)).toEqual([]);
    expect(validateModelAvailability("unknown-model", configuration)).toContain(
      "openai_model_unknown",
    );
  });

  it("validateOpenAIExecutionOptions rejects streaming when disabled", () => {
    expect(
      validateOpenAIExecutionOptions(
        {
          ...DEFAULT_EXECUTION_OPTIONS,
          stream: true,
        },
        false,
      ),
    ).toContain("openai_execution_options_streaming_not_supported");

    expect(
      validateOpenAIExecutionOptions(
        {
          ...DEFAULT_EXECUTION_OPTIONS,
          stream: true,
        },
        true,
      ),
    ).toEqual([]);
  });

  it("validateMappedRequest requires user message", () => {
    const invalid = new OpenAIRequestBuilder()
      .withModel("gpt-4o-mini")
      .withMessages([
        Object.freeze({ role: "system", content: "system only" }),
      ])
      .build();

    expect(validateMappedRequest(invalid)).toContain(
      "openai_mapped_request_user_message_missing",
    );

    const valid = new OpenAIRequestBuilder()
      .withModel("gpt-4o-mini")
      .withMessages([
        Object.freeze({ role: "system", content: "system" }),
        Object.freeze({ role: "user", content: "hello" }),
      ])
      .build();
    expect(validateMappedRequest(valid)).toEqual([]);
  });

  it("validateResponse requires choices", () => {
    const valid = createOpenAIResponseFixture();
    expect(validateResponse(valid)).toEqual([]);
    expect(validateResponse(null)).toContain("openai_response_missing");
  });

  it("validateStreamingEnabled and validateStreamChunk", () => {
    expect(validateStreamingEnabled(false)).toContain(
      "openai_streaming_not_enabled",
    );
    expect(validateStreamingEnabled(true)).toEqual([]);
    expect(
      validateStreamChunk({
        id: "c1",
        index: 0,
        delta: "x",
        finishReason: null,
        model: null,
        usage: null,
        createdAt: FIXED_TIMESTAMP,
      }),
    ).toEqual([]);
  });
});

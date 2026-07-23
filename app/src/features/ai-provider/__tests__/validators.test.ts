import { DEFAULT_EXECUTION_OPTIONS } from "../models/AIExecutionOptions";
import { createDefaultConfiguration } from "../models/AIProviderConfiguration";
import { EMPTY_CAPABILITIES } from "../models/AIProviderCapabilities";
import { AIResponseBuilder } from "../builders/AIResponseBuilder";
import { AIFinishReasons } from "../models/AIFinishReason";
import {
  validateCapabilities,
  validateConfiguration,
  validateExecutionOptions,
  validateLimits,
  validateModelSelection,
  validateModels,
  validateProviderId,
  validateProviderRegistration,
  validateRequestIntegrity,
  validateReservedProviderId,
  validateResponseIntegrity,
} from "../validators";
import {
  createPreparedPromptPackage,
  createStubProvider,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { AIRequestBuilder } from "../builders/AIRequestBuilder";

describe("ai-provider validators", () => {
  it("validates provider ids", () => {
    expect(validateProviderId(null)).toContain("provider_id_missing");
    expect(validateProviderId("Bad Id")).toContain(
      "provider_id_invalid_format:Bad Id",
    );
    expect(validateProviderId("openai")).toEqual([]);
    expect(validateReservedProviderId("openai")).toContain(
      "provider_id_reserved:openai",
    );
  });

  it("validates capabilities and configuration", () => {
    expect(validateCapabilities(null)).toContain("capabilities_missing");
    expect(validateCapabilities(EMPTY_CAPABILITIES)).toContain(
      "capability_chat_disabled",
    );

    expect(validateConfiguration(null)).toContain("configuration_missing");
    expect(
      validateConfiguration(
        Object.freeze({
          ...createDefaultConfiguration("ok"),
          enabled: false,
          displayName: "",
        }),
      ),
    ).toEqual(
      expect.arrayContaining([
        "configuration_display_name_missing",
        "configuration_disabled",
      ]),
    );
  });

  it("validates execution options and model selection", () => {
    expect(
      validateExecutionOptions(
        Object.freeze({
          ...DEFAULT_EXECUTION_OPTIONS,
          temperature: 3,
          topP: 2,
          maxOutputTokens: 0,
        }),
      ),
    ).toEqual(
      expect.arrayContaining([
        "execution_options_temperature_out_of_range",
        "execution_options_top_p_out_of_range",
        "execution_options_max_output_tokens_invalid",
      ]),
    );

    const provider = createStubProvider({ id: "catalog" }).getInfo();
    expect(
      validateModelSelection({
        model: Object.freeze({
          id: "missing-model",
          providerId: "other",
          displayName: "Missing",
          family: null,
          version: null,
        }),
        provider,
      }),
    ).toEqual(
      expect.arrayContaining([
        "model_provider_mismatch:other!=catalog",
        "model_not_in_catalog:missing-model",
      ]),
    );
  });

  it("validates request integrity", () => {
    expect(validateRequestIntegrity(null)).toContain("request_missing");

    const request = new AIRequestBuilder()
      .withId("ai-request:valid")
      .withPromptPackage(createPreparedPromptPackage())
      .withProviderId("test-provider")
      .withCreatedAt(FIXED_TIMESTAMP)
      .build();

    expect(validateRequestIntegrity(request)).toEqual(
      expect.arrayContaining(["model_selection_missing"]),
    );
  });

  it("validates limits, models, registration, and response integrity", () => {
    expect(
      validateLimits(
        Object.freeze({
          maxInputTokens: -1,
          maxOutputTokens: 10,
          maxRequestsPerMinute: null,
          maxConcurrentRequests: null,
          maxContextWindow: 5,
        }),
      ),
    ).toContain("limits_maxInputTokens_invalid");

    expect(
      validateLimits(
        Object.freeze({
          maxInputTokens: 100,
          maxOutputTokens: 10,
          maxRequestsPerMinute: null,
          maxConcurrentRequests: null,
          maxContextWindow: 50,
        }),
      ),
    ).toContain("limits_input_exceeds_context_window");

    const provider = createStubProvider({ id: "reg" });
    expect(validateProviderRegistration(provider)).toEqual([]);
    expect(validateModels(provider.getInfo().models)).toEqual([]);

    expect(validateResponseIntegrity(null)).toContain("response_missing");
    const response = new AIResponseBuilder()
      .withId("ai-response:ok")
      .withRequestId("ai-request:ok")
      .withProviderId("reg")
      .withContent("ok")
      .withFinishReason(AIFinishReasons.STOP)
      .withCreatedAt(FIXED_TIMESTAMP)
      .build();
    expect(validateResponseIntegrity(response)).toEqual([]);
  });
});

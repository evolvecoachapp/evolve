import { createAIConfiguration } from "../../testSupport/fixtures";
import { validateConfiguration } from "../validateConfiguration";
import { validateModel } from "../validateModel";
import { validateProvider } from "../validateProvider";
import { validateRetries } from "../validateRetries";
import { validateTimeout } from "../validateTimeout";
import { validateTokens } from "../validateTokens";

describe("ai-config validators", () => {
  describe("validateProvider", () => {
    it("accepts local without an API key", () => {
      expect(
        validateProvider({ type: "local", apiKey: null }),
      ).toEqual([]);
    });

    it("requires an API key for cloud providers", () => {
      expect(validateProvider({ type: "openai", apiKey: null })).toEqual([
        { field: "provider.apiKey", code: "missing_api_key" },
      ]);
    });

    it("rejects unsupported providers", () => {
      expect(
        validateProvider({
          type: "not-real" as "openai",
          apiKey: "key",
        }),
      ).toEqual([{ field: "provider.type", code: "unsupported_provider" }]);
    });
  });

  describe("validateModel", () => {
    it("rejects empty model ids", () => {
      expect(validateModel({ id: "  " })).toEqual([
        { field: "model.id", code: "invalid_model" },
      ]);
    });

    it("accepts a non-empty model id", () => {
      expect(validateModel({ id: "gpt-4o" })).toEqual([]);
    });
  });

  describe("validateTimeout", () => {
    it("rejects non-positive timeouts", () => {
      expect(validateTimeout({ timeoutMs: 0 })).toEqual([
        { field: "timeout.timeoutMs", code: "invalid_timeout" },
      ]);
    });
  });

  describe("validateRetries", () => {
    it("rejects negative retries", () => {
      expect(validateRetries({ maxRetries: -1 })).toEqual([
        { field: "retry.maxRetries", code: "invalid_retries" },
      ]);
    });

    it("accepts zero retries", () => {
      expect(validateRetries({ maxRetries: 0 })).toEqual([]);
    });
  });

  describe("validateTokens", () => {
    it("rejects non-positive token limits", () => {
      expect(validateTokens({ maxOutputTokens: 0 })).toEqual([
        { field: "tokens.maxOutputTokens", code: "invalid_max_output_tokens" },
      ]);
    });
  });

  describe("validateConfiguration", () => {
    it("returns valid for a complete local configuration", () => {
      const result = validateConfiguration(createAIConfiguration());
      expect(result.valid).toBe(true);
      expect(result.issues).toEqual([]);
    });

    it("aggregates structured issues without throwing", () => {
      const result = validateConfiguration(
        createAIConfiguration({
          providerType: "openai",
          apiKey: null,
          modelId: "",
          timeoutMs: -5,
          maxRetries: -1,
          maxOutputTokens: 0,
        }),
      );

      expect(result.valid).toBe(false);
      expect(result.issues.map((issue) => issue.code)).toEqual(
        expect.arrayContaining([
          "missing_api_key",
          "invalid_model",
          "invalid_timeout",
          "invalid_retries",
          "invalid_max_output_tokens",
        ]),
      );
    });
  });
});

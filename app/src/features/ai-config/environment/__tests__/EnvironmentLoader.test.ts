import { AI_CONFIGURATION_DEFAULTS } from "../defaults";
import { EnvironmentLoader } from "../EnvironmentLoader";

describe("EnvironmentLoader", () => {
  const loader = new EnvironmentLoader();

  it("applies defaults when environment is empty", () => {
    const loaded = loader.load({});

    expect(loaded.provider).toBe(AI_CONFIGURATION_DEFAULTS.provider);
    expect(loaded.model).toBe(AI_CONFIGURATION_DEFAULTS.model);
    expect(loaded.timeoutMs).toBe(AI_CONFIGURATION_DEFAULTS.timeoutMs);
    expect(loaded.maxRetries).toBe(AI_CONFIGURATION_DEFAULTS.maxRetries);
    expect(loaded.maxOutputTokens).toBe(
      AI_CONFIGURATION_DEFAULTS.maxOutputTokens,
    );
    expect(loaded.openAIApiKey).toBeNull();
    expect(loaded.anthropicApiKey).toBeNull();
    expect(loaded.geminiApiKey).toBeNull();
    expect(loaded.providerFromEnv).toBe(false);
  });

  it("reads and normalizes supported environment variables", () => {
    const loaded = loader.load({
      OPENAI_API_KEY: "  sk-openai  ",
      ANTHROPIC_API_KEY: "sk-anthropic",
      GEMINI_API_KEY: "sk-gemini",
      AI_PROVIDER: " OpenAI ",
      AI_MODEL: " gpt-4o ",
      AI_TIMEOUT: "15000",
      AI_MAX_RETRIES: "3",
      AI_MAX_OUTPUT_TOKENS: "2048",
    });

    expect(loaded.provider).toBe("OpenAI");
    expect(loaded.model).toBe("gpt-4o");
    expect(loaded.timeoutMs).toBe(15_000);
    expect(loaded.maxRetries).toBe(3);
    expect(loaded.maxOutputTokens).toBe(2_048);
    expect(loaded.openAIApiKey).toBe("sk-openai");
    expect(loaded.anthropicApiKey).toBe("sk-anthropic");
    expect(loaded.geminiApiKey).toBe("sk-gemini");
    expect(loaded.providerFromEnv).toBe(true);
    expect(loaded.modelFromEnv).toBe(true);
    expect(loaded.timeoutFromEnv).toBe(true);
    expect(loaded.maxRetriesFromEnv).toBe(true);
    expect(loaded.maxOutputTokensFromEnv).toBe(true);
  });

  it("falls back to defaults for non-numeric timeout/retries/tokens", () => {
    const loaded = loader.load({
      AI_TIMEOUT: "abc",
      AI_MAX_RETRIES: "-1",
      AI_MAX_OUTPUT_TOKENS: "0",
    });

    expect(loaded.timeoutMs).toBe(AI_CONFIGURATION_DEFAULTS.timeoutMs);
    expect(loaded.maxRetries).toBe(AI_CONFIGURATION_DEFAULTS.maxRetries);
    expect(loaded.maxOutputTokens).toBe(
      AI_CONFIGURATION_DEFAULTS.maxOutputTokens,
    );
    expect(loaded.timeoutFromEnv).toBe(false);
    expect(loaded.maxRetriesFromEnv).toBe(false);
    expect(loaded.maxOutputTokensFromEnv).toBe(false);
  });

  it("treats blank strings as unset", () => {
    const loaded = loader.load({
      OPENAI_API_KEY: "   ",
      AI_PROVIDER: "",
      AI_MODEL: "\t",
    });

    expect(loaded.openAIApiKey).toBeNull();
    expect(loaded.provider).toBe(AI_CONFIGURATION_DEFAULTS.provider);
    expect(loaded.model).toBe(AI_CONFIGURATION_DEFAULTS.model);
    expect(loaded.providerFromEnv).toBe(false);
  });

  it("does not validate provider values", () => {
    const loaded = loader.load({ AI_PROVIDER: "not-a-provider" });
    expect(loaded.provider).toBe("not-a-provider");
  });
});

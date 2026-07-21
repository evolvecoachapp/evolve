import { createLoadedEnvironment } from "../../testSupport/fixtures";
import { AIConfigurationFactory } from "../AIConfigurationFactory";

describe("AIConfigurationFactory", () => {
  it("builds an immutable configuration from defaults", () => {
    const configuration = AIConfigurationFactory.createDefault();

    expect(configuration.provider.type).toBe("local");
    expect(configuration.model.id).toBe("local-default");
    expect(configuration.timeout.timeoutMs).toBe(30_000);
    expect(Object.isFrozen(configuration)).toBe(true);
    expect(Object.isFrozen(configuration.provider)).toBe(true);
  });

  it("merges environment values over defaults", () => {
    const configuration = AIConfigurationFactory.create({
      environment: createLoadedEnvironment({
        provider: "openai",
        model: "gpt-4o",
        timeoutMs: 12_000,
        maxRetries: 4,
        maxOutputTokens: 512,
        openAIApiKey: "sk-test",
        providerFromEnv: true,
        modelFromEnv: true,
        timeoutFromEnv: true,
        maxRetriesFromEnv: true,
        maxOutputTokensFromEnv: true,
      }),
    });

    expect(configuration.provider.type).toBe("openai");
    expect(configuration.provider.apiKey).toBe("sk-test");
    expect(configuration.model.id).toBe("gpt-4o");
    expect(configuration.timeout.timeoutMs).toBe(12_000);
    expect(configuration.retry.maxRetries).toBe(4);
    expect(configuration.tokens.maxOutputTokens).toBe(512);
    expect(configuration.environment.provider).toBe("openai");
    expect(configuration.environment.hasOpenAIApiKey).toBe(true);
  });

  it("merges user overrides over environment", () => {
    const configuration = AIConfigurationFactory.create({
      environment: createLoadedEnvironment({
        provider: "openai",
        openAIApiKey: "sk-env",
        anthropicApiKey: "sk-anthropic",
        providerFromEnv: true,
      }),
      overrides: {
        providerType: "anthropic",
        modelId: "claude-sonnet",
        apiKey: "sk-override",
        timeoutMs: 9_000,
      },
    });

    expect(configuration.provider.type).toBe("anthropic");
    expect(configuration.provider.apiKey).toBe("sk-override");
    expect(configuration.model.id).toBe("claude-sonnet");
    expect(configuration.timeout.timeoutMs).toBe(9_000);
  });

  it("selects the matching provider API key", () => {
    const environment = createLoadedEnvironment({
      provider: "gemini",
      geminiApiKey: "sk-gemini",
      openAIApiKey: "sk-openai",
      providerFromEnv: true,
    });

    const configuration = AIConfigurationFactory.create({ environment });
    expect(configuration.provider.apiKey).toBe("sk-gemini");
  });

  it("never exposes raw secret values on environment metadata", () => {
    const configuration = AIConfigurationFactory.create({
      environment: createLoadedEnvironment({
        openAIApiKey: "sk-secret",
        anthropicApiKey: "sk-secret-2",
        geminiApiKey: "sk-secret-3",
      }),
    });

    expect(configuration.environment).toEqual(
      expect.objectContaining({
        hasOpenAIApiKey: true,
        hasAnthropicApiKey: true,
        hasGeminiApiKey: true,
      }),
    );
    expect(JSON.stringify(configuration.environment)).not.toContain("sk-secret");
  });
});

import { EnvironmentLoader } from "../../environment/EnvironmentLoader";
import { EnvironmentAIConfigurationRepository } from "../EnvironmentAIConfigurationRepository";

describe("EnvironmentAIConfigurationRepository", () => {
  it("loads, validates, and returns an immutable configuration", async () => {
    const repository = new EnvironmentAIConfigurationRepository(
      new EnvironmentLoader(),
      {
        AI_PROVIDER: "local",
        AI_MODEL: "local-test",
        AI_TIMEOUT: "20000",
        AI_MAX_RETRIES: "1",
        AI_MAX_OUTPUT_TOKENS: "256",
      },
    );

    const result = await repository.getConfiguration();

    expect(result.configuration.provider.type).toBe("local");
    expect(result.configuration.model.id).toBe("local-test");
    expect(result.configuration.timeout.timeoutMs).toBe(20_000);
    expect(result.validation.valid).toBe(true);
    expect(Object.isFrozen(result.configuration)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("never exposes a raw environment map", async () => {
    const repository = new EnvironmentAIConfigurationRepository(
      new EnvironmentLoader(),
      {
        OPENAI_API_KEY: "sk-live-secret",
        AI_PROVIDER: "openai",
        AI_MODEL: "gpt-4o",
      },
    );

    const result = await repository.getConfiguration();
    const serialized = JSON.stringify(result);

    expect(result.configuration.provider.apiKey).toBe("sk-live-secret");
    expect(result.configuration.environment.hasOpenAIApiKey).toBe(true);
    expect(serialized).not.toContain("OPENAI_API_KEY");
    expect(serialized).not.toContain("process.env");
    expect(result.validation.valid).toBe(true);
  });

  it("returns structured validation issues for missing cloud keys", async () => {
    const repository = new EnvironmentAIConfigurationRepository(
      new EnvironmentLoader(),
      {
        AI_PROVIDER: "anthropic",
        AI_MODEL: "claude",
      },
    );

    const result = await repository.getConfiguration();

    expect(result.validation.valid).toBe(false);
    expect(result.validation.issues).toEqual([
      { field: "provider.apiKey", code: "missing_api_key" },
    ]);
  });

  it("reports unsupported providers without throwing", async () => {
    const repository = new EnvironmentAIConfigurationRepository(
      new EnvironmentLoader(),
      {
        AI_PROVIDER: "unknown-cloud",
      },
    );

    const result = await repository.getConfiguration();

    expect(result.validation.valid).toBe(false);
    expect(result.validation.issues).toContainEqual({
      field: "provider.type",
      code: "unsupported_provider",
    });
  });
});

import { createAIConfiguration } from "../../testSupport/fixtures";
import { deepFreezeConfiguration } from "../deepFreezeConfiguration";
import { maskSecrets } from "../maskSecrets";
import { sanitizeConfiguration } from "../sanitizeConfiguration";

describe("ai-config utilities", () => {
  describe("deepFreezeConfiguration", () => {
    it("freezes nested configuration objects", () => {
      const configuration = createAIConfiguration({
        providerType: "openai",
        apiKey: "sk-test",
      });
      const frozen = deepFreezeConfiguration(configuration);

      expect(Object.isFrozen(frozen)).toBe(true);
      expect(Object.isFrozen(frozen.provider)).toBe(true);
      expect(Object.isFrozen(frozen.model)).toBe(true);
      expect(Object.isFrozen(frozen.environment)).toBe(true);
    });
  });

  describe("maskSecrets", () => {
    it("masks API keys while preserving structure", () => {
      const configuration = createAIConfiguration({
        providerType: "openai",
        apiKey: "sk-live-secret",
      });

      const masked = maskSecrets(configuration);

      expect(masked.provider.apiKey).toBe("***");
      expect(masked.provider.type).toBe("openai");
      expect(configuration.provider.apiKey).toBe("sk-live-secret");
    });

    it("leaves null API keys unchanged", () => {
      const configuration = createAIConfiguration();
      expect(maskSecrets(configuration).provider.apiKey).toBeNull();
    });
  });

  describe("sanitizeConfiguration", () => {
    it("returns a secret-safe configuration view", () => {
      const configuration = createAIConfiguration({
        providerType: "gemini",
        apiKey: "sk-gemini-secret",
      });

      const sanitized = sanitizeConfiguration(configuration);
      expect(sanitized.provider.apiKey).toBe("***");
      expect(JSON.stringify(sanitized)).not.toContain("sk-gemini-secret");
    });
  });
});

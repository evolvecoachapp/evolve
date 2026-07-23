import { createAIProviderEngine } from "../../ai-provider/engine";
import { AIProviderIds } from "../../ai-provider/models/AIProviderId";
import { AIProviderFactory } from "../../ai-provider/factory/AIProviderFactory";
import { registerOpenAIProvider } from "../provider";
import {
  createMockTransport,
  createProviderConfiguration,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";
import { computeBackoffDelayMs } from "../utils/backoff";
import { nextRetryAttempt, shouldRetry } from "../utils/retry";
import { estimateTokens } from "../utils/estimateTokens";
import {
  EMPTY_OPENAI_STATISTICS,
  recordSuccess,
} from "../utils/statistics";
import { DEFAULT_OPENAI_RETRY_POLICY } from "../models/OpenAIRetryPolicy";

describe("openai-provider registry and utils", () => {
  it("registerOpenAIProvider is factory compatible", () => {
    const engine = createAIProviderEngine();
    const registry = engine.getRegistry();
    const provider = registerOpenAIProvider(registry, {
      configuration: createProviderConfiguration(),
      client: createMockTransport(),
      registeredAt: FIXED_TIMESTAMP,
    });

    expect(registry.resolve(AIProviderIds.OPENAI)?.id).toBe(
      AIProviderIds.OPENAI,
    );

    const factory = new AIProviderFactory(registry);
    factory.setDefaultProviderId(AIProviderIds.OPENAI);
    expect(factory.resolveById(AIProviderIds.OPENAI)).toBe(provider);
    expect(factory.resolveDefault()?.id).toBe(AIProviderIds.OPENAI);
  });

  it("token retry backoff and statistics helpers", () => {
    expect(estimateTokens("abcd")).toBe(1);
    expect(
      computeBackoffDelayMs(0, { ...DEFAULT_OPENAI_RETRY_POLICY, jitter: false }),
    ).toBe(DEFAULT_OPENAI_RETRY_POLICY.initialDelayMs);
    expect(shouldRetry(0, true, { ...DEFAULT_OPENAI_RETRY_POLICY, maxRetries: 2 })).toBe(
      true,
    );
    expect(nextRetryAttempt(2, { ...DEFAULT_OPENAI_RETRY_POLICY, maxRetries: 2 }).exhausted).toBe(
      true,
    );

    const stats = recordSuccess(
      EMPTY_OPENAI_STATISTICS,
      { promptTokens: 1, completionTokens: 2, totalTokens: 3 },
      FIXED_TIMESTAMP,
    );
    expect(stats.successCount).toBe(1);
    expect(stats.totalTokens).toBe(3);
  });
});

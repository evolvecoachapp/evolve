import {
  DEFAULT_CANCELLATION_POLICY,
  DEFAULT_EXECUTION_POLICY,
  DEFAULT_RETRY_POLICY,
  DEFAULT_TIMEOUT_POLICY,
} from "../policies";
import { DEFAULT_AI_EXECUTION_POLICY } from "../models/AIExecutionPolicy";

describe("ai-execution policies", () => {
  it("defaults disable retry / timeout / cancellation algorithms", () => {
    expect(DEFAULT_RETRY_POLICY.enabled).toBe(false);
    expect(DEFAULT_RETRY_POLICY.maxAttempts).toBeNull();
    expect(DEFAULT_TIMEOUT_POLICY.enabled).toBe(false);
    expect(DEFAULT_CANCELLATION_POLICY.enabled).toBe(false);
  });

  it("defaults disallow streaming and tools", () => {
    expect(DEFAULT_EXECUTION_POLICY.allowStreaming).toBe(false);
    expect(DEFAULT_EXECUTION_POLICY.allowTools).toBe(false);
    expect(DEFAULT_EXECUTION_POLICY.requireProvider).toBe(true);
  });

  it("bundles defaults into AIExecutionPolicy", () => {
    expect(DEFAULT_AI_EXECUTION_POLICY.retry).toEqual(DEFAULT_RETRY_POLICY);
    expect(DEFAULT_AI_EXECUTION_POLICY.timeout).toEqual(DEFAULT_TIMEOUT_POLICY);
    expect(DEFAULT_AI_EXECUTION_POLICY.cancellation).toEqual(
      DEFAULT_CANCELLATION_POLICY,
    );
    expect(DEFAULT_AI_EXECUTION_POLICY.execution).toEqual(
      DEFAULT_EXECUTION_POLICY,
    );
  });
});

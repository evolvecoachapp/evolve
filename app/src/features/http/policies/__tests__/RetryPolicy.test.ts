import { HttpError } from "../../models/HttpError";
import { RetryPolicy } from "../RetryPolicy";

describe("RetryPolicy", () => {
  it("rejects negative maxRetries", () => {
    expect(() => new RetryPolicy({ maxRetries: -1 })).toThrow(/maxRetries/);
  });

  it("does not retry when attempts are exhausted", () => {
    const policy = new RetryPolicy({ maxRetries: 2 });
    const error = new HttpError("timeout", "timed out", { retryable: true });

    expect(policy.shouldRetry(0, error)).toBe(true);
    expect(policy.shouldRetry(1, error)).toBe(true);
    expect(policy.shouldRetry(2, error)).toBe(false);
  });

  it("retries timeout and network errors", () => {
    const policy = new RetryPolicy({ maxRetries: 1 });

    expect(
      policy.shouldRetry(
        0,
        new HttpError("timeout", "t", { retryable: true }),
      ),
    ).toBe(true);
    expect(
      policy.shouldRetry(
        0,
        new HttpError("network", "n", { retryable: true }),
      ),
    ).toBe(true);
  });

  it("retries only configured HTTP statuses", () => {
    const policy = new RetryPolicy({ maxRetries: 1 });

    expect(
      policy.shouldRetry(
        0,
        new HttpError("http", "429", { status: 429, retryable: true }),
      ),
    ).toBe(true);
    expect(
      policy.shouldRetry(
        0,
        new HttpError("http", "401", { status: 401, retryable: false }),
      ),
    ).toBe(false);
  });

  it("uses exponential backoff", () => {
    const policy = new RetryPolicy({ maxRetries: 3, baseDelayMs: 100 });
    expect(policy.delayMs(0)).toBe(100);
    expect(policy.delayMs(1)).toBe(200);
    expect(policy.delayMs(2)).toBe(400);
  });
});

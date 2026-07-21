import { TimeoutPolicy } from "../TimeoutPolicy";

describe("TimeoutPolicy", () => {
  it("rejects non-positive timeoutMs", () => {
    expect(() => new TimeoutPolicy(0)).toThrow(/positive timeoutMs/);
    expect(() => new TimeoutPolicy(-1)).toThrow(/positive timeoutMs/);
  });

  it("creates a signal that aborts after timeoutMs", async () => {
    jest.useFakeTimers();
    const policy = new TimeoutPolicy(100);
    const { signal, dispose } = policy.createSignal();

    expect(signal.aborted).toBe(false);

    jest.advanceTimersByTime(100);
    expect(signal.aborted).toBe(true);

    dispose();
    jest.useRealTimers();
  });

  it("dispose clears the timer before abort", () => {
    jest.useFakeTimers();
    const policy = new TimeoutPolicy(100);
    const { signal, dispose } = policy.createSignal();

    dispose();
    jest.advanceTimersByTime(200);

    expect(signal.aborted).toBe(false);
    jest.useRealTimers();
  });
});

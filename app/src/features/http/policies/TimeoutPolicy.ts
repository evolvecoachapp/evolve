/**
 * Creates AbortSignals that fire after a fixed timeout.
 *
 * Pure timeout concern — no HTTP or provider knowledge.
 */
export class TimeoutPolicy {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      throw new Error(`TimeoutPolicy requires a positive timeoutMs, got: ${timeoutMs}`);
    }
    this.timeoutMs = timeoutMs;
  }

  /**
   * Create an AbortSignal that aborts after `timeoutMs`.
   * Returns both the signal and a dispose function to clear the timer.
   */
  createSignal(): {
    readonly signal: AbortSignal;
    readonly dispose: () => void;
  } {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, this.timeoutMs);

    return {
      signal: controller.signal,
      dispose: () => {
        clearTimeout(timer);
      },
    };
  }
}

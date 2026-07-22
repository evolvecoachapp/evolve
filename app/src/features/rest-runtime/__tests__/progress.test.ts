import { RestRuntimeEngine } from "../runtime/RestRuntimeEngine";
import {
  FIXED_TIMESTAMP,
  createMinimalRestSession,
} from "../testSupport/fixtures";
import {
  calculateCompletionPercent,
  calculateOvertimeMs,
  calculateProgress,
  calculateRemainingMs,
} from "../utils";

describe("rest-runtime progress", () => {
  it("calculates remaining, overtime, and completion percent", () => {
    expect(calculateRemainingMs(90_000, 30_000)).toBe(60_000);
    expect(calculateOvertimeMs(90_000, 100_000)).toBe(10_000);
    expect(calculateCompletionPercent(90_000, 45_000)).toBe(50);

    const progress = calculateProgress(90_000, 45_000);
    expect(progress).toMatchObject({
      elapsedMs: 45_000,
      remainingMs: 45_000,
      overtimeMs: 0,
      completionPercent: 50,
      isOvertime: false,
    });
  });

  it("tracks progress through injected elapsed updates", () => {
    const engine = new RestRuntimeEngine();
    engine.start(createMinimalRestSession({ targetDurationMs: 60_000 }), {
      fixedTimestamp: FIXED_TIMESTAMP,
    });

    const mid = engine.updateElapsedTime(30_000);
    expect(mid.progress.completionPercent).toBe(50);
    expect(mid.remainingMs).toBe(30_000);

    const near = engine.updateElapsedTime(60_000);
    expect(near.progress.completionPercent).toBe(100);
    expect(near.remainingMs).toBe(0);
    expect(near.status).toBe("OnTarget");
  });
});

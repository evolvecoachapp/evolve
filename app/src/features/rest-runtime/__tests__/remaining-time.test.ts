import { RestRuntimeEngine } from "../runtime/RestRuntimeEngine";
import {
  FIXED_TIMESTAMP,
  createMinimalRestSession,
} from "../testSupport/fixtures";

describe("rest-runtime remaining time", () => {
  it("decreases remaining as elapsed increases", () => {
    const engine = new RestRuntimeEngine();
    engine.start(createMinimalRestSession({ targetDurationMs: 120_000 }), {
      fixedTimestamp: FIXED_TIMESTAMP,
    });

    expect(engine.getSummary().remainingMs).toBe(120_000);
    expect(engine.updateElapsedTime(40_000).remainingMs).toBe(80_000);
    expect(engine.updateElapsedTime(100_000).remainingMs).toBe(20_000);
    expect(engine.updateElapsedTime(120_000).remainingMs).toBe(0);
  });

  it("clamps remaining at zero once target is reached", () => {
    const engine = new RestRuntimeEngine();
    engine.start(
      createMinimalRestSession({
        targetDurationMs: 30_000,
        allowOvertime: true,
      }),
      { fixedTimestamp: FIXED_TIMESTAMP },
    );

    const summary = engine.updateElapsedTime(45_000);
    expect(summary.remainingMs).toBe(0);
    expect(summary.overtimeMs).toBe(15_000);
  });

  it("freezes remaining while paused (no elapsed updates)", () => {
    const engine = new RestRuntimeEngine();
    engine.start(createMinimalRestSession({ targetDurationMs: 60_000 }), {
      fixedTimestamp: FIXED_TIMESTAMP,
    });
    engine.updateElapsedTime(20_000);
    engine.pause();

    expect(engine.getSummary().remainingMs).toBe(40_000);
    expect(() => engine.updateElapsedTime(25_000)).toThrow();
    expect(engine.getSummary().remainingMs).toBe(40_000);
  });
});

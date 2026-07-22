import { RestRuntimeEngine } from "../runtime/RestRuntimeEngine";
import {
  FIXED_TIMESTAMP,
  createMinimalRestSession,
} from "../testSupport/fixtures";

describe("rest-runtime overtime", () => {
  it("tracks overtime when elapsed exceeds target", () => {
    const engine = new RestRuntimeEngine();
    engine.start(
      createMinimalRestSession({
        targetDurationMs: 60_000,
        allowOvertime: true,
        expireOnTarget: false,
      }),
      { fixedTimestamp: FIXED_TIMESTAMP },
    );

    const summary = engine.updateElapsedTime(75_000);
    expect(summary.state).toBe("Running");
    expect(summary.status).toBe("Overtime");
    expect(summary.overtimeMs).toBe(15_000);
    expect(summary.progress.isOvertime).toBe(true);
    expect(summary.progress.completionPercent).toBe(100);
  });

  it("auto-expires at target when configured", () => {
    const engine = new RestRuntimeEngine();
    engine.start(
      createMinimalRestSession({
        targetDurationMs: 45_000,
        allowOvertime: false,
        expireOnTarget: true,
      }),
      {
        fixedTimestamp: FIXED_TIMESTAMP,
        autoExpireOnTarget: true,
        allowOvertime: false,
      },
    );

    const summary = engine.updateElapsedTime(45_000);
    expect(summary.state).toBe("Expired");
    expect(summary.status).toBe("Finished");
    expect(engine.isTerminal()).toBe(true);
  });

  it("supports explicit expire after target", () => {
    const engine = new RestRuntimeEngine();
    engine.start(
      createMinimalRestSession({
        targetDurationMs: 30_000,
        expireOnTarget: false,
      }),
      { fixedTimestamp: FIXED_TIMESTAMP },
    );
    engine.updateElapsedTime(30_000);

    const result = engine.expire();
    expect(result.finalState).toBe("Expired");
    expect(result.expiredAt).toBe(FIXED_TIMESTAMP);
  });
});

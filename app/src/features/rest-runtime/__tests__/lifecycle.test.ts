import { RestRuntimeEngine } from "../runtime/RestRuntimeEngine";
import {
  FIXED_TIMESTAMP,
  createMinimalRestSession,
} from "../testSupport/fixtures";

describe("RestRuntimeEngine lifecycle", () => {
  it("starts rest from an immutable session", () => {
    const session = createMinimalRestSession();
    const engine = new RestRuntimeEngine();
    const summary = engine.start(session, { fixedTimestamp: FIXED_TIMESTAMP });

    expect(summary.state).toBe("Running");
    expect(summary.status).toBe("Counting");
    expect(summary.sessionId).toBe(session.id);
    expect(summary.targetDurationMs).toBe(90_000);
    expect(summary.elapsedMs).toBe(0);
    expect(summary.remainingMs).toBe(90_000);
    expect(summary.startedAt).toBe(FIXED_TIMESTAMP);
    expect(session.target.duration.milliseconds).toBe(90_000);
  });

  it("pauses and resumes", () => {
    const engine = new RestRuntimeEngine();
    engine.start(createMinimalRestSession(), {
      fixedTimestamp: FIXED_TIMESTAMP,
    });

    expect(engine.pause().state).toBe("Paused");
    expect(engine.getSnapshot().pausedAt).toBe(FIXED_TIMESTAMP);
    expect(engine.resume().state).toBe("Running");
    expect(engine.getSnapshot().pausedAt).toBeNull();
  });

  it("completes rest", () => {
    const engine = new RestRuntimeEngine();
    engine.start(createMinimalRestSession(), {
      fixedTimestamp: FIXED_TIMESTAMP,
    });
    engine.updateElapsedTime(30_000);

    const result = engine.complete();
    expect(result.finalState).toBe("Completed");
    expect(result.progress.elapsedMs).toBe(30_000);
    expect(engine.isTerminal()).toBe(true);
  });

  it("cancels rest", () => {
    const engine = new RestRuntimeEngine();
    engine.start(createMinimalRestSession(), {
      fixedTimestamp: FIXED_TIMESTAMP,
    });

    const result = engine.cancel();
    expect(result.finalState).toBe("Cancelled");
    expect(engine.isTerminal()).toBe(true);
  });

  it("does not mutate the source RestSession", () => {
    const session = createMinimalRestSession();
    const frozenTarget = session.target;
    const engine = new RestRuntimeEngine();
    engine.start(session, { fixedTimestamp: FIXED_TIMESTAMP });
    engine.updateElapsedTime(10_000);

    expect(session.target).toBe(frozenTarget);
    expect(session.target.duration.milliseconds).toBe(90_000);
  });
});

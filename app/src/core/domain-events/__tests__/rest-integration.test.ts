import { createDomainEventSystem } from "../index";
import { RestRuntimeEngine } from "../../../features/rest-runtime/runtime/RestRuntimeEngine";
import { createMinimalRestSession } from "../../../features/rest-runtime/testSupport/fixtures";

const FIXED = "2026-07-22T00:00:00.000Z";

describe("domain events × Rest Runtime integration", () => {
  it("emits rest_started on start", () => {
    const system = createDomainEventSystem({ sessionId: "ri-1" });
    const engine = new RestRuntimeEngine(undefined, system);

    engine.start(createMinimalRestSession(), { fixedTimestamp: FIXED });

    const events = system.getEventStream().events;
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("rest_started");
    expect(events[0]?.source).toBe("rest-runtime");
    expect(events[0]?.category).toBe("rest");
  });

  it("emits pause / resume / complete lifecycle", () => {
    const system = createDomainEventSystem({ sessionId: "ri-2" });
    const engine = new RestRuntimeEngine(undefined, system);
    engine.start(createMinimalRestSession(), { fixedTimestamp: FIXED });

    engine.pause();
    engine.resume();
    engine.complete();

    const types = system.getEventStream().events.map((event) => event.type);
    expect(types).toEqual([
      "rest_started",
      "rest_paused",
      "rest_resumed",
      "rest_completed",
    ]);
    expect(engine.getState()).toBe("Completed");
  });

  it("emits rest_cancelled and maps expire to rest_completed", () => {
    const cancelSystem = createDomainEventSystem({ sessionId: "ri-3a" });
    const cancelEngine = new RestRuntimeEngine(undefined, cancelSystem);
    cancelEngine.start(createMinimalRestSession(), { fixedTimestamp: FIXED });
    cancelEngine.cancel();
    expect(
      cancelSystem.getEventStream().events.map((event) => event.type),
    ).toEqual(["rest_started", "rest_cancelled"]);

    const expireSystem = createDomainEventSystem({ sessionId: "ri-3b" });
    const expireEngine = new RestRuntimeEngine(undefined, expireSystem);
    expireEngine.start(
      createMinimalRestSession({
        targetDurationMs: 30_000,
        expireOnTarget: true,
      }),
      { fixedTimestamp: FIXED, autoExpireOnTarget: true },
    );
    expireEngine.updateElapsedTime(30_000);

    const types = expireSystem
      .getEventStream()
      .events.map((event) => event.type);
    expect(types).toContain("rest_completed");
    expect(expireEngine.getState()).toBe("Expired");
  });
});

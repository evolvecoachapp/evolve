import {
  configureDefaultDomainEventSystem,
  getEventStream,
  publishEvent,
  resetDefaultDomainEventSystem,
  subscribe,
  summarizeEvents,
  unsubscribe,
  type DomainEventSubscriber,
} from "../index";
import { createWorkoutStartedEvent } from "../testSupport/fixtures";

describe("domain-events application API", () => {
  beforeEach(() => {
    resetDefaultDomainEventSystem();
    configureDefaultDomainEventSystem({ sessionId: "app-default" });
  });

  afterEach(() => {
    resetDefaultDomainEventSystem();
  });

  it("exposes publish / subscribe / stream / summarize without dispatcher", () => {
    const seen: string[] = [];
    const subscriber: DomainEventSubscriber = {
      id: "app-sub",
      name: "App",
      onEvent: (event) => seen.push(event.type),
    };

    subscribe(subscriber);
    publishEvent(createWorkoutStartedEvent(1));

    expect(seen).toEqual(["workout_started"]);
    expect(getEventStream().eventCount).toBe(1);
    expect(summarizeEvents().totalEvents).toBe(1);

    unsubscribe("app-sub");
    publishEvent(
      createWorkoutStartedEvent(2),
    );
    expect(seen).toEqual(["workout_started"]);
    expect(getEventStream().eventCount).toBe(2);
  });
});

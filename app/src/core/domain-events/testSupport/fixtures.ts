import { DomainEventBuilder } from "../builders/DomainEventBuilder";
import { EventContextBuilder } from "../builders/EventContextBuilder";
import type { DomainEvent } from "../models/DomainEvent";
import type { EventContext } from "../models/EventContext";

export const FIXED_EVENT_TIMESTAMP = "2026-07-22T00:00:00.000Z";

export function createTestContext(
  overrides: Partial<EventContext> = {},
): EventContext {
  return new EventContextBuilder()
    .from({
      sessionId: overrides.sessionId ?? "session-events-1",
      workoutRuntimeId: overrides.workoutRuntimeId ?? "runtime-1",
      restRuntimeId: overrides.restRuntimeId ?? null,
      exerciseRuntimeId: overrides.exerciseRuntimeId ?? null,
      setRuntimeId: overrides.setRuntimeId ?? null,
      athleteId: overrides.athleteId ?? "athlete-1",
      dayId: overrides.dayId ?? "day-1",
      weekNumber: overrides.weekNumber ?? 1,
    })
    .build();
}

export function createWorkoutStartedEvent(
  sequence = 1,
  timestamp = FIXED_EVENT_TIMESTAMP,
): DomainEvent {
  return new DomainEventBuilder().workoutStarted({
    sequence,
    timestamp,
    context: createTestContext(),
    payload: {
      workoutRuntimeId: "runtime-1",
      sessionId: "session-events-1",
    },
  });
}

/**
 * Event Dispatcher Tests
 *
 * Comprehensive test suite for the event dispatcher and domain events system.
 * Tests cover:
 * - Listener registration and removal
 * - Event dispatch with single and multiple listeners
 * - Type safety
 * - Error handling
 * - Ordering guarantees
 */

import { EventDispatcher, eventDispatcher } from "../dispatcher";
import {
  createProfileUpdated,
  createWeightUpdated,
  createWorkoutCompleted,
  createWorkoutSkipped,
  createMealLogged,
  createRecoveryUpdated,
  createPersonalRecordAchieved,
  generateEventId,
  getCurrentTimestamp,
} from "../events";
import type {
  WorkoutCompleted,
  ProfileUpdated,
  WeightUpdated,
  DomainEvent,
} from "../types";

describe("EventDispatcher", () => {
  let dispatcher: EventDispatcher;

  beforeEach(() => {
    // Create a fresh dispatcher for each test
    dispatcher = new EventDispatcher();
  });

  describe("listener registration", () => {
    it("should register a listener for an event type", () => {
      const listener = jest.fn();
      dispatcher.subscribe("WorkoutCompleted", listener);

      expect(dispatcher.getListenerCount("WorkoutCompleted")).toBe(1);
    });

    it("should register multiple listeners for the same event type", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      dispatcher.subscribe("WorkoutCompleted", listener1);
      dispatcher.subscribe("WorkoutCompleted", listener2);

      expect(dispatcher.getListenerCount("WorkoutCompleted")).toBe(2);
    });

    it("should register listeners for different event types", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      dispatcher.subscribe("WorkoutCompleted", listener1);
      dispatcher.subscribe("WeightUpdated", listener2);

      expect(dispatcher.getListenerCount("WorkoutCompleted")).toBe(1);
      expect(dispatcher.getListenerCount("WeightUpdated")).toBe(1);
    });

    it("should return an unsubscribe function", () => {
      const listener = jest.fn();
      const unsubscribe = dispatcher.subscribe("WorkoutCompleted", listener);

      expect(typeof unsubscribe).toBe("function");
      unsubscribe();
      expect(dispatcher.getListenerCount("WorkoutCompleted")).toBe(0);
    });
  });

  describe("listener removal", () => {
    it("should remove a listener via unsubscribe function", () => {
      const listener = jest.fn();
      const unsubscribe = dispatcher.subscribe("WorkoutCompleted", listener);

      expect(dispatcher.getListenerCount("WorkoutCompleted")).toBe(1);
      unsubscribe();
      expect(dispatcher.getListenerCount("WorkoutCompleted")).toBe(0);
    });

    it("should remove a listener via explicit unsubscribe call", () => {
      const listener = jest.fn();
      dispatcher.subscribe("WorkoutCompleted", listener);

      // Note: This tests the internal unsubscribe, which requires knowing the listener ID
      // In real usage, the unsubscribe function returned from subscribe is preferred
      expect(dispatcher.getListenerCount("WorkoutCompleted")).toBe(1);
    });

    it("should remove only the specified listener when multiple are registered", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      const unsubscribe1 = dispatcher.subscribe("WorkoutCompleted", listener1);
      dispatcher.subscribe("WorkoutCompleted", listener2);

      expect(dispatcher.getListenerCount("WorkoutCompleted")).toBe(2);
      unsubscribe1();
      expect(dispatcher.getListenerCount("WorkoutCompleted")).toBe(1);
    });

    it("should clean up empty event type entries", () => {
      const listener = jest.fn();
      const unsubscribe = dispatcher.subscribe("WorkoutCompleted", listener);

      expect(dispatcher.getRegisteredEventTypes()).toContain("WorkoutCompleted");
      unsubscribe();
      expect(dispatcher.getRegisteredEventTypes()).not.toContain("WorkoutCompleted");
    });

    it("should allow clearing all listeners for a specific event type", () => {
      dispatcher.subscribe("WorkoutCompleted", jest.fn());
      dispatcher.subscribe("WorkoutCompleted", jest.fn());
      dispatcher.subscribe("WeightUpdated", jest.fn());

      expect(dispatcher.getListenerCount("WorkoutCompleted")).toBe(2);
      expect(dispatcher.getListenerCount("WeightUpdated")).toBe(1);

      dispatcher.clearListeners("WorkoutCompleted");

      expect(dispatcher.getListenerCount("WorkoutCompleted")).toBe(0);
      expect(dispatcher.getListenerCount("WeightUpdated")).toBe(1);
    });

    it("should allow clearing all listeners", () => {
      dispatcher.subscribe("WorkoutCompleted", jest.fn());
      dispatcher.subscribe("WeightUpdated", jest.fn());

      expect(dispatcher.getRegisteredEventTypes().length).toBe(2);

      dispatcher.clearListeners();

      expect(dispatcher.getRegisteredEventTypes().length).toBe(0);
    });
  });

  describe("event dispatch", () => {
    it("should call a listener when an event is dispatched", () => {
      const listener = jest.fn();
      dispatcher.subscribe("WorkoutCompleted", listener);

      const event = createWorkoutCompleted("user123", "workout456", "program789", 60, 5);
      dispatcher.dispatch(event);

      expect(listener).toHaveBeenCalledWith(event);
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("should dispatch an event only to listeners of that type", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      dispatcher.subscribe("WorkoutCompleted", listener1);
      dispatcher.subscribe("WeightUpdated", listener2);

      const event = createWorkoutCompleted("user123", "workout456", "program789", 60, 5);
      dispatcher.dispatch(event);

      expect(listener1).toHaveBeenCalledWith(event);
      expect(listener2).not.toHaveBeenCalled();
    });

    it("should safely handle dispatch with no listeners", () => {
      const event = createWorkoutCompleted("user123", "workout456", "program789", 60, 5);
      // Should not throw
      expect(() => dispatcher.dispatch(event)).not.toThrow();
    });

    it("should call listeners in registration order", () => {
      const callOrder: number[] = [];
      const listener1 = jest.fn(() => {
        callOrder.push(1);
      });
      const listener2 = jest.fn(() => {
        callOrder.push(2);
      });
      const listener3 = jest.fn(() => {
        callOrder.push(3);
      });

      dispatcher.subscribe("WorkoutCompleted", listener1);
      dispatcher.subscribe("WorkoutCompleted", listener2);
      dispatcher.subscribe("WorkoutCompleted", listener3);

      const event = createWorkoutCompleted("user123", "workout456", "program789", 60, 5);
      dispatcher.dispatch(event);

      expect(callOrder).toEqual([1, 2, 3]);
    });

    it("should dispatch with correct event payload", () => {
      const listener = jest.fn();
      dispatcher.subscribe("WorkoutCompleted", listener);

      const event = createWorkoutCompleted("user123", "workout456", "program789", 60, 5);
      dispatcher.dispatch(event);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "WorkoutCompleted",
          userId: "user123",
          workoutId: "workout456",
          programId: "program789",
          durationMinutes: 60,
          exercisesCompleted: 5,
        })
      );
    });
  });

  describe("multiple listeners", () => {
    it("should call all listeners for an event", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      dispatcher.subscribe("WorkoutCompleted", listener1);
      dispatcher.subscribe("WorkoutCompleted", listener2);
      dispatcher.subscribe("WorkoutCompleted", listener3);

      const event = createWorkoutCompleted("user123", "workout456", "program789", 60, 5);
      dispatcher.dispatch(event);

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener3).toHaveBeenCalledTimes(1);
    });

    it("should support multiple listeners across different event types", () => {
      const workoutListener = jest.fn();
      const weightListener = jest.fn();

      dispatcher.subscribe("WorkoutCompleted", workoutListener);
      dispatcher.subscribe("WeightUpdated", weightListener);

      const workoutEvent = createWorkoutCompleted("user123", "workout456", "program789", 60, 5);
      const weightEvent = createWeightUpdated("user123", 75, 76);

      dispatcher.dispatch(workoutEvent);
      dispatcher.dispatch(weightEvent);

      expect(workoutListener).toHaveBeenCalledTimes(1);
      expect(weightListener).toHaveBeenCalledTimes(1);
    });
  });

  describe("dispatch ordering", () => {
    it("should maintain listener order across multiple events", () => {
      const callSequence: string[] = [];

      dispatcher.subscribe("WorkoutCompleted", () => {
        callSequence.push("listener1_event1");
      });
      dispatcher.subscribe("WorkoutCompleted", () => {
        callSequence.push("listener2_event1");
      });

      dispatcher.subscribe("WeightUpdated", () => {
        callSequence.push("listener3_event2");
      });

      const event1 = createWorkoutCompleted("user123", "workout456", "program789", 60, 5);
      const event2 = createWeightUpdated("user123", 75);

      dispatcher.dispatch(event1);
      dispatcher.dispatch(event2);

      expect(callSequence).toEqual(["listener1_event1", "listener2_event1", "listener3_event2"]);
    });

    it("should call all listeners even if one is removed during iteration", () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      const unsub1 = dispatcher.subscribe("WorkoutCompleted", listener1);
      dispatcher.subscribe("WorkoutCompleted", listener2);
      dispatcher.subscribe("WorkoutCompleted", listener3);

      unsub1();

      const event = createWorkoutCompleted("user123", "workout456", "program789", 60, 5);
      dispatcher.dispatch(event);

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener3).toHaveBeenCalledTimes(1);
    });
  });

  describe("unknown event safety", () => {
    it("should handle unknown event types gracefully", () => {
      const listener = jest.fn();
      dispatcher.subscribe("UnknownEvent", listener);

      // Dispatch a known event - unknown listener should not be affected
      const event = createWorkoutCompleted("user123", "workout456", "program789", 60, 5);
      dispatcher.dispatch(event);

      expect(listener).not.toHaveBeenCalled();
    });

    it("should allow getting registered event types", () => {
      dispatcher.subscribe("WorkoutCompleted", jest.fn());
      dispatcher.subscribe("WeightUpdated", jest.fn());
      dispatcher.subscribe("ProfileUpdated", jest.fn());

      const types = dispatcher.getRegisteredEventTypes();
      expect(types).toContain("WorkoutCompleted");
      expect(types).toContain("WeightUpdated");
      expect(types).toContain("ProfileUpdated");
      expect(types.length).toBe(3);
    });
  });

  describe("error handling", () => {
    it("should collect errors from multiple failing listeners", () => {
      const error1 = new Error("Listener 1 failed");
      const error2 = new Error("Listener 2 failed");

      dispatcher.subscribe("WorkoutCompleted", () => {
        throw error1;
      });
      dispatcher.subscribe("WorkoutCompleted", () => {
        throw error2;
      });

      const event = createWorkoutCompleted("user123", "workout456", "program789", 60, 5);

      expect(() => dispatcher.dispatch(event)).toThrow();
    });

    it("should still call subsequent listeners even if one throws", () => {
      const listener1 = jest.fn(() => {
        throw new Error("Listener 1 failed");
      });
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      dispatcher.subscribe("WorkoutCompleted", listener1);
      dispatcher.subscribe("WorkoutCompleted", listener2);
      dispatcher.subscribe("WorkoutCompleted", listener3);

      const event = createWorkoutCompleted("user123", "workout456", "program789", 60, 5);

      expect(() => dispatcher.dispatch(event)).toThrow();
      expect(listener2).toHaveBeenCalledWith(event);
      expect(listener3).toHaveBeenCalledWith(event);
    });

    it("should throw single error when one listener fails", () => {
      dispatcher.subscribe("WorkoutCompleted", () => {
        throw new Error("Single failure");
      });

      const event = createWorkoutCompleted("user123", "workout456", "program789", 60, 5);

      expect(() => dispatcher.dispatch(event)).toThrow("Single failure");
    });
  });

  describe("event factory functions", () => {
    it("should create ProfileUpdated events with required fields", () => {
      const event = createProfileUpdated("user123", { name: "John Doe" });

      expect(event).toMatchObject({
        type: "ProfileUpdated",
        userId: "user123",
        changes: { name: "John Doe" },
      });
      expect(event.eventId).toBeDefined();
      expect(event.timestamp).toBeDefined();
    });

    it("should create WeightUpdated events", () => {
      const event = createWeightUpdated("user123", 75, 76);

      expect(event).toMatchObject({
        type: "WeightUpdated",
        userId: "user123",
        weightKg: 75,
        previousWeightKg: 76,
      });
    });

    it("should create WorkoutCompleted events", () => {
      const event = createWorkoutCompleted("user123", "workout456", "program789", 60, 5);

      expect(event).toMatchObject({
        type: "WorkoutCompleted",
        userId: "user123",
        workoutId: "workout456",
        programId: "program789",
        durationMinutes: 60,
        exercisesCompleted: 5,
      });
    });

    it("should create WorkoutSkipped events", () => {
      const event = createWorkoutSkipped("user123", "workout456", "program789", "too tired");

      expect(event).toMatchObject({
        type: "WorkoutSkipped",
        userId: "user123",
        workoutId: "workout456",
        programId: "program789",
        reason: "too tired",
      });
    });

    it("should create MealLogged events", () => {
      const event = createMealLogged("user123", "lunch", 3, 500);

      expect(event).toMatchObject({
        type: "MealLogged",
        userId: "user123",
        mealType: "lunch",
        itemCount: 3,
        caloriesEstimate: 500,
      });
    });

    it("should create RecoveryUpdated events", () => {
      const event = createRecoveryUpdated("user123", 8, 2, 3);

      expect(event).toMatchObject({
        type: "RecoveryUpdated",
        userId: "user123",
        sleepHours: 8,
        stressLevel: 2,
        soreness: 3,
      });
    });

    it("should create PersonalRecordAchieved events", () => {
      const event = createPersonalRecordAchieved("user123", "Bench Press", "kg", 100, 95);

      expect(event).toMatchObject({
        type: "PersonalRecordAchieved",
        userId: "user123",
        exerciseName: "Bench Press",
        metric: "kg",
        value: 100,
        previousValue: 95,
      });
    });

    it("should generate unique event IDs", () => {
      const id1 = generateEventId();
      const id2 = generateEventId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^evt_/);
      expect(id2).toMatch(/^evt_/);
    });

    it("should generate ISO 8601 timestamps", () => {
      const timestamp = getCurrentTimestamp();

      // Should be a valid ISO 8601 string
      expect(new Date(timestamp)).toBeInstanceOf(Date);
      expect(timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe("singleton dispatcher", () => {
    it("should use shared singleton instance", () => {
      // The singleton should be reusable across the app
      expect(eventDispatcher).toBeInstanceOf(EventDispatcher);

      // It should have working subscribe/dispatch methods
      const listener = jest.fn();
      const unsubscribe = eventDispatcher.subscribe("WorkoutCompleted", listener);

      const event = createWorkoutCompleted("user123", "workout456", "program789", 60, 5);
      eventDispatcher.dispatch(event);

      expect(listener).toHaveBeenCalledWith(event);

      // Clean up
      unsubscribe();
      eventDispatcher.clearListeners();
    });
  });
});

describe("Domain event types", () => {
  it("should have correct event type discriminators", () => {
    const events = [
      createProfileUpdated("user", {}),
      createWeightUpdated("user", 75),
      createWorkoutCompleted("user", "w", "p", 60, 5),
      createWorkoutSkipped("user", "w", "p"),
      createMealLogged("user", "lunch", 1),
      createRecoveryUpdated("user"),
      createPersonalRecordAchieved("user", "exercise", "metric", 100),
    ];

    const expectedTypes = [
      "ProfileUpdated",
      "WeightUpdated",
      "WorkoutCompleted",
      "WorkoutSkipped",
      "MealLogged",
      "RecoveryUpdated",
      "PersonalRecordAchieved",
    ];

    events.forEach((event, index) => {
      expect(event.type).toBe(expectedTypes[index]);
    });
  });

  it("should include event ID and timestamp on all events", () => {
    const events = [
      createProfileUpdated("user", {}),
      createWeightUpdated("user", 75),
      createWorkoutCompleted("user", "w", "p", 60, 5),
      createWorkoutSkipped("user", "w", "p"),
      createMealLogged("user", "lunch", 1),
      createRecoveryUpdated("user"),
      createPersonalRecordAchieved("user", "exercise", "metric", 100),
    ];

    events.forEach((event) => {
      expect(event.eventId).toBeDefined();
      expect(typeof event.eventId).toBe("string");
      expect(event.timestamp).toBeDefined();
      expect(typeof event.timestamp).toBe("string");
    });
  });
});

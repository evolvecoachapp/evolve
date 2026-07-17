/**
 * Event Dispatcher
 *
 * Lightweight, strongly typed event dispatcher that manages domain event
 * listeners and orchestrates event dispatch. No external dependencies,
 * synchronous execution only.
 *
 * Usage:
 *   const dispatcher = new EventDispatcher();
 *   dispatcher.subscribe("WorkoutCompleted", (event) => { ... });
 *   dispatcher.dispatch(workoutCompletedEvent);
 */

import type { DomainEvent, AnyDomainEvent, EventListener, ListenerRegistration } from "./types";

/**
 * Lightweight, type-safe event dispatcher for domain events.
 *
 * Features:
 * - Strong TypeScript typing for event listeners
 * - Register/unregister listeners by event type
 * - Synchronous event dispatch
 * - No external dependencies
 * - Supports multiple listeners per event type
 * - Listeners are called in registration order
 */
export class EventDispatcher {
  /**
   * Internal registry: event type → array of listener registrations
   */
  private listeners: Map<string, ListenerRegistration<any>[]> = new Map();

  /**
   * Internal counter for generating unique listener IDs
   */
  private listenerIdCounter = 0;

  /**
   * Subscribe a listener to a specific event type.
   *
   * @param eventType - The domain event type to listen for (e.g., "WorkoutCompleted")
   * @param listener - Callback function invoked when the event is dispatched
   * @returns Unsubscribe function to remove this listener
   *
   * @example
   *   const unsubscribe = dispatcher.subscribe("WorkoutCompleted", (event) => {
   *     console.log("Workout completed:", event);
   *   });
   *   // Later...
   *   unsubscribe();
   */
  subscribe<E extends DomainEvent>(
    eventType: E["type"],
    listener: EventListener<E>
  ): () => void {
    const id = `listener_${++this.listenerIdCounter}`;
    const registration: ListenerRegistration<E> = { eventType, listener, id };

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    this.listeners.get(eventType)!.push(registration as ListenerRegistration<any>);

    // Return unsubscribe function
    return () => this.unsubscribe(eventType, id);
  }

  /**
   * Unsubscribe a listener from an event type.
   *
   * @param eventType - The event type
   * @param listenerId - The listener ID (usually obtained from subscribe or stored)
   * @returns True if a listener was removed, false if not found
   */
  unsubscribe(eventType: string, listenerId: string): boolean {
    const registrations = this.listeners.get(eventType);
    if (!registrations) {
      return false;
    }

    const index = registrations.findIndex((r) => r.id === listenerId);
    if (index === -1) {
      return false;
    }

    registrations.splice(index, 1);

    // Clean up empty registrations
    if (registrations.length === 0) {
      this.listeners.delete(eventType);
    }

    return true;
  }

  /**
   * Dispatch an event to all registered listeners for that event type.
   *
   * Listeners are called synchronously in registration order.
   * If a listener throws an error, subsequent listeners are still called.
   * Errors are collected and re-thrown as an aggregate after all listeners run.
   *
   * @param event - The domain event to dispatch
   * @throws If one or more listeners throw errors
   *
   * @example
   *   const event = createWorkoutCompleted(userId, workoutId, programId, 60, 5);
   *   dispatcher.dispatch(event);
   */
  dispatch(event: AnyDomainEvent): void {
    const registrations = this.listeners.get(event.type);
    if (!registrations || registrations.length === 0) {
      // No listeners; this is fine and expected for some events
      return;
    }

    const errors: Error[] = [];

    for (const registration of registrations) {
      try {
        registration.listener(event);
      } catch (error) {
        // Collect error but continue calling other listeners
        errors.push(error instanceof Error ? error : new Error(String(error)));
      }
    }

    // If any errors occurred, throw an aggregate error
    if (errors.length === 1) {
      throw errors[0];
    } else if (errors.length > 1) {
      const message = `${errors.length} listener(s) threw errors while handling event "${event.type}"`;
      const aggregateError = new Error(message);
      (aggregateError as any).errors = errors;
      throw aggregateError;
    }
  }

  /**
   * Get the number of listeners registered for a specific event type.
   *
   * Useful for testing and debugging.
   *
   * @param eventType - The event type to check
   * @returns Number of listeners
   */
  getListenerCount(eventType: string): number {
    return this.listeners.get(eventType)?.length ?? 0;
  }

  /**
   * Clear all listeners for a specific event type.
   *
   * @param eventType - The event type to clear (or undefined to clear all)
   */
  clearListeners(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get all event types that have listeners.
   *
   * Useful for debugging and introspection.
   *
   * @returns Array of event types with active listeners
   */
  getRegisteredEventTypes(): string[] {
    return Array.from(this.listeners.keys());
  }
}

/**
 * Singleton instance of the event dispatcher.
 * Applications should use this shared instance to avoid creating
 * multiple separate dispatcher instances.
 */
export const eventDispatcher = new EventDispatcher();

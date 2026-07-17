/**
 * Domain Event Types
 *
 * Strongly typed event definitions for the domain event system.
 * Each event represents a significant business occurrence that other
 * parts of the application may need to react to, without creating
 * direct coupling between modules.
 */

/**
 * Base interface for all domain events.
 * Provides a timestamp and unique identifier for correlation and ordering.
 */
export interface DomainEvent {
  /** Event type discriminator (e.g., "ProfileUpdated", "WorkoutCompleted") */
  type: string;
  /** ISO 8601 timestamp of when the event occurred */
  timestamp: string;
  /** Unique identifier for this event instance */
  eventId: string;
}

/**
 * Fired when a user's profile information changes
 * (name, email, bio, preferences, etc.)
 */
export interface ProfileUpdated extends DomainEvent {
  type: "ProfileUpdated";
  userId: string;
  changes: Record<string, unknown>;
}

/**
 * Fired when a user's weight is logged or updated
 */
export interface WeightUpdated extends DomainEvent {
  type: "WeightUpdated";
  userId: string;
  weightKg: number;
  previousWeightKg?: number;
}

/**
 * Fired when a user completes a workout session
 */
export interface WorkoutCompleted extends DomainEvent {
  type: "WorkoutCompleted";
  userId: string;
  workoutId: string;
  programId: string;
  durationMinutes: number;
  exercisesCompleted: number;
}

/**
 * Fired when a user skips a scheduled workout
 */
export interface WorkoutSkipped extends DomainEvent {
  type: "WorkoutSkipped";
  userId: string;
  workoutId: string;
  programId: string;
  reason?: string;
}

/**
 * Fired when a user logs a meal
 */
export interface MealLogged extends DomainEvent {
  type: "MealLogged";
  userId: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  caloriesEstimate?: number;
  itemCount: number;
}

/**
 * Fired when a user's recovery metrics are updated
 * (sleep, stress level, soreness, etc.)
 */
export interface RecoveryUpdated extends DomainEvent {
  type: "RecoveryUpdated";
  userId: string;
  sleepHours?: number;
  stressLevel?: 1 | 2 | 3 | 4 | 5;
  soreness?: 1 | 2 | 3 | 4 | 5;
}

/**
 * Fired when a user achieves a new personal record
 */
export interface PersonalRecordAchieved extends DomainEvent {
  type: "PersonalRecordAchieved";
  userId: string;
  exerciseName: string;
  metric: string;
  value: number;
  previousValue?: number;
}

/**
 * Union type of all domain events.
 * Provides type safety when working with event dispatchers and listeners.
 */
export type AnyDomainEvent =
  | ProfileUpdated
  | WeightUpdated
  | WorkoutCompleted
  | WorkoutSkipped
  | MealLogged
  | RecoveryUpdated
  | PersonalRecordAchieved;

/**
 * Type-safe event listener callback
 * Listeners are called with the specific event type they're registered for.
 */
export type EventListener<E extends DomainEvent = DomainEvent> = (event: E) => void | Promise<void>;

/**
 * Event listener registration record
 * Tracks which listeners are subscribed to which event types.
 */
export interface ListenerRegistration<E extends DomainEvent = DomainEvent> {
  eventType: E["type"];
  listener: EventListener<E>;
  id: string;
}

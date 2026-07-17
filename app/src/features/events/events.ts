/**
 * Domain Event Factories
 *
 * Factory functions for creating domain events with proper
 * initialization (timestamps, event IDs, etc.).
 */

import type {
  ProfileUpdated,
  WeightUpdated,
  WorkoutCompleted,
  WorkoutSkipped,
  MealLogged,
  RecoveryUpdated,
  PersonalRecordAchieved,
} from "./types";

/**
 * Generates a unique event ID
 * In a real system, this might use UUIDs or database IDs;
 * for now, we use timestamp + random suffix for predictability in tests.
 */
export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Gets the current ISO 8601 timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Factory for ProfileUpdated event
 */
export function createProfileUpdated(
  userId: string,
  changes: Record<string, unknown>
): ProfileUpdated {
  return {
    type: "ProfileUpdated",
    userId,
    changes,
    timestamp: getCurrentTimestamp(),
    eventId: generateEventId(),
  };
}

/**
 * Factory for WeightUpdated event
 */
export function createWeightUpdated(
  userId: string,
  weightKg: number,
  previousWeightKg?: number
): WeightUpdated {
  return {
    type: "WeightUpdated",
    userId,
    weightKg,
    previousWeightKg,
    timestamp: getCurrentTimestamp(),
    eventId: generateEventId(),
  };
}

/**
 * Factory for WorkoutCompleted event
 */
export function createWorkoutCompleted(
  userId: string,
  workoutId: string,
  programId: string,
  durationMinutes: number,
  exercisesCompleted: number
): WorkoutCompleted {
  return {
    type: "WorkoutCompleted",
    userId,
    workoutId,
    programId,
    durationMinutes,
    exercisesCompleted,
    timestamp: getCurrentTimestamp(),
    eventId: generateEventId(),
  };
}

/**
 * Factory for WorkoutSkipped event
 */
export function createWorkoutSkipped(
  userId: string,
  workoutId: string,
  programId: string,
  reason?: string
): WorkoutSkipped {
  return {
    type: "WorkoutSkipped",
    userId,
    workoutId,
    programId,
    reason,
    timestamp: getCurrentTimestamp(),
    eventId: generateEventId(),
  };
}

/**
 * Factory for MealLogged event
 */
export function createMealLogged(
  userId: string,
  mealType: "breakfast" | "lunch" | "dinner" | "snack",
  itemCount: number,
  caloriesEstimate?: number
): MealLogged {
  return {
    type: "MealLogged",
    userId,
    mealType,
    caloriesEstimate,
    itemCount,
    timestamp: getCurrentTimestamp(),
    eventId: generateEventId(),
  };
}

/**
 * Factory for RecoveryUpdated event
 */
export function createRecoveryUpdated(
  userId: string,
  sleepHours?: number,
  stressLevel?: 1 | 2 | 3 | 4 | 5,
  soreness?: 1 | 2 | 3 | 4 | 5
): RecoveryUpdated {
  return {
    type: "RecoveryUpdated",
    userId,
    sleepHours,
    stressLevel,
    soreness,
    timestamp: getCurrentTimestamp(),
    eventId: generateEventId(),
  };
}

/**
 * Factory for PersonalRecordAchieved event
 */
export function createPersonalRecordAchieved(
  userId: string,
  exerciseName: string,
  metric: string,
  value: number,
  previousValue?: number
): PersonalRecordAchieved {
  return {
    type: "PersonalRecordAchieved",
    userId,
    exerciseName,
    metric,
    value,
    previousValue,
    timestamp: getCurrentTimestamp(),
    eventId: generateEventId(),
  };
}

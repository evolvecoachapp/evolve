/**
 * Daily Coach Listener
 *
 * Reacts to relevant domain events to provide daily coaching insights.
 * Subscribes to:
 * - WorkoutCompleted: Acknowledge the completion
 * - WorkoutSkipped: Provide encouragement
 * - PersonalRecordAchieved: Celebrate the achievement
 */

import type { WorkoutCompleted, WorkoutSkipped, PersonalRecordAchieved } from "../types";
import { eventDispatcher } from "../dispatcher";

export class DailyCoachListener {
  private unsubscribers: Array<() => void> = [];

  /**
   * Start listening to events
   * Call this when the daily coach feature is initialized
   */
  subscribe(): void {
    this.unsubscribers.push(
      eventDispatcher.subscribe<WorkoutCompleted>("WorkoutCompleted", (event) => {
        this.onWorkoutCompleted(event);
      })
    );

    this.unsubscribers.push(
      eventDispatcher.subscribe<WorkoutSkipped>("WorkoutSkipped", (event) => {
        this.onWorkoutSkipped(event);
      })
    );

    this.unsubscribers.push(
      eventDispatcher.subscribe<PersonalRecordAchieved>(
        "PersonalRecordAchieved",
        (event) => {
          this.onPersonalRecordAchieved(event);
        }
      )
    );
  }

  /**
   * Stop listening to all events
   * Call this when the daily coach feature is being destroyed
   */
  unsubscribe(): void {
    this.unsubscribers.forEach((fn) => fn());
    this.unsubscribers = [];
  }

  private onWorkoutCompleted(event: WorkoutCompleted): void {
    // Example: Daily coach acknowledges workout completion
    console.log(
      `[DailyCoachListener] Workout ${event.workoutId} completed in ${event.durationMinutes} minutes`
    );
    // In a real app, this might:
    // - Update coach state
    // - Schedule next coaching prompt
    // - Persist completion metrics
  }

  private onWorkoutSkipped(event: WorkoutSkipped): void {
    // Example: Daily coach provides encouragement for skipped workouts
    console.log(`[DailyCoachListener] Workout ${event.workoutId} was skipped. Reason: ${event.reason}`);
    // In a real app, this might:
    // - Show a recovery-focused message
    // - Offer alternative lighter workouts
    // - Adjust the program dynamically
  }

  private onPersonalRecordAchieved(event: PersonalRecordAchieved): void {
    // Example: Daily coach celebrates achievement
    console.log(
      `[DailyCoachListener] Personal record! ${event.exerciseName}: ${event.value} ${event.metric}`
    );
    // In a real app, this might:
    // - Unlock new achievements
    // - Update user stats
    // - Trigger a celebration animation
  }
}

/**
 * Notification Listener
 *
 * Reacts to domain events to determine when user notifications should be triggered.
 * Subscribes to:
 * - WorkoutCompleted: Send completion confirmation
 * - WorkoutSkipped: Send encouragement notification
 * - PersonalRecordAchieved: Send celebratory notification
 * - RecoveryUpdated: Send recovery insights
 */

import type {
  WorkoutCompleted,
  WorkoutSkipped,
  PersonalRecordAchieved,
  RecoveryUpdated,
} from "../types";
import { eventDispatcher } from "../dispatcher";

export class NotificationListener {
  private unsubscribers: Array<() => void> = [];

  /**
   * Start listening to events
   * Call this when the notification system is initialized
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

    this.unsubscribers.push(
      eventDispatcher.subscribe<RecoveryUpdated>("RecoveryUpdated", (event) => {
        this.onRecoveryUpdated(event);
      })
    );
  }

  /**
   * Stop listening to all events
   * Call this when the notification system is being destroyed
   */
  unsubscribe(): void {
    this.unsubscribers.forEach((fn) => fn());
    this.unsubscribers = [];
  }

  private onWorkoutCompleted(event: WorkoutCompleted): void {
    // Example: Send notification for completed workout
    console.log(
      `[NotificationListener] Sending completion notification for workout ${event.workoutId}`
    );
    // In a real app, this might:
    // - Send push notification
    // - Add to notification center
    // - Trigger badge update
    // - Log analytics event
  }

  private onWorkoutSkipped(event: WorkoutSkipped): void {
    // Example: Send gentle encouragement for skipped workout
    console.log(`[NotificationListener] Sending encouragement for skipped workout ${event.workoutId}`);
    // In a real app, this might:
    // - Send motivational notification
    // - Offer alternative quick workout
    // - Suggest rescheduling
    // - Track skip patterns
  }

  private onPersonalRecordAchieved(event: PersonalRecordAchieved): void {
    // Example: Send celebratory notification for new personal record
    console.log(
      `[NotificationListener] Sending celebration notification for new PR: ${event.exerciseName}`
    );
    // In a real app, this might:
    // - Send celebratory notification
    // - Unlock achievement badge
    // - Share to social media (if enabled)
    // - Add to hall of fame
  }

  private onRecoveryUpdated(event: RecoveryUpdated): void {
    // Example: Send recovery insights based on recovery metrics
    console.log(`[NotificationListener] Sending recovery insights for user ${event.userId}`);
    // In a real app, this might:
    // - Analyze sleep quality
    // - Provide recovery recommendations
    // - Suggest active recovery vs rest day
    // - Alert if sleep is insufficient
  }
}

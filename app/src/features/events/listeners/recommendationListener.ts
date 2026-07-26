/**
 * Recommendation Listener
 *
 * Reacts to domain events for recommendation-adjacent side effects.
 *
 * Sprint 23.2 — WeightUpdated recommendation generation is owned solely by
 * `initializeWeightUpdatedPipeline` (Composition Root path). This listener
 * must not duplicate that orchestration.
 *
 * Subscribes to:
 * - ProfileUpdated: Update recommendations based on new profile data
 * - WeightUpdated: no-op (pipeline owns recommendation flow)
 * - WorkoutCompleted: Consider historical performance for future recommendations
 * - MealLogged: Refine nutritional recommendations
 */

import type {
  ProfileUpdated,
  WeightUpdated,
  WorkoutCompleted,
  MealLogged,
} from "../types";
import { eventDispatcher } from "../dispatcher";

export class RecommendationListener {
  private unsubscribers: Array<() => void> = [];

  /**
   * Start listening to events
   * Call this when the recommendation engine is initialized
   */
  subscribe(): void {
    this.unsubscribers.push(
      eventDispatcher.subscribe<ProfileUpdated>("ProfileUpdated", (event) => {
        this.onProfileUpdated(event);
      })
    );

    this.unsubscribers.push(
      eventDispatcher.subscribe<WeightUpdated>("WeightUpdated", (event) => {
        this.onWeightUpdated(event);
      })
    );

    this.unsubscribers.push(
      eventDispatcher.subscribe<WorkoutCompleted>("WorkoutCompleted", (event) => {
        this.onWorkoutCompleted(event);
      })
    );

    this.unsubscribers.push(
      eventDispatcher.subscribe<MealLogged>("MealLogged", (event) => {
        this.onMealLogged(event);
      })
    );
  }

  /**
   * Stop listening to all events
   * Call this when the recommendation engine is being destroyed
   */
  unsubscribe(): void {
    this.unsubscribers.forEach((fn) => fn());
    this.unsubscribers = [];
  }

  private onProfileUpdated(event: ProfileUpdated): void {
    // Example: Recommendation engine recomputes based on profile changes
    console.log(`[RecommendationListener] Profile updated for user ${event.userId}`);
    // In a real app, this might:
    // - Recompute personalized workout recommendations
    // - Adjust nutrition targets
    // - Update AI model inputs
    // - Cache invalidation
  }

  private onWeightUpdated(_event: WeightUpdated): void {
    // Sprint 23.2 — WeightUpdated recommendation orchestration is owned solely by
    // `initializeWeightUpdatedPipeline` (Composition Root Recommendation Engine bridge).
    // Intentionally a no-op to avoid a duplicate recommendation execution path.
  }

  private onWorkoutCompleted(event: WorkoutCompleted): void {
    // Example: Learn from workout completion for future recommendations
    console.log(
      `[RecommendationListener] Workout completed: ${event.exercisesCompleted} exercises in ${event.durationMinutes} minutes`
    );
    // In a real app, this might:
    // - Update user performance history
    // - Adjust difficulty for next session
    // - Calculate recovery needs
    // - Recommend related exercises
  }

  private onMealLogged(event: MealLogged): void {
    // Example: Refine nutrition recommendations based on eating patterns
    console.log(
      `[RecommendationListener] ${event.mealType} logged with ${event.itemCount} items`
    );
    // In a real app, this might:
    // - Analyze eating patterns
    // - Suggest meal alternatives
    // - Track macro adherence
    // - Update nutritional recommendations
  }
}

/**
 * Event System Exports
 *
 * Public API for the domain event system.
 */

// Core types
export type {
  DomainEvent,
  ProfileUpdated,
  WeightUpdated,
  WorkoutCompleted,
  WorkoutSkipped,
  MealLogged,
  RecoveryUpdated,
  PersonalRecordAchieved,
  AnyDomainEvent,
  EventListener,
  ListenerRegistration,
} from "./types";

// Event factories
export {
  generateEventId,
  getCurrentTimestamp,
  createProfileUpdated,
  createWeightUpdated,
  createWorkoutCompleted,
  createWorkoutSkipped,
  createMealLogged,
  createRecoveryUpdated,
  createPersonalRecordAchieved,
} from "./events";

// Dispatcher
export { EventDispatcher, eventDispatcher } from "./dispatcher";

// Listeners
export { DailyCoachListener } from "./listeners/dailyCoachListener";
export { RecommendationListener } from "./listeners/recommendationListener";
export { NotificationListener } from "./listeners/notificationListener";

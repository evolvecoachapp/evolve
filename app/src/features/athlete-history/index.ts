/**
 * Athlete History Foundation (Sprint 18.5).
 *
 * Immutable chronological record of an athlete's journey.
 * Aggregates domain facts from Workout / Performance / Achievement.
 *
 * Workout Runtime → Domain Events → Performance Snapshot → Achievement Result
 * → Athlete History → History Snapshot → Future Consumers
 *
 * Architecture supports future entry types (nutrition, recovery, sleep, …)
 * without redesign. No AI. No persistence. No networking. No UI timeline.
 * Never modifies upstream engines.
 */

export * from "./models";
export * from "./builders";
export * from "./aggregators";
export * from "./validators";
export * from "./utils";
export * from "./engine";
export * from "./services";
export {
  buildAthleteHistory,
  createHistorySnapshot,
  summarizeHistory,
} from "./application";

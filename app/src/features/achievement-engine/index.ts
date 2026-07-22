/**
 * Achievement Engine Foundation (Sprint 18.4).
 *
 * Detects immutable achievements from Performance Snapshots.
 *
 * Performance Snapshot → Achievement Engine → Achievement Result → Achievement Events
 *
 * First category: Personal Records. Architecture supports future categories.
 * No AI. No persistence. No networking. No history implementation.
 * Never modifies Performance Engine or Workout Runtime.
 */

export * from "./models";
export * from "./builders";
export * from "./validators";
export * from "./detectors";
export * from "./events";
export * from "./utils";
export * from "./engine";
export * from "./services";
export {
  evaluateAchievements,
  detectPersonalRecords,
  summarizeAchievements,
} from "./application";

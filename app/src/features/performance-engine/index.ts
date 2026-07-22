/**
 * Performance Engine Foundation (Sprint 18.3).
 *
 * Analyzes completed workout execution into immutable Performance Snapshots.
 *
 * Domain Events → Workout Result → Performance Engine → Performance Snapshot
 *
 * Single-session only. No AI. No persistence. No networking. No history.
 * Never modifies workout execution or program generation.
 */

export * from "./models";
export * from "./builders";
export * from "./validators";
export * from "./calculators";
export * from "./utils";
export * from "./engine";
export * from "./services";
export {
  analyzeWorkoutPerformance,
  summarizePerformance,
  gradePerformance,
} from "./application";

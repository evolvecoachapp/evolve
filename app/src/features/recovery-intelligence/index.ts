/**
 * Recovery Intelligence Foundation (Sprint 18.6).
 *
 * Deterministic recovery analysis from completed training context.
 * Consumes Athlete History + Performance Snapshot (+ optional WorkoutResult).
 *
 * Athlete History → Performance Snapshot → Recovery Intelligence Engine
 * → Recovery Snapshot → Future Consumers
 *
 * No AI. No recommendations. No persistence. No networking.
 * No predictions. No sleep analysis. No wearables.
 * Never modifies upstream engines.
 */

export * from "./models";
export * from "./builders";
export * from "./calculators";
export * from "./validators";
export * from "./utils";
export * from "./engine";
export * from "./services";
export {
  analyzeRecovery,
  createRecoverySnapshot,
  summarizeRecovery,
} from "./application";

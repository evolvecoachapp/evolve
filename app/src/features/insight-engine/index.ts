/**
 * Insight Engine Foundation (Sprint 18.7).
 *
 * Deterministic domain insights aggregated from Performance, Achievement,
 * Recovery, and Athlete History into an immutable Insight Snapshot.
 *
 * Performance Snapshot → Achievement Result → Recovery Snapshot → Athlete History
 * → Insight Engine → Insight Snapshot → Future Consumers
 *
 * No AI. No recommendations. No persistence. No networking.
 * No prompt generation. No LLM. No conversation logic.
 * Never modifies upstream engines.
 */

export * from "./models";
export * from "./builders";
export * from "./generators";
export * from "./validators";
export * from "./utils";
export * from "./engine";
export * from "./services";
export {
  createInsightSnapshot,
  generateInsights,
  summarizeInsights,
} from "./application";

/**
 * Decision Intelligence Foundation (Sprint 17.10).
 *
 * Structured domain explanation system for workout-generation decisions.
 * Not a logging framework, telemetry platform, analytics platform, or AI layer.
 *
 * Program Generation → Decision Recorder → Decision Graph →
 * Execution Report → Explanation Report → (future) Coach AI
 */

export * from "./models";
export * from "./recorder";
export * from "./graph";
export * from "./builders";
export * from "./validators";
export * from "./utils";
export * from "./services";
export * from "./integration";
export {
  createDecisionReport,
  createExecutionReport,
  explainWorkoutDecision,
  summarizeDecisionGraph,
} from "./application";

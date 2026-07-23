/**
 * Action Engine
 *
 * Sprint 20.0 — AI Action Engine Foundation.
 *
 * CoachResponse → Action Engine → ActionPlan → Future Tool Runtime
 *
 * Transforms an immutable CoachResponse into an immutable ActionPlan.
 * No domain execution. No networking. No persistence. No provider SDK.
 * No AI calls. No business logic. Only immutable action planning.
 */

export * from "./models";
export {
  buildActionPlan,
  validateActionPlan,
  summarizeActionPlan,
  estimateExecution,
  describeActions,
} from "./application";
export * from "./builders";
export * from "./validators";
export * from "./utils";
export * from "./actions";
export * from "./executors";

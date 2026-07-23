/**
 * Tool Runtime Engine
 *
 * Sprint 20.1 — Tool Runtime Engine Foundation.
 *
 * ActionPlan → Tool Runtime → Tool Resolver → Execution Pipeline
 *   → Domain Tool Adapters → Domain Platform → Tool Results → Execution Result
 *
 * Orchestrates ActionStep execution through Domain Tool Adapters.
 * No business logic. No domain execution directly. No networking. No persistence.
 * No OpenAI / Prompt Builder / Conversation logic. Only runtime orchestration.
 */

export * from "./models";
export {
  executeActionPlan,
  buildExecutionPlan,
  validateExecution,
  estimateExecution,
  describeRuntime,
} from "./application";
export * from "./builders";
export * from "./validators";
export * from "./utils";

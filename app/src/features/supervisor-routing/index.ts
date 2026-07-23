/**
 * Supervisor Routing Engine Foundation
 *
 * Sprint 21.7 — Supervisor Routing Engine Foundation.
 *
 * User Request
 *      ↓
 * Routing Engine
 *      ↓
 * Capability Registry
 *      ↓
 * Routing Plan
 *      ↓
 * Agent Collaboration
 *      ↓
 * Specialist Agents
 *
 * Transforms a user request into a deterministic multi-agent routing plan.
 * Coach Supervisor consumes this module.
 *
 * No AI. No prompts. No networking. No persistence.
 * No agent execution. No collaboration execution. No business logic.
 */

export * from "./models";
export {
  buildRoutingPlan,
  resolveRouting,
  validateRoutingPlan,
  describeRouting,
  buildRoutingSnapshot,
} from "./application";
export * from "./builders";
export * from "./validators";
export * from "./policies";
export * from "./routing";
export * from "./planner";
export * from "./resolver";
export * from "./selectors";
export * from "./utils";
export * from "./contracts";
export {
  SupervisorRoutingService,
  createSupervisorRoutingService,
} from "./services";

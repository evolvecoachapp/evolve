/**
 * Agent Collaboration Foundation
 *
 * Sprint 21.5 — Agent Collaboration Foundation.
 *
 * Coach Agent
 *      ↓
 * Agent Collaboration
 *      ↓
 * Planning → Dispatch → Execution → Aggregation
 *      ↓
 * Coach Result
 *
 * Owns orchestration only. Business logic remains inside specialist agents.
 * No AI. No prompts. No networking. No persistence. No conversation memory.
 */

export * from "./models";
export {
  createCollaborationPlan,
  dispatchCollaboration,
  executeCollaboration,
  aggregateResults,
  buildCollaborationSnapshot,
} from "./application";
export * from "./builders";
export * from "./validators";
export * from "./policies";
export * from "./planning";
export * from "./dispatch";
export * from "./execution";
export * from "./aggregation";
export * from "./utils";
export {
  AgentCollaborationService,
  createAgentCollaborationService,
} from "./services";

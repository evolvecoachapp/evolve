/**
 * Agent Capability Registry Foundation
 *
 * Sprint 21.6 — Agent Capability Registry Foundation.
 *
 * Coach Agent
 *      ↓
 * Capability Resolver
 *      ↓
 * Capability Registry
 *      ↓
 * Agent Collaboration
 *      ↓
 * Specialist Agents
 *
 * Single source of truth for what every agent is capable of.
 * Coach reasons in capabilities — not concrete specialist agent names.
 *
 * No AI. No prompts. No networking. No persistence. No memory.
 * No agent execution. No business logic. No DI container.
 */

export * from "./models";
export {
  registerCapability,
  resolveCapability,
  findCapability,
  findCapabilities,
  buildCapabilitySnapshot,
  validateRegistry,
} from "./application";
export * from "./builders";
export * from "./validators";
export * from "./policies";
export * from "./registry";
export * from "./resolver";
export * from "./registration";
export * from "./querying";
export * from "./utils";
export {
  AgentCapabilityService,
  createAgentCapabilityService,
} from "./services";

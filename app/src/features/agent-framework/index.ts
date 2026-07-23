/**
 * Agent Framework
 *
 * Sprint 21.1 — Agent Framework Foundation.
 *
 * User Request
 *      ↓
 * Agent Framework
 *      ↓
 * Workout / Nutrition / Recovery / Goal / Coach Supervisor Agents
 *      ↓
 * AI Runtime → Tool Runtime → Domain
 *
 * Common contracts, lifecycle, and orchestration model for every intelligent
 * agent. No domain-specific logic. No prompts. No providers. No networking.
 * No persistence. Immutable agent infrastructure only.
 */

export * from "./models";
export * from "./contracts";
export * from "./application";
export * from "./builders";
export * from "./validators";
export * from "./registry";
export * from "./factory";
export * from "./lifecycle";
export * from "./capabilities";
export * from "./selectors";
export * from "./policies";
export * from "./services";
export * from "./utils";

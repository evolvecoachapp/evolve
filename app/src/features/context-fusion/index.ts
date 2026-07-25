/**
 * Context Fusion Engine
 *
 * Sprint 22.2 — Context Fusion Engine Foundation.
 *
 * Conversation Runtime
 * Coaching Session Runtime
 * Athlete State Engine
 * Workout / Nutrition / Recovery / Goal Agents
 * Coach Supervisor Context
 *   ↓
 * Context Fusion Engine
 *   ↓
 * Unified Coaching Context
 *   ↓
 * Decision Engine
 *
 * Single immutable fused coaching context.
 * Owns aggregation + deterministic conflict resolution only.
 *
 * No AI. No calculations. No persistence. No networking. No UI.
 */

export * from "./models";
export {
  buildUnifiedContext,
  mergeContexts,
  validateUnifiedContext,
  describeContext,
  createContextSnapshot,
} from "./application";
export {
  ContextFusionService,
  createContextFusionService,
} from "./services";

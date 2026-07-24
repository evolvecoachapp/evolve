/**
 * Athlete State Engine
 *
 * Sprint 22.1 — Athlete State Engine Foundation.
 *
 * Workout Agent
 * Nutrition Agent
 * Recovery Agent
 * Goal Agent
 *   ↓
 * Athlete State Engine
 *   ↓
 * Coach Supervisor
 *   ↓
 * Unified Coach Response
 *
 * Single immutable source of truth for athlete state representation.
 * Owns aggregation + deterministic evolution only.
 *
 * No AI. No calculations. No persistence. No networking. No UI.
 */

export * from "./models";
export {
  buildAthleteState,
  updateAthleteState,
  createSnapshot,
  describeAthleteState,
  validateAthleteState,
} from "./application";
export {
  AthleteStateService,
  createAthleteStateService,
} from "./services";

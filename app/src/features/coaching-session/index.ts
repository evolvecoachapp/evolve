/**
 * Coaching Session Runtime
 *
 * Sprint 22.0 — Coaching Session Runtime.
 *
 * User
 *   ↓
 * Conversation Runtime
 *   ↓
 * Coaching Session Runtime
 *   ↓
 * Coach Supervisor
 *   ↓
 * Multi-Agent Platform
 *   ↓
 * Unified Coach Response
 *
 * Owns coaching session lifecycle and immutable session context.
 * Coordinates Coach Supervisor during a session.
 * Does NOT perform business logic, domain logic, or replace Conversation Runtime.
 *
 * No AI. No prompts. No networking. No persistence. No UI.
 */

export * from "./models";
export {
  startSession,
  continueSession,
  endSession,
  describeSession,
  validateSession,
} from "./application";
export {
  CoachingSessionService,
  createCoachingSessionService,
} from "./services";

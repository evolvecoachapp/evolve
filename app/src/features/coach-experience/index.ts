/**
 * Coach Experience
 *
 * Sprint 31.3 — AI Coach Experience (flagship product UI).
 *
 * React UI → CoachExperienceViewModel → Application → Mappers →
 * BackendCoachExperienceService → POST /api/v1/coach/messages (production)
 *
 * Mock / Local CoachExperienceService remain injectable for tests.
 */

export * from "./models";
export * from "./mappers";
export * from "./application";
export * from "./hooks";
export * from "./viewmodels";
export * from "./screens";
export * from "./components";
export {
  coachExperienceService,
  createCoachExperienceService,
  resolveCoachExperienceProviderId,
  mockCoachExperienceService,
  emptyMockCoachExperienceService,
  backendCoachExperienceService,
  localCoachExperienceService,
  CoachExperienceError,
} from "./services";
export type {
  CoachExperienceService,
  CoachExperienceProviderId,
} from "./services";

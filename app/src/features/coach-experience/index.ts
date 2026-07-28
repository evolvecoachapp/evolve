/**
 * Coach Experience
 *
 * Sprint 31.3 — AI Coach Experience (flagship product UI).
 *
 * React UI → CoachExperienceViewModel → Application → Mappers →
 * CoachExperienceService → Mock / Backend / Local
 *
 * Downstream (future provider swap, no UI change):
 * Coach Intelligence → Memory → Context → Mock AI / OpenAI / Azure / Anthropic / Local LLM
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

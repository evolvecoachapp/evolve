/**
 * Athlete Intelligence Workspace composition (Sprint 28.1).
 *
 * Single immutable read model of premium coaching artifacts.
 * Compose only — no new engines, no persistence, no UI, no LLM.
 */

export * from "./models";
export * from "./services";
export {
  composeAthleteWorkspace,
  getAthleteWorkspace,
  getWorkspaceOverview,
  getWorkspaceStatus,
  getWorkspaceTimeline,
  getWorkspaceInsights,
  getWorkspaceCoach,
  validateAthleteWorkspaceForAthlete,
} from "./application";

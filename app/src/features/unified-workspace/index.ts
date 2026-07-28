/**
 * Unified Athlete Workspace composition (Sprint 28.3).
 *
 * Canonical read model aggregating every athlete artifact.
 * Compose only — no new engines, no persistence, no UI, no LLM.
 */

export * from "./models";
export * from "./services";
export {
  composeUnifiedWorkspace,
  getWorkspace,
  getWorkspaceSummary,
  getWorkspaceHealth,
  getWorkspaceInsights,
  getWorkspaceCoach,
  validateUnifiedWorkspaceForAthlete,
} from "./application";

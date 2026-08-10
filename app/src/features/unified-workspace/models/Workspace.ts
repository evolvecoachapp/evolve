import type { WorkspaceCoach } from "./WorkspaceCoach";
import type { WorkspaceGoals } from "./WorkspaceGoals";
import type { WorkspaceHeader } from "./WorkspaceHeader";
import type { WorkspaceHealth } from "./WorkspaceHealth";
import type { WorkspaceInsights } from "./WorkspaceInsights";
import type { WorkspaceMetadata } from "./WorkspaceMetadata";
import type { WorkspaceNutrition } from "./WorkspaceNutrition";
import type { WorkspaceRecovery } from "./WorkspaceRecovery";
import type { WorkspaceSnapshot } from "./WorkspaceSnapshot";
import type { WorkspaceSummary } from "./WorkspaceSummary";
import type { WorkspaceTimeline } from "./WorkspaceTimeline";
import type { WorkspaceWorkout } from "./WorkspaceWorkout";
import type { GoalRuntimePersistenceState } from "../../../runtime/domain-persistence/models/GoalRuntimePersistenceState";

/**
 * Immutable Unified Athlete Workspace (Sprint 28.3).
 *
 * Canonical read model aggregating every athlete artifact.
 * Composition only — no new engines, no persistence, no UI, no LLM.
 */
export interface Workspace {
  readonly id: string;
  readonly athleteId: string;
  readonly header: WorkspaceHeader;
  readonly summary: WorkspaceSummary;
  readonly health: WorkspaceHealth;
  readonly goals: WorkspaceGoals;
  readonly workout: WorkspaceWorkout;
  readonly nutrition: WorkspaceNutrition;
  readonly recovery: WorkspaceRecovery;
  readonly insights: WorkspaceInsights;
  readonly timeline: WorkspaceTimeline;
  readonly coach: WorkspaceCoach;
  readonly snapshot: WorkspaceSnapshot;
  readonly metadata: WorkspaceMetadata;
  readonly goalRuntimeOverlay: GoalRuntimePersistenceState | null;
}

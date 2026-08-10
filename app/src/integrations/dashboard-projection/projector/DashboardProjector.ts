import type { UnifiedWorkspaceService } from "../../../features/unified-workspace/services/UnifiedWorkspaceService";
import { mapWorkspaceToDashboardProjection } from "../mappers";
import {
  createDashboardProjectionResult,
  createDashboardProjectionSnapshot,
  type DashboardProjection,
  type DashboardProjectionIdentity,
  type DashboardProjectionResult,
  type DashboardProjectionSnapshot,
} from "../models";
import { validateDashboardProjectionInput } from "../validation";
import type { Workspace } from "../../../features/unified-workspace/models/Workspace";

export interface DashboardProjectorDeps {
  readonly unifiedWorkspaceService: UnifiedWorkspaceService;
  readonly clock?: () => string;
}

export interface ProjectWorkspaceInput {
  readonly workspace: Workspace;
  readonly identity: DashboardProjectionIdentity;
}

/** Projects immutable Unified Workspace snapshots into the Dashboard read model. */
export class DashboardProjector {
  readonly id = "dashboard-projector";

  private readonly projectedWorkspaceIds = new Set<string>();
  private lastProjection: DashboardProjection | null = null;

  constructor(private readonly deps: DashboardProjectorDeps) {}

  get unifiedWorkspaceService(): UnifiedWorkspaceService {
    return this.deps.unifiedWorkspaceService;
  }

  project(input: ProjectWorkspaceInput): DashboardProjectionResult {
    validateDashboardProjectionInput({
      workspace: input.workspace,
      identity: input.identity,
      projectedWorkspaceIds: [...this.projectedWorkspaceIds],
    });

    const projection = mapWorkspaceToDashboardProjection({
      workspace: input.workspace,
      identity: input.identity,
      projectedAt: this.now(),
    });

    this.projectedWorkspaceIds.add(input.workspace.id);
    this.lastProjection = projection;

    return createDashboardProjectionResult({
      workspaceId: input.workspace.id,
      athleteId: input.workspace.athleteId,
      accepted: true,
      projectedAt: projection.projectedAt,
      projection,
    });
  }

  projectForAthlete(
    athleteId: string,
    identity: DashboardProjectionIdentity,
  ): DashboardProjectionResult | null {
    const workspace = this.deps.unifiedWorkspaceService.getWorkspace(athleteId);
    if (!workspace) {
      return null;
    }

    return this.project({ workspace, identity });
  }

  getProjectedWorkspaceIds(): readonly string[] {
    return Object.freeze([...this.projectedWorkspaceIds]);
  }

  getSnapshot(): DashboardProjectionSnapshot {
    return createDashboardProjectionSnapshot({
      projectedWorkspaceCount: this.projectedWorkspaceIds.size,
      lastWorkspaceId: this.lastProjection?.workspaceId ?? null,
      lastAthleteId: this.lastProjection?.athleteId ?? null,
      lastHeadline: this.lastProjection?.headline ?? null,
      capturedAt: this.lastProjection?.projectedAt ?? this.now(),
    });
  }

  private now(): string {
    return this.deps.clock?.() ?? new Date().toISOString();
  }
}

export function createDashboardProjector(
  deps: DashboardProjectorDeps,
): DashboardProjector {
  return new DashboardProjector(deps);
}

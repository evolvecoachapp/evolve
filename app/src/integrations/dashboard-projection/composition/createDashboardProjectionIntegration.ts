import type { UnifiedWorkspaceService } from "../../../features/unified-workspace/services/UnifiedWorkspaceService";
import {
  createDashboardProjector,
  type DashboardProjector,
} from "../projector";

export interface DashboardProjectionIntegration {
  readonly projector: DashboardProjector;
}

export interface CreateDashboardProjectionIntegrationOptions {
  readonly unifiedWorkspaceService: UnifiedWorkspaceService;
  readonly clock?: () => string;
}

export function createDashboardProjectionIntegration(
  options: CreateDashboardProjectionIntegrationOptions,
): DashboardProjectionIntegration {
  const projector = createDashboardProjector({
    unifiedWorkspaceService: options.unifiedWorkspaceService,
    clock: options.clock,
  });

  return Object.freeze({ projector });
}

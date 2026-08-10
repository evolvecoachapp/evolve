import type { UnifiedWorkspaceService } from "../../../features/unified-workspace/services/UnifiedWorkspaceService";
import { createUnifiedWorkspaceService } from "../../../features/unified-workspace/services/UnifiedWorkspaceService";
import {
  createDashboardProjectionIntegration,
  type DashboardProjectionIntegration,
} from "../../../integrations/dashboard-projection/composition/createDashboardProjectionIntegration";

export interface DashboardProjectionFactoryDeps {
  readonly unifiedWorkspaceService?: UnifiedWorkspaceService;
  readonly clock?: () => string;
}

/**
 * Composition Root factory for Unified Workspace → Dashboard projection wiring.
 */
export const DashboardProjectionFactory = {
  create(
    deps: DashboardProjectionFactoryDeps = {},
  ): DashboardProjectionIntegration {
    const unifiedWorkspaceService =
      deps.unifiedWorkspaceService ?? createUnifiedWorkspaceService({});

    return createDashboardProjectionIntegration({
      unifiedWorkspaceService,
      clock: deps.clock,
    });
  },
} as const;

import { DashboardRestoreService } from "./DashboardRestoreService";

export interface DashboardRestoreFactoryDeps {
  readonly service?: DashboardRestoreService;
}

/**
 * Composition Root factory for the Dashboard Restore service facade.
 */
export const DashboardRestoreFactory = {
  create(deps: DashboardRestoreFactoryDeps = {}): DashboardRestoreService {
    return deps.service ?? new DashboardRestoreService();
  },
} as const;


import type { ProgressAnalyticsService } from "../../../features/progress-analytics/services/ProgressAnalyticsService";
import { createProgressAnalyticsService } from "../../../features/progress-analytics/services/progressAnalyticsFactory";
import {
  createRecoveryProgressIntegration,
  type RecoveryProgressIntegration,
} from "../../../integrations/recovery-progress/composition/createRecoveryProgressIntegration";

export interface RecoveryProgressIntegrationFactoryDeps {
  readonly progressAnalyticsService?: ProgressAnalyticsService;
}

/**
 * Composition Root factory for Recovery → Progress Analytics integration wiring.
 */
export const RecoveryProgressIntegrationFactory = {
  create(
    deps: RecoveryProgressIntegrationFactoryDeps = {},
  ): RecoveryProgressIntegration {
    const progressAnalyticsService =
      deps.progressAnalyticsService ?? createProgressAnalyticsService();
    return createRecoveryProgressIntegration({ progressAnalyticsService });
  },
} as const;

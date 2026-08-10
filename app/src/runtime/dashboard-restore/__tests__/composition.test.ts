import {
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { RuntimeBootstrap, resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { DASHBOARD_RESTORE_STATUS } from "../DashboardRestoreStatus";
import { resetDashboardRestore } from "../DashboardRestorePipeline";

describe("dashboard restore composition", () => {
  afterEach(() => {
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("registers DashboardRestoreService through the composition root factory", () => {
    RuntimeBootstrap.bootstrap();

    const root = getCompositionRoot();
    const service = root.resolve("DashboardRestoreService");

    expect(service.getStatus()).toBe(DASHBOARD_RESTORE_STATUS.idle);
    expect(service.isReady()).toBe(false);
    expect(service.getResult()).toBeNull();
  });
});

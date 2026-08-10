import {
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { RuntimeBootstrap, resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { resetRuntimeWriteThrough } from "../../write-through/RuntimeWriteThroughPipeline";
import { RUNTIME_SESSION_STATUS } from "../RuntimeSessionStatus";
import { resetRuntimeSession } from "../RuntimeSessionOrchestrator";

describe("runtime session composition", () => {
  afterEach(() => {
    resetRuntimeSession();
    resetRuntimeWriteThrough();
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("registers RuntimeSessionService through the composition root factory", () => {
    RuntimeBootstrap.bootstrap();

    const root = getCompositionRoot();
    const service = root.resolve("RuntimeSessionService");

    expect(service.getStatus()).toBe(RUNTIME_SESSION_STATUS.idle);
    expect(service.isReady()).toBe(false);
    expect(service.getResult()).toBeNull();
  });
});

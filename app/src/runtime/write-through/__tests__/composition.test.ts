import {
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { RuntimeBootstrap, resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import { RUNTIME_WRITE_THROUGH_STATUS } from "../RuntimeWriteThroughStatus";
import { resetRuntimeWriteThrough } from "../RuntimeWriteThroughPipeline";

describe("runtime write-through composition", () => {
  afterEach(() => {
    resetRuntimeWriteThrough();
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("registers RuntimeWriteThroughService through the composition root factory", () => {
    RuntimeBootstrap.bootstrap();

    const root = getCompositionRoot();
    const service = root.resolve("RuntimeWriteThroughService");

    expect(service.getStatus()).toBe(RUNTIME_WRITE_THROUGH_STATUS.idle);
    expect(service.isReady()).toBe(false);
    expect(service.getResult()).toBeNull();
  });
});

import {
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { RuntimeBootstrap, resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { resetDashboardRestore } from "../../dashboard-restore/DashboardRestorePipeline";
import { resetRepositoryHydration } from "../../hydration/RepositoryHydrationPipeline";
import { resetRuntimeWriteThrough } from "../../write-through/RuntimeWriteThroughPipeline";
import { RUNTIME_OBSERVER_STATUS } from "../RuntimeObserverStatus";
import { resetRuntimeObserver } from "../RuntimeObserver";

describe("runtime observer composition", () => {
  afterEach(() => {
    resetRuntimeObserver();
    resetRuntimeWriteThrough();
    resetDashboardRestore();
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("registers RuntimeObserverService through the composition root factory", () => {
    RuntimeBootstrap.bootstrap();

    const root = getCompositionRoot();
    const service = root.resolve("RuntimeObserverService");

    expect(service.getStatus()).toBe(RUNTIME_OBSERVER_STATUS.idle);
    expect(service.isReady()).toBe(false);
    expect(service.getResult()).toBeNull();
  });
});

import {
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { RuntimeBootstrap, resetRuntimeBootstrap } from "../RuntimeBootstrap";
import { BOOTSTRAP_STATUS } from "../BootstrapStatus";

describe("runtime bootstrap composition", () => {
  afterEach(() => {
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("registers RuntimeBootstrapService through the composition root factory", () => {
    RuntimeBootstrap.bootstrap();

    const root = getCompositionRoot();
    const service = root.resolve("RuntimeBootstrapService");

    expect(service.isReady()).toBe(true);
    expect(service.getStatus()).toBe(BOOTSTRAP_STATUS.ready);
    expect(service.getResult()?.serviceTokenCount).toBeGreaterThan(0);
  });
});

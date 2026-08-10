import {
  getCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { RuntimeBootstrap, resetRuntimeBootstrap } from "../../bootstrap/RuntimeBootstrap";
import { HYDRATION_STATUS } from "../HydrationStatus";
import { resetRepositoryHydration } from "../RepositoryHydrationPipeline";

describe("repository hydration composition", () => {
  afterEach(() => {
    resetRepositoryHydration();
    resetRuntimeBootstrap();
    resetCompositionRoot();
  });

  it("registers RepositoryHydrationService through the composition root factory", () => {
    RuntimeBootstrap.bootstrap();

    const root = getCompositionRoot();
    const service = root.resolve("RepositoryHydrationService");

    expect(service.getStatus()).toBe(HYDRATION_STATUS.idle);
    expect(service.isReady()).toBe(false);
    expect(service.getResult()).toBeNull();
  });
});

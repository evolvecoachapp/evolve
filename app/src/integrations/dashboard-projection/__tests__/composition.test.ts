import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { DashboardProjectionFactory } from "../../../core/composition/factories/DashboardProjectionFactory";

describe("dashboard-projection composition root", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("registers projector from composition root", () => {
    const root = createCompositionRoot();
    const projector = root.getDashboardProjector();

    expect(projector.id).toBe("dashboard-projector");
    expect(projector.unifiedWorkspaceService).toBeDefined();
  });

  it("factory wires projector to unified workspace service", () => {
    const integration = DashboardProjectionFactory.create();
    expect(integration.projector).toBeDefined();
    expect(integration.projector.id).toBe("dashboard-projector");
  });
});

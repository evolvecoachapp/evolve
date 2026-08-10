import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { AnalyticsTimelineIntegrationFactory } from "../../../core/composition/factories/AnalyticsTimelineIntegrationFactory";

describe("analytics-timeline composition root", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("registers projector from composition root", () => {
    const root = createCompositionRoot();
    const projector = root.getAnalyticsTimelineProjector();

    expect(projector.id).toBe("analytics-timeline-projector");
    expect(projector.progressAnalyticsService).toBeDefined();
    expect(projector.coachTimelineService).toBeDefined();
  });

  it("factory wires projector to progress analytics and coach timeline", () => {
    const integration = AnalyticsTimelineIntegrationFactory.create();
    expect(integration.projector).toBeDefined();
    expect(integration.projector.id).toBe("analytics-timeline-projector");
  });
});

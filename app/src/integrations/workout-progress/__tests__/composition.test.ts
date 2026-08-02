import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { WorkoutProgressIntegrationFactory } from "../../../core/composition/factories/WorkoutProgressIntegrationFactory";

describe("workout-progress composition root", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("registers publisher and subscriber from composition root", () => {
    const root = createCompositionRoot();
    const publisher = root.getWorkoutProgressPublisher();
    const subscriber = root.getProgressAnalyticsSubscriber();

    expect(publisher.id).toBe("workout-progress-publisher");
    expect(subscriber.id).toBe("progress-analytics-subscriber");
  });

  it("factory wires publisher to progress analytics subscriber", () => {
    const integration = WorkoutProgressIntegrationFactory.create();
    expect(integration.publisher).toBeDefined();
    expect(integration.subscriber).toBeDefined();
  });
});

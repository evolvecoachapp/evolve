import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { GoalProgressIntegrationFactory } from "../../../core/composition/factories/GoalProgressIntegrationFactory";

describe("goal-progress composition root", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("registers publisher and subscriber from composition root", () => {
    const root = createCompositionRoot();
    const publisher = root.getGoalProgressPublisher();
    const subscriber = root.getGoalProgressSubscriber();

    expect(publisher.id).toBe("goal-progress-publisher");
    expect(subscriber.id).toBe("goal-progress-subscriber");
  });

  it("factory wires publisher to goal progress subscriber", () => {
    const integration = GoalProgressIntegrationFactory.create();
    expect(integration.publisher).toBeDefined();
    expect(integration.subscriber).toBeDefined();
  });
});

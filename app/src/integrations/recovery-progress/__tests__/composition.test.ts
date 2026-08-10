import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { RecoveryProgressIntegrationFactory } from "../../../core/composition/factories/RecoveryProgressIntegrationFactory";

describe("recovery-progress composition root", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("registers publisher and subscriber from composition root", () => {
    const root = createCompositionRoot();
    const publisher = root.getRecoveryProgressPublisher();
    const subscriber = root.getRecoveryProgressSubscriber();

    expect(publisher.id).toBe("recovery-progress-publisher");
    expect(subscriber.id).toBe("recovery-progress-subscriber");
  });

  it("factory wires publisher to recovery progress subscriber", () => {
    const integration = RecoveryProgressIntegrationFactory.create();
    expect(integration.publisher).toBeDefined();
    expect(integration.subscriber).toBeDefined();
  });
});

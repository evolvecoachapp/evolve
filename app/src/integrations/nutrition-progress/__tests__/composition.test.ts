import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { NutritionProgressIntegrationFactory } from "../../../core/composition/factories/NutritionProgressIntegrationFactory";

describe("nutrition-progress composition root", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("registers publisher and subscriber from composition root", () => {
    const root = createCompositionRoot();
    const publisher = root.getNutritionProgressPublisher();
    const subscriber = root.getNutritionProgressSubscriber();

    expect(publisher.id).toBe("nutrition-progress-publisher");
    expect(subscriber.id).toBe("nutrition-progress-subscriber");
  });

  it("factory wires publisher to nutrition progress subscriber", () => {
    const integration = NutritionProgressIntegrationFactory.create();
    expect(integration.publisher).toBeDefined();
    expect(integration.subscriber).toBeDefined();
  });
});

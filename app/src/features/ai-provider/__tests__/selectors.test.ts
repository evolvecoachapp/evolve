import { ProviderConfigurationBuilder } from "../builders";
import {
  createCapabilitySelector,
  createModelSelector,
  createPricingSelector,
  createProviderSelector,
} from "../selectors";
import {
  createModelRegistry,
  createProviderRegistry,
} from "../registry";
import {
  createCapabilities,
  createModelInfoFixture,
  createStubProvider,
} from "../testSupport/fixtures";

describe("ai-provider selectors and configuration builder", () => {
  it("ProviderConfigurationBuilder freezes configuration", () => {
    const configuration = new ProviderConfigurationBuilder()
      .withProviderId("cfg")
      .withDisplayName("Config Provider")
      .withDefaultModelId("m1")
      .withPreferredModelIds(["m1", "m2"])
      .build();

    expect(Object.isFrozen(configuration)).toBe(true);
    expect(configuration.preferredModelIds).toEqual(["m1", "m2"]);
  });

  it("selectors resolve providers, capabilities, models, and pricing", () => {
    const providerRegistry = createProviderRegistry();
    const provider = createStubProvider({
      id: "select",
      capabilities: createCapabilities({ vision: true, streaming: true }),
    });
    providerRegistry.register(provider, {
      pricing: Object.freeze({
        currency: "USD",
        inputCostPer1KTokens: 0.01,
        outputCostPer1KTokens: 0.02,
        flatRequestCost: null,
        notes: null,
      }),
      isDefault: true,
    });

    const registry = providerRegistry.getProviderRegistry();
    const providerSelector = createProviderSelector(registry, providerRegistry);
    const capabilitySelector = createCapabilitySelector(
      registry,
      providerRegistry.getCapabilityRegistry(),
    );
    const modelSelector = createModelSelector(
      providerRegistry.getModelRegistry(),
    );
    const pricingSelector = createPricingSelector(providerRegistry);

    expect(providerSelector.available().map((p) => p.id)).toEqual(["select"]);
    expect(providerSelector.defaultDescriptor()?.id).toBe("select");
    expect(
      capabilitySelector.providersSupporting("vision").map((p) => p.id),
    ).toEqual(["select"]);
    expect(modelSelector.byProvider("select")[0]?.id).toBe("test-model");
    expect(pricingSelector.forProvider("select").inputCostPer1KTokens).toBe(
      0.01,
    );
    expect(pricingSelector.withKnownPricing()).toHaveLength(1);
  });

  it("ModelRegistry registers and resolves catalog metadata", () => {
    const models = createModelRegistry();
    const model = createModelInfoFixture({ id: "catalog-model" });
    models.register(model);
    expect(models.resolve("test-provider", "catalog-model")?.id).toBe(
      "catalog-model",
    );
    expect(models.resolveByModelId("catalog-model")).toHaveLength(1);
  });
});

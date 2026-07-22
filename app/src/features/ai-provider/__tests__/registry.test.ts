import { AIProviderError } from "../models/AIProviderError";
import { AIProviderStatuses } from "../models/AIProviderStatus";
import { createAIProviderRegistry } from "../registry";
import {
  createCapabilities,
  createStubProvider,
} from "../testSupport/fixtures";

describe("ai-provider registry", () => {
  it("registers, resolves, lists, and unregisters providers", () => {
    const registry = createAIProviderRegistry();
    const provider = createStubProvider({ id: "alpha" });

    registry.register(provider);

    expect(registry.has("alpha")).toBe(true);
    expect(registry.resolve("ALPHA")?.id).toBe("alpha");
    expect(registry.list().map((item) => item.id)).toEqual(["alpha"]);
    expect(registry.isAvailable("alpha")).toBe(true);

    expect(registry.unregister("alpha")).toBe(true);
    expect(registry.has("alpha")).toBe(false);
  });

  it("rejects duplicate registration and invalid ids", () => {
    const registry = createAIProviderRegistry();
    registry.register(createStubProvider({ id: "dup" }));

    expect(() => registry.register(createStubProvider({ id: "dup" }))).toThrow(
      AIProviderError,
    );
    expect(() =>
      registry.register(createStubProvider({ id: "BAD ID" })),
    ).toThrow(AIProviderError);
  });

  it("validates availability for disabled and non-chat providers", () => {
    const registry = createAIProviderRegistry();
    registry.register(
      createStubProvider({
        id: "disabled",
        status: AIProviderStatuses.DISABLED,
      }),
    );
    registry.register(
      createStubProvider({
        id: "no-chat",
        capabilities: createCapabilities({ chat: false }),
      }),
    );

    expect(registry.validateAvailability("missing")).toContain(
      "provider_not_registered:missing",
    );
    expect(registry.validateAvailability("disabled")).toContain(
      "provider_disabled:disabled",
    );
    expect(registry.validateAvailability("no-chat")).toContain(
      "provider_chat_unsupported:no-chat",
    );
  });

  it("clears all registrations", () => {
    const registry = createAIProviderRegistry();
    registry.register(createStubProvider({ id: "one" }));
    registry.clear();
    expect(registry.list()).toHaveLength(0);
  });
});

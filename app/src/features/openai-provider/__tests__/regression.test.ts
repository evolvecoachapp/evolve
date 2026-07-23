import { AIProviderIds } from "../../ai-provider/models/AIProviderId";
import { PromptPackageMapper } from "../mappers/PromptPackageMapper";
import { createOpenAIProvider } from "../provider";
import {
  createMockTransport,
  createOpenAIResponseFixture,
  createPromptPackageFixture,
  createProviderConfiguration,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("openai-provider regression", () => {
  it("keeps mappings immutable across execute", async () => {
    const promptPackage = createPromptPackageFixture({
      id: "prompt-package:regression",
    });
    const mapped = PromptPackageMapper.map(promptPackage, {
      configuration: createProviderConfiguration(),
    });

    expect(Object.isFrozen(mapped)).toBe(true);
    expect(Object.isFrozen(mapped.messages)).toBe(true);

    const provider = createOpenAIProvider({
      configuration: createProviderConfiguration(),
      client: createMockTransport(
        createOpenAIResponseFixture({ content: "stable" }),
      ),
    });

    const first = await provider.execute({
      promptPackage,
      requestId: "reg-1",
      executedAt: FIXED_TIMESTAMP,
    });
    const second = await provider.execute({
      promptPackage,
      requestId: "reg-2",
      executedAt: FIXED_TIMESTAMP,
    });

    expect(first.providerId).toBe(AIProviderIds.OPENAI);
    expect(second.content).toBe("stable");
    expect(first.content).toBe(second.content);
    expect(provider.getCapabilities().streaming).toBe(false);
    expect(provider.getCapabilities().tools).toBe(false);
  });

  it("does not mutate PromptPackage blocks", async () => {
    const promptPackage = createPromptPackageFixture();
    const before = promptPackage.blocks.map((block) => block.statement);
    const provider = createOpenAIProvider({
      configuration: createProviderConfiguration(),
      client: createMockTransport(),
    });

    await provider.execute({ promptPackage });
    const after = promptPackage.blocks.map((block) => block.statement);
    expect(after).toEqual(before);
  });
});

import { act, renderHook, waitFor } from "@testing-library/react-native";
import { AIConfigurationFactory } from "../../factory";
import type { AIConfigurationLoadResult } from "../../repository";
import type { AIConfigurationRepository } from "../../repository";
import { useAIConfiguration } from "../useAIConfiguration";

function createRepository(
  result: AIConfigurationLoadResult = {
    configuration: AIConfigurationFactory.createDefault(),
    validation: Object.freeze({
      valid: true,
      issues: Object.freeze([]),
    }),
  },
): AIConfigurationRepository {
  return {
    getConfiguration: jest.fn(async () => result),
  };
}

describe("useAIConfiguration", () => {
  it("loads configuration and validation through the injected repository", async () => {
    const repository = createRepository();
    const { result } = renderHook(() => useAIConfiguration({ repository }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.configuration?.provider.type).toBe("local");
    expect(result.current.validation?.valid).toBe(true);
    expect(repository.getConfiguration).toHaveBeenCalled();
  });

  it("surfaces repository failures", async () => {
    const repository = createRepository();
    (repository.getConfiguration as jest.Mock).mockRejectedValue(
      new Error("config load failed"),
    );

    const { result } = renderHook(() => useAIConfiguration({ repository }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.configuration).toBeNull();
    expect(result.current.validation).toBeNull();
    expect(result.current.error).toBe("config load failed");
  });

  it("ignores late results after unmount", async () => {
    let resolveResult: (value: AIConfigurationLoadResult) => void = () =>
      undefined;
    const repository = createRepository();
    (repository.getConfiguration as jest.Mock).mockImplementation(
      () =>
        new Promise<AIConfigurationLoadResult>((resolve) => {
          resolveResult = resolve;
        }),
    );

    const { result, unmount } = renderHook(() =>
      useAIConfiguration({ repository }),
    );
    unmount();

    await act(async () => {
      resolveResult({
        configuration: AIConfigurationFactory.createDefault(),
        validation: Object.freeze({
          valid: true,
          issues: Object.freeze([]),
        }),
      });
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.configuration).toBeNull();
  });
});

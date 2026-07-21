import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { PromptContext } from "../../models/PromptContext";
import type { PromptBuilderRepository } from "../../repository";
import { createSnapshot } from "../../testSupport/fixtures";
import { buildPromptContext } from "../../utils/buildPromptContext";
import { useCoachPrompt } from "../useCoachPrompt";

function createPromptContext(): PromptContext {
  return buildPromptContext(createSnapshot(), {
    generatedAt: "2026-07-21T15:00:00.000Z",
  });
}

function createRepository(
  promptContext: PromptContext = createPromptContext(),
): PromptBuilderRepository {
  return {
    getPromptContext: jest.fn(async () => promptContext),
  };
}

describe("useCoachPrompt", () => {
  it("loads structured prompt context through the injected repository", async () => {
    const repository = createRepository();
    const { result } = renderHook(() => useCoachPrompt({ repository }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.promptContext?.athlete.consistencyScore).toBe(0.82);
    expect(result.current.promptContext?.coach.recommendations).toHaveLength(
      1,
    );
    expect(repository.getPromptContext).toHaveBeenCalled();
  });

  it("surfaces repository failures", async () => {
    const repository = createRepository();
    (repository.getPromptContext as jest.Mock).mockRejectedValue(
      new Error("prompt builder failed"),
    );

    const { result } = renderHook(() => useCoachPrompt({ repository }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.promptContext).toBeNull();
    expect(result.current.error).toBe("prompt builder failed");
  });

  it("ignores late results after unmount", async () => {
    let resolveContext: (value: PromptContext) => void = () => undefined;
    const repository = createRepository();
    (repository.getPromptContext as jest.Mock).mockImplementation(
      () =>
        new Promise<PromptContext>((resolve) => {
          resolveContext = resolve;
        }),
    );

    const { result, unmount } = renderHook(() =>
      useCoachPrompt({ repository }),
    );
    unmount();

    await act(async () => {
      resolveContext(createPromptContext());
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.promptContext).toBeNull();
  });
});

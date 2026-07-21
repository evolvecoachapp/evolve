import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { AthleteContextSnapshot } from "../../models/AthleteContextSnapshot";
import type { AthleteProfile } from "../../models/AthleteProfile";
import type { AthleteContextRepository } from "../../repository";
import { createAthleteProfile } from "../../testSupport/fixtures";
import { useAthleteContext } from "../useAthleteContext";

function createRepository(
  profile: AthleteProfile = createAthleteProfile(),
): AthleteContextRepository {
  let current = profile;

  return {
    getProfile: jest.fn(async () => current),
    getSnapshot: jest.fn(async (referenceDate?: Date) => {
      const capturedAt = (referenceDate ?? new Date()).toISOString();
      const snapshot: AthleteContextSnapshot = Object.freeze({
        profile: current,
        trainingAgeYears: current.experience.yearsTraining,
        validation: Object.freeze({
          valid: true,
          issues: Object.freeze([]),
        }),
        capturedAt,
      });
      return snapshot;
    }),
    updateProfile: jest.fn(async (next: AthleteProfile) => {
      current = next;
      return current;
    }),
    validateProfile: jest.fn(() =>
      Object.freeze({
        valid: true,
        issues: Object.freeze([]),
      }),
    ),
  };
}

describe("useAthleteContext", () => {
  it("loads profile through the injected repository", async () => {
    const repository = createRepository();
    const { result } = renderHook(() => useAthleteContext({ repository }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.profile?.id).toBe("athlete-1");
    expect(repository.getSnapshot).toHaveBeenCalled();
  });

  it("updates profile through updateProfile", async () => {
    const repository = createRepository();
    const { result } = renderHook(() => useAthleteContext({ repository }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const next = createAthleteProfile({ displayName: "Hook Updated" });

    await act(async () => {
      await result.current.updateProfile(next);
    });

    expect(repository.updateProfile).toHaveBeenCalledWith(next);
    expect(result.current.profile?.displayName).toBe("Hook Updated");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("surfaces repository failures", async () => {
    const repository = createRepository();
    (repository.getSnapshot as jest.Mock).mockRejectedValue(
      new Error("athlete load failed"),
    );

    const { result } = renderHook(() => useAthleteContext({ repository }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBe("athlete load failed");
  });

  it("ignores late results after unmount", async () => {
    let resolveSnapshot: (value: AthleteContextSnapshot) => void = () =>
      undefined;
    const repository = createRepository();
    (repository.getSnapshot as jest.Mock).mockImplementation(
      () =>
        new Promise<AthleteContextSnapshot>((resolve) => {
          resolveSnapshot = resolve;
        }),
    );

    const { result, unmount } = renderHook(() =>
      useAthleteContext({ repository }),
    );
    unmount();

    await act(async () => {
      resolveSnapshot(
        Object.freeze({
          profile: createAthleteProfile(),
          trainingAgeYears: 4,
          validation: Object.freeze({
            valid: true,
            issues: Object.freeze([]),
          }),
          capturedAt: "2026-07-22T00:00:00.000Z",
        }),
      );
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.profile).toBeNull();
  });
});

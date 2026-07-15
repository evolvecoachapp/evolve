/**
 * Regression coverage for Sprint 6.1.3 — edit-mode dirty state must compare
 * against the baseline snapshot captured at enterEditMode, NOT the live
 * profile prop (which can be null during backend load on a real device).
 */
import { act, renderHook } from "@testing-library/react-native";
import { useProfileEdit } from "../useProfileEdit";

describe("useProfileEdit baseline dirty-state (Sprint 6.1.3)", () => {
  const updateProfile = jest.fn().mockResolvedValue(undefined);
  const refresh = jest.fn().mockResolvedValue(undefined);

  it("enables canSave when profile is null but the user edits fields", () => {
    const { result } = renderHook(() =>
      useProfileEdit({
        profile: null,
        displayName: "antonello",
        username: "antonello",
        updateProfile,
        refresh,
      }),
    );

    act(() => result.current.enterEditMode());
    act(() => result.current.updateField("heightCm", "180"));
    act(() => result.current.updateField("goal", "lose_weight"));

    expect(result.current.form.firstName).toBe("antonello");
    expect(result.current.canSave).toBe(true);
  });

  it("enables canSave for legacy accounts editing non-firstName fields", () => {
    const legacyProfile = {
      userId: "a66e02d5-ddd0-4dfd-a1e6-a440497420d3",
      firstName: null,
      lastName: null,
      displayName: "antonello",
      avatarUrl: null,
      birthDate: null,
      gender: null,
      heightCm: null,
      currentWeightKg: null,
      targetWeightKg: null,
      activityLevel: null,
      goal: null,
      updatedAt: "2026-07-14T14:00:22.837915Z",
    };

    const { result } = renderHook(() =>
      useProfileEdit({
        profile: legacyProfile,
        displayName: "antonello",
        username: "antonello",
        updateProfile,
        refresh,
      }),
    );

    act(() => result.current.enterEditMode());

    expect(result.current.form.firstName).toBe("antonello");
    expect(result.current.canSave).toBe(false);

    act(() => result.current.updateField("weightKg", "95"));

    expect(result.current.canSave).toBe(true);
  });

  it("keeps canSave false when nothing changed from baseline", () => {
    const profile = {
      userId: "user-1",
      firstName: "Antonello",
      lastName: "Gallipoli",
      displayName: "Antonello Gallipoli",
      avatarUrl: null,
      birthDate: "1990-07-15",
      gender: "male" as const,
      heightCm: 178,
      currentWeightKg: 78,
      targetWeightKg: null,
      activityLevel: "moderately_active" as const,
      goal: "gain_muscle" as const,
      updatedAt: "2026-07-01T00:00:00.000Z",
    };

    const { result } = renderHook(() =>
      useProfileEdit({
        profile,
        displayName: "Antonello Gallipoli",
        username: "antonello",
        updateProfile,
        refresh,
      }),
    );

    act(() => result.current.enterEditMode());

    expect(result.current.canSave).toBe(false);
  });

  it("restores baseline values on cancel", () => {
    const profile = {
      userId: "user-1",
      firstName: "Antonello",
      lastName: "Gallipoli",
      displayName: "Antonello Gallipoli",
      avatarUrl: null,
      birthDate: "1990-07-15",
      gender: "male" as const,
      heightCm: 178,
      currentWeightKg: 78,
      targetWeightKg: null,
      activityLevel: "moderately_active" as const,
      goal: "gain_muscle" as const,
      updatedAt: "2026-07-01T00:00:00.000Z",
    };

    const { result } = renderHook(() =>
      useProfileEdit({
        profile,
        displayName: "Antonello Gallipoli",
        username: "antonello",
        updateProfile,
        refresh,
      }),
    );

    act(() => result.current.enterEditMode());
    act(() => result.current.updateField("firstName", "Changed"));
    act(() => result.current.cancelEdit());

    expect(result.current.form.firstName).toBe("Antonello");
    expect(result.current.isEditing).toBe(false);
  });
});

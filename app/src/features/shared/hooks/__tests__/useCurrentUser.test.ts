import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useCurrentUser } from "../useCurrentUser";
import type { CurrentUserService } from "../../services";
import type { UserUpdate } from "../../../../types/api";
import { mockCurrentUserData } from "../../mocks/currentUserData";

function createTestService(): CurrentUserService {
  let profile = { ...mockCurrentUserData.profile };
  let user = { ...mockCurrentUserData.user };

  return {
    providerId: "mock",
    async refresh() {
      profile = { ...mockCurrentUserData.profile };
      user = { ...mockCurrentUserData.user };
    },
    getUser: () => ({ ...user }),
    getProfile: () => ({ ...profile }),
    getPreferences: () => structuredClone(mockCurrentUserData.preferences),
    getSubscription: () => ({ ...mockCurrentUserData.subscription }),
    isAuthenticated: () => true,
    async updateProfile(data: UserUpdate) {
      profile = {
        ...profile,
        firstName: data.first_name ?? profile.firstName,
        lastName: data.last_name ?? profile.lastName,
        updatedAt: new Date().toISOString(),
      };
      profile.displayName = `${profile.firstName ?? ""}${profile.lastName ? ` ${profile.lastName}` : ""}`;
    },
  };
}

describe("useCurrentUser", () => {
  it("exposes updateProfile and syncs state after save", async () => {
    const service = createTestService();
    const { result } = renderHook(() => useCurrentUser({ service }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateProfile({ first_name: "Jordan", last_name: "Lee" });
    });

    expect(result.current.profile?.firstName).toBe("Jordan");
    expect(result.current.profile?.lastName).toBe("Lee");
    expect(result.current.saving).toBe(false);
  });
});

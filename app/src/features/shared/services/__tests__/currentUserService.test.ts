import {
  backendUserService,
  createCurrentUserService,
  mockCurrentUserService,
} from "..";
import { CurrentUserServiceError } from "../CurrentUserService";
import { mapUserPublicToProfile, mapUserPublicToUser } from "../../utils/userAdapters";

jest.mock("../../../../api/auth", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("../../../../api/users", () => ({
  updateCurrentUser: jest.fn(),
}));

const mockedGetCurrentUser = jest.requireMock("../../../../api/auth")
  .getCurrentUser as jest.MockedFunction<typeof import("../../../../api/auth").getCurrentUser>;

const mockedUpdateCurrentUser = jest.requireMock("../../../../api/users")
  .updateCurrentUser as jest.MockedFunction<typeof import("../../../../api/users").updateCurrentUser>;

describe("currentUserService architecture", () => {
  it("defaults to the backend provider", () => {
    const service = createCurrentUserService("backend");
    expect(service.providerId).toBe("backend");
  });

  it("returns the seeded mock user snapshot", async () => {
    await mockCurrentUserService.refresh();

    expect(mockCurrentUserService.getUser()?.email).toBe("coach@evolve.app");
    expect(mockCurrentUserService.getProfile()?.displayName).toBe("Alex Rivera");
    expect(mockCurrentUserService.getSubscription()?.tier).toBe("free");
    expect(mockCurrentUserService.isAuthenticated()).toBe(true);
  });

  it("maps API transport shapes into domain models", () => {
    const dto = {
      id: "user-2",
      email: "jordan@evolve.app",
      username: "jordan",
      first_name: "Jordan",
      last_name: "Lee",
      birth_date: "1994-02-10",
      gender: "female" as const,
      height_cm: 170,
      current_weight_kg: 62,
      target_weight_kg: 60,
      activity_level: "lightly_active" as const,
      goal: "lose_weight" as const,
      is_active: true,
      is_verified: false,
      created_at: "2026-01-15T00:00:00.000Z",
      updated_at: "2026-07-10T00:00:00.000Z",
    };

    const user = mapUserPublicToUser(dto);
    const profile = mapUserPublicToProfile(dto);

    expect(user.email).toBe("jordan@evolve.app");
    expect(profile.displayName).toBe("Jordan Lee");
    expect(profile.goal).toBe("lose_weight");
  });

  it("throws when the backend provider cannot load the current user", async () => {
    mockedGetCurrentUser.mockRejectedValueOnce(new Error("network down"));

    await expect(backendUserService.refresh()).rejects.toBeInstanceOf(CurrentUserServiceError);
  });

  it("updates the backend profile through PATCH /api/v1/users/me", async () => {
    const dto = {
      id: "user-2",
      email: "jordan@evolve.app",
      username: "jordan",
      first_name: "Jordan",
      last_name: "Lee",
      birth_date: "1994-02-10",
      gender: "female" as const,
      height_cm: 170,
      current_weight_kg: 62,
      target_weight_kg: 60,
      activity_level: "lightly_active" as const,
      goal: "lose_weight" as const,
      is_active: true,
      is_verified: false,
      created_at: "2026-01-15T00:00:00.000Z",
      updated_at: "2026-07-10T00:00:00.000Z",
    };

    mockedUpdateCurrentUser.mockResolvedValueOnce(dto);

    await backendUserService.updateProfile({ first_name: "Jordan", last_name: "Lee" });

    expect(mockedUpdateCurrentUser).toHaveBeenCalledWith({
      first_name: "Jordan",
      last_name: "Lee",
    });
    expect(backendUserService.getProfile()?.displayName).toBe("Jordan Lee");
  });
});

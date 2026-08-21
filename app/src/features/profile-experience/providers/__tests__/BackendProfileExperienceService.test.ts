import { ApiError } from "../../../../api/client";
import { ProfileExperienceError } from "../../services";

jest.mock("../../../../api/auth", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("../../../../api/users", () => ({
  updateCurrentUser: jest.fn(),
}));

// Imported after the mocks are registered so the provider module picks up the mocked functions.
import { backendProfileExperienceService } from "../BackendProfileExperienceService";

const mockedGetCurrentUser = jest.requireMock("../../../../api/auth")
  .getCurrentUser as jest.MockedFunction<typeof import("../../../../api/auth").getCurrentUser>;
const mockedUpdateCurrentUser = jest.requireMock("../../../../api/users")
  .updateCurrentUser as jest.MockedFunction<typeof import("../../../../api/users").updateCurrentUser>;

function buildUserPublic(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
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
    is_verified: true,
    created_at: "2026-01-15T00:00:00.000Z",
    updated_at: "2026-07-10T00:00:00.000Z",
    ...overrides,
  };
}

describe("backendProfileExperienceService", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("has the backend provider id", () => {
    expect(backendProfileExperienceService.providerId).toBe("backend");
  });

  describe("getProfile", () => {
    it("maps a backend UserPublic response into the Profile Experience DTO via the authenticated API client", async () => {
      mockedGetCurrentUser.mockResolvedValueOnce(buildUserPublic());

      const dto = await backendProfileExperienceService.getProfile();

      expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1);
      expect(dto.id).toBe("user-1");
      expect(dto.displayName).toBe("Jordan Lee");
      expect(dto.email).toBe("jordan@evolve.app");
    expect(dto.heightCm).toBe(170);
    expect(dto.weightKg).toBe(62);
    expect(dto.age).toBeGreaterThan(0);
    expect(dto.firstName).toBe("Jordan");
      expect(dto.primaryGoal).toBe("lose_weight");
      expect(dto.activityLevel).toBe("lightly_active");
      expect(dto.targetWeightKg).toBe(60);
      expect(dto.goals).toEqual([]);
    });

    it("coerces Decimal-as-string height/weight from the backend into numbers", async () => {
      mockedGetCurrentUser.mockResolvedValueOnce(
        buildUserPublic({ height_cm: "170.00", current_weight_kg: "62.50" }),
      );

      const dto = await backendProfileExperienceService.getProfile();

      expect(dto.heightCm).toBe(170);
      expect(dto.weightKg).toBe(62.5);
    });

    it("leaves unsupported domains as explicit, empty/not-invented defaults rather than fabricating backend data", async () => {
      mockedGetCurrentUser.mockResolvedValueOnce(buildUserPublic());

      const dto = await backendProfileExperienceService.getProfile();

      expect(dto.goals).toHaveLength(0);
      expect(dto.trainingPreferences.sessionsPerWeek).toBe(0);
      expect(dto.nutritionPreferences.calorieTarget).toBe(0);
      expect(dto.connectedServices.every((service) => !service.isConnected)).toBe(true);
    });

    it("wraps a network/API failure as a ProfileExperienceError, never the raw exception", async () => {
      mockedGetCurrentUser.mockRejectedValueOnce(new ApiError(500, null, "Internal Server Error"));

      const failure = backendProfileExperienceService.getProfile();

      await expect(failure).rejects.toBeInstanceOf(ProfileExperienceError);
      await expect(failure).rejects.toThrow("Internal Server Error");
      await expect(failure).rejects.not.toBeInstanceOf(ApiError);
    });
  });

  describe("updateAthleteInfo", () => {
    it("PATCHes only the backend-supported fields through the authenticated API client", async () => {
      mockedUpdateCurrentUser.mockResolvedValueOnce(
        buildUserPublic({ height_cm: 182, current_weight_kg: 79 }),
      );

      const dto = await backendProfileExperienceService.updateAthleteInfo({
        heightCm: 182,
        weightKg: 79,
      });

      expect(mockedUpdateCurrentUser).toHaveBeenCalledWith({
        height_cm: 182,
        current_weight_kg: 79,
      });
      expect(dto.heightCm).toBe(182);
      expect(dto.weightKg).toBe(79);
    });

    it("omits fields the caller did not provide from the PATCH payload", async () => {
      mockedUpdateCurrentUser.mockResolvedValueOnce(buildUserPublic({ height_cm: 182 }));

      await backendProfileExperienceService.updateAthleteInfo({ heightCm: 182 });

      expect(mockedUpdateCurrentUser).toHaveBeenCalledWith({ height_cm: 182 });
    });

    it("surfaces a backend validation error (e.g. 409 conflict) as a ProfileExperienceError", async () => {
      mockedUpdateCurrentUser.mockRejectedValueOnce(
        new ApiError(409, { detail: "A user with this email or username already exists." }, "A user with this email or username already exists."),
      );

      const failure = backendProfileExperienceService.updateAthleteInfo({ heightCm: 182 });

      await expect(failure).rejects.toBeInstanceOf(ProfileExperienceError);
      await expect(failure).rejects.toThrow("A user with this email or username already exists.");
      await expect(failure).rejects.not.toBeInstanceOf(ApiError);
    });

    it("does not report success when the backend update fails", async () => {
      mockedUpdateCurrentUser.mockRejectedValueOnce(new ApiError(422, null, "Validation failed."));

      await expect(
        backendProfileExperienceService.updateAthleteInfo({ heightCm: -5 }),
      ).rejects.toThrow("Validation failed.");
    });
  });

  describe("unsupported Profile domains", () => {
    it.each([
      ["updateTrainingPreferences", () => backendProfileExperienceService.updateTrainingPreferences({} as never)],
      ["updateNutritionPreferences", () => backendProfileExperienceService.updateNutritionPreferences({} as never)],
      ["updateCoachPreferences", () => backendProfileExperienceService.updateCoachPreferences({} as never)],
      ["updateNotificationPreferences", () => backendProfileExperienceService.updateNotificationPreferences({} as never)],
      ["updateAppearancePreferences", () => backendProfileExperienceService.updateAppearancePreferences({} as never)],
      ["updateMeasurementUnits", () => backendProfileExperienceService.updateMeasurementUnits({} as never)],
      ["updateGoals", () => backendProfileExperienceService.updateGoals([])],
    ])("%s stays explicitly unsupported by the backend", async (_name, call) => {
      await expect(call()).rejects.toBeInstanceOf(ProfileExperienceError);
      await expect(call()).rejects.toThrow(/not supported by the backend/i);
      expect(mockedUpdateCurrentUser).not.toHaveBeenCalled();
    });
  });
});

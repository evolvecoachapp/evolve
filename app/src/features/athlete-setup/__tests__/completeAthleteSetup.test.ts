import type { UserPublic } from "../../../types/api";
import { completeAthleteSetup, AthleteSetupError } from "../completeAthleteSetup";
import type { AthleteSetupValues } from "../models";

jest.mock("../../../api/users", () => ({
  updateCurrentUser: jest.fn(),
}));

const mockedUpdateCurrentUser = jest.requireMock("../../../api/users")
  .updateCurrentUser as jest.MockedFunction<typeof import("../../../api/users").updateCurrentUser>;

const savedUser: UserPublic = {
  id: "user-1",
  email: "jordan@evolve.app",
  username: "jordan",
  first_name: "Jordan",
  last_name: null,
  birth_date: "1994-02-10",
  gender: "female",
  height_cm: 170,
  current_weight_kg: 62,
  target_weight_kg: 58,
  activity_level: "moderately_active",
  goal: "lose_weight",
  is_active: true,
  is_verified: true,
  created_at: "2026-01-15T00:00:00.000Z",
  updated_at: "2026-08-21T00:00:00.000Z",
};

const validSetup: AthleteSetupValues = {
  firstName: "Jordan",
  birthDate: "1994-02-10",
  gender: "female",
  heightCm: "170",
  weightKg: "62",
  goal: "lose_weight",
  activityLevel: "moderately_active",
  targetWeightKg: "58",
};

describe("completeAthleteSetup", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("PATCHes /users/me with the mapped athlete setup fields", async () => {
    mockedUpdateCurrentUser.mockResolvedValueOnce(savedUser);

    const result = await completeAthleteSetup(validSetup);

    expect(mockedUpdateCurrentUser).toHaveBeenCalledWith({
      first_name: "Jordan",
      birth_date: "1994-02-10",
      gender: "female",
      height_cm: 170,
      current_weight_kg: 62,
      goal: "lose_weight",
      activity_level: "moderately_active",
      target_weight_kg: 58,
    });
    expect(result.goal).toBe("lose_weight");
    expect(result.first_name).toBe("Jordan");
  });

  it("does not PATCH when the setup is invalid", async () => {
    await expect(
      completeAthleteSetup({ ...validSetup, heightCm: "-4" }),
    ).rejects.toBeInstanceOf(AthleteSetupError);
    expect(mockedUpdateCurrentUser).not.toHaveBeenCalled();
  });
});

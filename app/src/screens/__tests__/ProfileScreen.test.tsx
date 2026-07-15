import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ProfileScreen } from "../ProfileScreen";
import { useAuth } from "../../auth/useAuth";
import { useCurrentUser } from "../../features/shared";
import { ThemeProvider } from "../../theme/ThemeContext";

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: "LinearGradient",
}));
jest.mock("../../auth/useAuth");
jest.mock("../../features/shared", () => ({
  ...jest.requireActual("../../features/shared"),
  useCurrentUser: jest.fn(),
}));
jest.mock("../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));
jest.mock("@react-native-community/datetimepicker", () => "DateTimePicker");

const mockedUseAuth = useAuth as jest.Mock;
const mockedUseCurrentUser = useCurrentUser as jest.Mock;
const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});

const profile = {
  userId: "user-1",
  firstName: "Alex",
  lastName: "Rivera",
  displayName: "Alex Rivera",
  avatarUrl: null,
  birthDate: "1995-06-15",
  gender: "prefer_not_to_say" as const,
  heightCm: 178,
  currentWeightKg: 78,
  targetWeightKg: 75,
  activityLevel: "moderately_active" as const,
  goal: "gain_muscle" as const,
  updatedAt: "2026-07-01T00:00:00.000Z",
};

const user = {
  id: "user-1",
  email: "coach@evolve.app",
  username: "evolve_user",
  isActive: true,
  isVerified: true,
  createdAt: "2026-03-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

const safeAreaMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderProfileScreen() {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>
        <ProfileScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("ProfileScreen", () => {
  const updateProfile = jest.fn().mockResolvedValue(undefined);
  const refresh = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.resetAllMocks();
    alertSpy.mockClear();
    mockedUseAuth.mockReturnValue({ logout: jest.fn() });
    mockedUseCurrentUser.mockReturnValue({
      profile,
      user,
      displayName: "Alex Rivera",
      email: "coach@evolve.app",
      memberSince: "March 2026",
      subscriptionTier: "Free",
      loading: false,
      saving: false,
      error: null,
      updateProfile,
      refresh,
    });
  });

  it("starts in read mode with profile details visible without editing", () => {
    const { getByText, queryByText } = renderProfileScreen();

    expect(getByText("Edit Profile")).toBeTruthy();
    expect(getByText("Alex Rivera")).toBeTruthy();
    expect(getByText("coach@evolve.app")).toBeTruthy();
    expect(getByText("Member since March 2026")).toBeTruthy();
    expect(getByText("Personal Information")).toBeTruthy();
    expect(getByText("First name")).toBeTruthy();
    expect(getByText("Last name")).toBeTruthy();
    expect(getByText("Date of birth")).toBeTruthy();
    expect(getByText("Gender")).toBeTruthy();
    expect(getByText("Height")).toBeTruthy();
    expect(getByText("Weight")).toBeTruthy();
    expect(getByText("Primary goal")).toBeTruthy();
    expect(getByText("June 15, 1995")).toBeTruthy();
    expect(getByText("178 cm")).toBeTruthy();
    expect(getByText("78 kg")).toBeTruthy();
    expect(getByText("Gain muscle")).toBeTruthy();
    expect(queryByText("Save")).toBeNull();
    expect(queryByText("Change photo")).toBeNull();
    expect(queryByText("Bio")).toBeNull();
  });

  it("enters edit mode when Edit Profile is pressed", () => {
    const { getByText, queryByText } = renderProfileScreen();

    fireEvent.press(getByText("Edit Profile"));

    expect(getByText("Save")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
    expect(queryByText("Edit Profile")).toBeNull();
    expect(queryByText("Change photo")).toBeNull();
    expect(queryByText("Bio")).toBeNull();
  });

  it("cancels edit mode and restores read mode", () => {
    const { getByText, getByDisplayValue, queryByText } = renderProfileScreen();

    fireEvent.press(getByText("Edit Profile"));
    fireEvent.changeText(getByDisplayValue("Alex"), "Jordan");
    fireEvent.press(getByText("Cancel"));

    expect(getByText("Edit Profile")).toBeTruthy();
    expect(getByText("Alex")).toBeTruthy();
    expect(queryByText("Save")).toBeNull();
    expect(queryByText("Jordan")).toBeNull();
  });

  it("enables Save after a valid modification", () => {
    const { getByText, getByDisplayValue, getByRole } = renderProfileScreen();

    fireEvent.press(getByText("Edit Profile"));
    fireEvent.changeText(getByDisplayValue("Alex"), "Jordan");

    expect(getByRole("button", { name: "Save" }).props.accessibilityState?.disabled).toBe(
      false,
    );
  });

  it("calls updateProfile and refresh after a successful save", async () => {
    const { getByText, getByDisplayValue } = renderProfileScreen();

    fireEvent.press(getByText("Edit Profile"));
    fireEvent.changeText(getByDisplayValue("Alex"), "Jordan");
    fireEvent.press(getByText("Save"));

    await waitFor(() =>
      expect(updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: "Jordan",
          last_name: "Rivera",
        }),
      ),
    );
    expect(refresh).toHaveBeenCalled();
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        "Profile updated",
        "Profile updated successfully.",
        expect.any(Array),
      ),
    );
    expect(getByText("Edit Profile")).toBeTruthy();
  });

  it("shows an inline error and stays in edit mode when save fails", async () => {
    updateProfile.mockRejectedValueOnce(new Error("Network error"));

    const { getByText, getByDisplayValue, getByRole } = renderProfileScreen();

    fireEvent.press(getByText("Edit Profile"));
    fireEvent.changeText(getByDisplayValue("Alex"), "Jordan");
    fireEvent.press(getByText("Save"));

    expect(await findByTextHelper(getByText, "Network error")).toBeTruthy();
    expect(getByText("Save")).toBeTruthy();
    expect(getByRole("button", { name: "Save" }).props.accessibilityState?.disabled).toBe(
      false,
    );
  });

  it("keeps Save disabled when nothing changed", () => {
    const { getByText, getByRole } = renderProfileScreen();

    fireEvent.press(getByText("Edit Profile"));

    expect(getByRole("button", { name: "Save" }).props.accessibilityState?.disabled).toBe(
      true,
    );
    fireEvent.press(getByText("Save"));
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it("does not save when validation fails", () => {
    const { getByText, getByDisplayValue, getByRole } = renderProfileScreen();

    fireEvent.press(getByText("Edit Profile"));
    fireEvent.changeText(getByDisplayValue("Alex"), "   ");
    fireEvent.changeText(getByDisplayValue("178"), "0");
    fireEvent.press(getByText("Save"));

    expect(updateProfile).not.toHaveBeenCalled();
    expect(getByRole("button", { name: "Save" }).props.accessibilityState?.disabled).toBe(
      true,
    );
  });

  it("enables Save when editing a profile with unset optional fields (regression)", () => {
    mockedUseCurrentUser.mockReturnValue({
      profile: {
        ...profile,
        birthDate: null,
        gender: null,
        goal: null,
      },
      user,
      displayName: "Alex Rivera",
      email: "coach@evolve.app",
      memberSince: "March 2026",
      subscriptionTier: "Free",
      loading: false,
      saving: false,
      error: null,
      updateProfile,
      refresh,
    });

    const { getByText, getByDisplayValue, getByRole } = renderProfileScreen();

    fireEvent.press(getByText("Edit Profile"));
    fireEvent.changeText(getByDisplayValue("178"), "180");

    expect(getByRole("button", { name: "Save" }).props.accessibilityState?.disabled).toBe(
      false,
    );
  });

  it("saves height/weight/gender/goal edits without requiring untouched optional fields", async () => {
    mockedUseCurrentUser.mockReturnValue({
      profile: {
        ...profile,
        birthDate: null,
        gender: null,
        goal: null,
      },
      user,
      displayName: "Alex Rivera",
      email: "coach@evolve.app",
      memberSince: "March 2026",
      subscriptionTier: "Free",
      loading: false,
      saving: false,
      error: null,
      updateProfile,
      refresh,
    });

    const { getByText, getByDisplayValue } = renderProfileScreen();

    fireEvent.press(getByText("Edit Profile"));
    fireEvent.changeText(getByDisplayValue("178"), "180");
    fireEvent.changeText(getByDisplayValue("78"), "80");
    fireEvent.press(getByText("Male"));
    fireEvent.press(getByText("Lose weight"));
    fireEvent.press(getByText("Save"));

    await waitFor(() =>
      expect(updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          height_cm: 180,
          current_weight_kg: 80,
          gender: "male",
          goal: "lose_weight",
        }),
      ),
    );
    expect(refresh).toHaveBeenCalled();
  });

  it("enables Save for legacy accounts with null first_name", () => {
    mockedUseCurrentUser.mockReturnValue({
      profile: {
        userId: "user-1",
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
      },
      user: {
        ...user,
        username: "antonello",
      },
      displayName: "antonello",
      email: "coach@evolve.app",
      memberSince: "March 2026",
      subscriptionTier: "Free",
      loading: false,
      saving: false,
      error: null,
      updateProfile,
      refresh,
    });

    const { getByText, getByDisplayValue, getByPlaceholderText, getByRole } = renderProfileScreen();

    fireEvent.press(getByText("Edit Profile"));
    expect(getByDisplayValue("antonello")).toBeTruthy();
    fireEvent.changeText(getByPlaceholderText("e.g. 78"), "95");

    expect(getByRole("button", { name: "Save" }).props.accessibilityState?.disabled).toBe(
      false,
    );
  });
});

async function findByTextHelper(
  getByText: (text: string) => unknown,
  text: string,
) {
  return waitFor(() => getByText(text));
}

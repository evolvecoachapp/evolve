import { fireEvent, render, waitFor } from "@testing-library/react-native";
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

const mockedUseAuth = useAuth as jest.Mock;
const mockedUseCurrentUser = useCurrentUser as jest.Mock;

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

  it("starts in read mode with the current profile summary", () => {
    const { getByText, getAllByText, queryByText } = renderProfileScreen();

    expect(getByText("Edit Profile")).toBeTruthy();
    expect(getAllByText("Alex Rivera").length).toBeGreaterThan(0);
    expect(queryByText("Save")).toBeNull();
  });

  it("enters edit mode when Edit Profile is pressed", () => {
    const { getByText } = renderProfileScreen();

    fireEvent.press(getByText("Edit Profile"));

    expect(getByText("Save")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
    expect(getByText("Change photo")).toBeTruthy();
  });

  it("cancels edit mode and restores read mode", () => {
    const { getByText, queryByText } = renderProfileScreen();

    fireEvent.press(getByText("Edit Profile"));
    fireEvent.press(getByText("Cancel"));

    expect(getByText("Edit Profile")).toBeTruthy();
    expect(queryByText("Save")).toBeNull();
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
    expect(getByText("Profile updated successfully.")).toBeTruthy();
    expect(getByText("Edit Profile")).toBeTruthy();
  });

  it("shows an inline error and stays in edit mode when save fails", async () => {
    updateProfile.mockRejectedValueOnce(new Error("Network error"));

    const { getByText, getByDisplayValue } = renderProfileScreen();

    fireEvent.press(getByText("Edit Profile"));
    fireEvent.changeText(getByDisplayValue("Alex"), "Jordan");
    fireEvent.press(getByText("Save"));

    expect(await findByTextHelper(getByText, "Network error")).toBeTruthy();
    expect(getByText("Save")).toBeTruthy();
  });

  it("does not save when nothing changed", () => {
    const { getByText } = renderProfileScreen();

    fireEvent.press(getByText("Edit Profile"));
    fireEvent.press(getByText("Save"));

    expect(updateProfile).not.toHaveBeenCalled();
  });

  it("does not save when validation fails", () => {
    const { getByText, getByDisplayValue } = renderProfileScreen();

    fireEvent.press(getByText("Edit Profile"));
    fireEvent.changeText(getByDisplayValue("Alex"), "   ");
    fireEvent.changeText(getByDisplayValue("178"), "0");
    fireEvent.press(getByText("Save"));

    expect(updateProfile).not.toHaveBeenCalled();
  });
});

async function findByTextHelper(
  getByText: (text: string) => unknown,
  text: string,
) {
  return waitFor(() => getByText(text));
}

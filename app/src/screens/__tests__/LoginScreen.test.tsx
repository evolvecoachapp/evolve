import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoginScreen } from "../LoginScreen";
import { useAuth } from "../../auth/useAuth";
import { ThemeProvider } from "../../theme/ThemeContext";

jest.mock("../../auth/useAuth");
jest.mock("../../theme/themeStorage", () => ({
  getStoredThemePreference: jest.fn().mockResolvedValue(null),
  setStoredThemePreference: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

const mockedUseAuth = useAuth as jest.Mock;

const safeAreaMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderLoginScreen() {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <ThemeProvider>
        <LoginScreen />
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("calls login with the entered credentials on submit", async () => {
    const login = jest.fn().mockResolvedValue(undefined);
    mockedUseAuth.mockReturnValue({ login });

    const { getByPlaceholderText, getByText } = renderLoginScreen();

    fireEvent.changeText(getByPlaceholderText("you@example.com"), "user@example.com");
    fireEvent.changeText(getByPlaceholderText("••••••••"), "Password123!");
    fireEvent.press(getByText("Log in"));

    await waitFor(() => expect(login).toHaveBeenCalledWith("user@example.com", "Password123!"));
  });

  it("shows the error message when login fails", async () => {
    const login = jest.fn().mockRejectedValue(new Error("Invalid email or password."));
    mockedUseAuth.mockReturnValue({ login });

    const { getByPlaceholderText, getByText, findByText } = renderLoginScreen();

    fireEvent.changeText(getByPlaceholderText("you@example.com"), "user@example.com");
    fireEvent.changeText(getByPlaceholderText("••••••••"), "wrong-password");
    fireEvent.press(getByText("Log in"));

    expect(await findByText("Invalid email or password.")).toBeTruthy();
  });
});

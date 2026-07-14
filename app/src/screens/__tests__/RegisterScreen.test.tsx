import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RegisterScreen } from "../RegisterScreen";
import { useAuth } from "../../auth/useAuth";

jest.mock("../../auth/useAuth");
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

const mockedUseAuth = useAuth as jest.Mock;

const safeAreaMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderRegisterScreen() {
  return render(
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <RegisterScreen />
    </SafeAreaProvider>,
  );
}

describe("RegisterScreen", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("calls register with the entered email, username, and password", async () => {
    const register = jest.fn().mockResolvedValue(undefined);
    mockedUseAuth.mockReturnValue({ register });

    const { getByPlaceholderText, getByText } = renderRegisterScreen();

    fireEvent.changeText(getByPlaceholderText("you@example.com"), "user@example.com");
    fireEvent.changeText(getByPlaceholderText("yourname"), "evolveuser");
    fireEvent.changeText(getByPlaceholderText("At least 8 characters"), "Password123!");
    fireEvent.press(getByText("Create account"));

    await waitFor(() =>
      expect(register).toHaveBeenCalledWith({
        email: "user@example.com",
        username: "evolveuser",
        password: "Password123!",
      }),
    );
  });

  it("shows the error message when registration fails", async () => {
    const register = jest
      .fn()
      .mockRejectedValue(new Error("A user with this email or username already exists."));
    mockedUseAuth.mockReturnValue({ register });

    const { getByPlaceholderText, getByText, findByText } = renderRegisterScreen();

    fireEvent.changeText(getByPlaceholderText("you@example.com"), "user@example.com");
    fireEvent.changeText(getByPlaceholderText("yourname"), "evolveuser");
    fireEvent.changeText(getByPlaceholderText("At least 8 characters"), "Password123!");
    fireEvent.press(getByText("Create account"));

    expect(await findByText("A user with this email or username already exists.")).toBeTruthy();
  });
});

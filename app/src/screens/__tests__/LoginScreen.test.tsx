import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { LoginScreen } from "../LoginScreen";
import { useAuth } from "../../auth/useAuth";

jest.mock("../../auth/useAuth");
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

const mockedUseAuth = useAuth as jest.Mock;

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("calls login with the entered credentials on submit", async () => {
    const login = jest.fn().mockResolvedValue(undefined);
    mockedUseAuth.mockReturnValue({ login });

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("you@example.com"), "user@example.com");
    fireEvent.changeText(getByPlaceholderText("••••••••"), "Password123!");
    fireEvent.press(getByText("Log in"));

    await waitFor(() => expect(login).toHaveBeenCalledWith("user@example.com", "Password123!"));
  });

  it("shows the error message when login fails", async () => {
    const login = jest.fn().mockRejectedValue(new Error("Invalid email or password."));
    mockedUseAuth.mockReturnValue({ login });

    const { getByPlaceholderText, getByText, findByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText("you@example.com"), "user@example.com");
    fireEvent.changeText(getByPlaceholderText("••••••••"), "wrong-password");
    fireEvent.press(getByText("Log in"));

    expect(await findByText("Invalid email or password.")).toBeTruthy();
  });
});

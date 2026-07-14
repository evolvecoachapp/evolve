import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { RegisterScreen } from "../RegisterScreen";
import { useAuth } from "../../auth/useAuth";

jest.mock("../../auth/useAuth");
jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

const mockedUseAuth = useAuth as jest.Mock;

describe("RegisterScreen", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("calls register with the entered email, username, and password", async () => {
    const register = jest.fn().mockResolvedValue(undefined);
    mockedUseAuth.mockReturnValue({ register });

    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

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

    const { getByPlaceholderText, getByText, findByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText("you@example.com"), "user@example.com");
    fireEvent.changeText(getByPlaceholderText("yourname"), "evolveuser");
    fireEvent.changeText(getByPlaceholderText("At least 8 characters"), "Password123!");
    fireEvent.press(getByText("Create account"));

    expect(await findByText("A user with this email or username already exists.")).toBeTruthy();
  });
});

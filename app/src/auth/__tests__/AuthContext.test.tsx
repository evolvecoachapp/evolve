import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Text, View } from "react-native";
import * as authApi from "../../api/auth";
import type { UserPublic } from "../../types/api";
import { AuthProvider, useAuth } from "../AuthContext";
import * as secureStorage from "../secureStorage";

jest.mock("../../api/auth");
jest.mock("../secureStorage");

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockedSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>;

const testUser: UserPublic = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "user@example.com",
  username: "evolveuser",
  first_name: null,
  last_name: null,
  birth_date: null,
  gender: null,
  height_cm: null,
  current_weight_kg: null,
  target_weight_kg: null,
  activity_level: null,
  goal: null,
  is_active: true,
  is_verified: false,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

function Probe() {
  const { isBootstrapping, isAuthenticated, user, login, logout, refreshUser } = useAuth();
  return (
    <View>
      <Text testID="bootstrapping">{String(isBootstrapping)}</Text>
      <Text testID="authenticated">{String(isAuthenticated)}</Text>
      <Text testID="username">{user?.username ?? ""}</Text>
      <Text testID="first-name">{user?.first_name ?? ""}</Text>
      <Text testID="goal">{user?.goal ?? ""}</Text>
      <Text testID="login" onPress={() => login("user@example.com", "Password123!")}>
        login
      </Text>
      <Text testID="refresh" onPress={() => refreshUser()}>
        refresh
      </Text>
      <Text testID="logout" onPress={() => logout()}>
        logout
      </Text>
    </View>
  );
}

function renderProbe() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("starts unauthenticated when no tokens are stored", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue(null);

    const { getByTestId } = renderProbe();

    await waitFor(() => expect(getByTestId("bootstrapping").props.children).toBe("false"));
    expect(getByTestId("authenticated").props.children).toBe("false");
    expect(mockedAuthApi.getCurrentUser).not.toHaveBeenCalled();
  });

  it("resumes an authenticated session when stored tokens resolve to a user", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({ accessToken: "a", refreshToken: "r" });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);

    const { getByTestId } = renderProbe();

    await waitFor(() => expect(getByTestId("authenticated").props.children).toBe("true"));
    expect(getByTestId("username").props.children).toBe("evolveuser");
  });

  it("clears stale tokens and stays unauthenticated when session verification fails", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({ accessToken: "a", refreshToken: "r" });
    mockedAuthApi.getCurrentUser.mockRejectedValue(new Error("unauthenticated"));

    const { getByTestId } = renderProbe();

    await waitFor(() => expect(getByTestId("bootstrapping").props.children).toBe("false"));
    expect(getByTestId("authenticated").props.children).toBe("false");
    expect(mockedSecureStorage.clearTokens).toHaveBeenCalled();
  });

  it("logs in, persists the returned tokens, and exposes the authenticated user", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue(null);
    mockedAuthApi.login.mockResolvedValue({
      access_token: "a",
      refresh_token: "r",
      token_type: "bearer",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);

    const { getByTestId } = renderProbe();
    await waitFor(() => expect(getByTestId("bootstrapping").props.children).toBe("false"));

    fireEvent.press(getByTestId("login"));

    await waitFor(() => expect(getByTestId("authenticated").props.children).toBe("true"));
    expect(mockedAuthApi.login).toHaveBeenCalledWith("user@example.com", "Password123!");
    expect(mockedSecureStorage.saveTokens).toHaveBeenCalledWith({ accessToken: "a", refreshToken: "r" });
  });

  it("logs out and clears the authenticated user", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({ accessToken: "a", refreshToken: "r" });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);

    const { getByTestId } = renderProbe();
    await waitFor(() => expect(getByTestId("authenticated").props.children).toBe("true"));

    fireEvent.press(getByTestId("logout"));

    await waitFor(() => expect(getByTestId("authenticated").props.children).toBe("false"));
    expect(mockedSecureStorage.clearTokens).toHaveBeenCalled();
  });

  it("refreshUser reloads GET /users/me into AuthContext after a profile PATCH", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({ accessToken: "a", refreshToken: "r" });
    mockedAuthApi.getCurrentUser
      .mockResolvedValueOnce(testUser)
      .mockResolvedValueOnce({
        ...testUser,
        first_name: "Jordan",
        goal: "gain_muscle",
        height_cm: 170,
        current_weight_kg: 62,
      });

    const { getByTestId } = renderProbe();
    await waitFor(() => expect(getByTestId("authenticated").props.children).toBe("true"));
    expect(getByTestId("username").props.children).toBe("evolveuser");

    fireEvent.press(getByTestId("refresh"));

    await waitFor(() => expect(getByTestId("first-name").props.children).toBe("Jordan"));
    expect(getByTestId("goal").props.children).toBe("gain_muscle");
    expect(mockedAuthApi.getCurrentUser).toHaveBeenCalledTimes(2);
  });
});

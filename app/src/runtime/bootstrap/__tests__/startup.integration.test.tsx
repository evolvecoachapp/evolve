import { render, waitFor } from "@testing-library/react-native";
import { Text, View } from "react-native";
import * as authApi from "../../../api/auth";
import type { UserPublic } from "../../../types/api";
import { AuthProvider } from "../../../auth/AuthContext";
import * as secureStorage from "../../../auth/secureStorage";
import { resetCompositionRoot } from "../../../core/composition/createCompositionRoot";
import {
  RuntimeBootstrapProvider,
  resetRuntimeBootstrapForTests,
  useRuntimeBootstrap,
} from "../RuntimeBootstrapContext";
import { BOOTSTRAP_STATUS } from "../BootstrapStatus";

jest.mock("../../../api/auth");
jest.mock("../../../auth/secureStorage");

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
  const { isBootstrapping, status } = useRuntimeBootstrap();
  return (
    <View>
      <Text testID="bootstrapping">{String(isBootstrapping)}</Text>
      <Text testID="status">{status}</Text>
    </View>
  );
}

function renderProbe() {
  return render(
    <AuthProvider>
      <RuntimeBootstrapProvider>
        <Probe />
      </RuntimeBootstrapProvider>
    </AuthProvider>,
  );
}

describe("RuntimeBootstrapProvider startup integration", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    resetRuntimeBootstrapForTests();
    resetCompositionRoot();
  });

  it("does not bootstrap runtime for unauthenticated users", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue(null);

    const { getByTestId } = renderProbe();

    await waitFor(() =>
      expect(getByTestId("bootstrapping").props.children).toBe("false"),
    );
    expect(getByTestId("status").props.children).toBe(BOOTSTRAP_STATUS.idle);
  });

  it("bootstraps runtime after auth succeeds and exposes ready status", async () => {
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    mockedAuthApi.getCurrentUser.mockResolvedValue(testUser);

    const { getByTestId } = renderProbe();

    await waitFor(() =>
      expect(getByTestId("status").props.children).toBe(BOOTSTRAP_STATUS.ready),
    );
    expect(getByTestId("bootstrapping").props.children).toBe("false");
  });
});

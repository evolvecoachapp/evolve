import * as SecureStore from "expo-secure-store";
import { clearTokens, getAccessToken, getTokens, saveTokens } from "../secureStorage";

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe("secureStorage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("saves both tokens under their own keys", async () => {
    await saveTokens({ accessToken: "access-1", refreshToken: "refresh-1" });

    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith("evolve.access_token", "access-1");
    expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith("evolve.refresh_token", "refresh-1");
  });

  it("returns null from getTokens when either token is missing", async () => {
    mockedSecureStore.getItemAsync.mockImplementation(async (key: string) =>
      key === "evolve.access_token" ? "access-1" : null,
    );

    await expect(getTokens()).resolves.toBeNull();
  });

  it("returns the token pair from getTokens when both are present", async () => {
    mockedSecureStore.getItemAsync.mockImplementation(async (key: string) =>
      key === "evolve.access_token" ? "access-1" : "refresh-1",
    );

    await expect(getTokens()).resolves.toEqual({ accessToken: "access-1", refreshToken: "refresh-1" });
  });

  it("reads only the access token via getAccessToken", async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue("access-1");

    await expect(getAccessToken()).resolves.toBe("access-1");
    expect(mockedSecureStore.getItemAsync).toHaveBeenCalledWith("evolve.access_token");
  });

  it("deletes both tokens on clearTokens", async () => {
    await clearTokens();

    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith("evolve.access_token");
    expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith("evolve.refresh_token");
  });
});

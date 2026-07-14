import * as secureStorage from "../../auth/secureStorage";
import { ApiError, request } from "../client";

jest.mock("../../auth/secureStorage");

const mockedSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>;

function mockFetchSequence(...responses: { status: number; body: unknown }[]) {
  const mockFetch = jest.fn();
  responses.forEach(({ status, body }) => {
    mockFetch.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(body),
    } as unknown as Response);
  });
  global.fetch = mockFetch as unknown as typeof fetch;
  return mockFetch;
}

describe("request", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("attaches the bearer token and returns the parsed JSON body on success", async () => {
    mockedSecureStorage.getAccessToken.mockResolvedValue("access-1");
    const mockFetch = mockFetchSequence({ status: 200, body: { ok: true } });

    const result = await request<{ ok: boolean }>("/api/v1/users/me");

    expect(result).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Authorization).toBe("Bearer access-1");
  });

  it("refreshes once and retries after a 401, then returns the retried response", async () => {
    mockedSecureStorage.getAccessToken.mockResolvedValue("expired-access");
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "expired-access",
      refreshToken: "refresh-1",
    });
    const mockFetch = mockFetchSequence(
      { status: 401, body: { detail: "Not authenticated" } },
      { status: 200, body: { access_token: "new-access", refresh_token: "new-refresh", token_type: "bearer" } },
      { status: 200, body: { ok: true } },
    );

    const result = await request<{ ok: boolean }>("/api/v1/users/me");

    expect(result).toEqual({ ok: true });
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockedSecureStorage.saveTokens).toHaveBeenCalledWith({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
    const [, retryOptions] = mockFetch.mock.calls[2];
    expect(retryOptions.headers.Authorization).toBe("Bearer new-access");
  });

  it("clears tokens and rethrows the original 401 when the refresh call itself fails", async () => {
    mockedSecureStorage.getAccessToken.mockResolvedValue("expired-access");
    mockedSecureStorage.getTokens.mockResolvedValue({
      accessToken: "expired-access",
      refreshToken: "invalid-refresh",
    });
    const mockFetch = mockFetchSequence(
      { status: 401, body: { detail: "Not authenticated" } },
      { status: 401, body: { detail: "Invalid or expired refresh token." } },
    );

    await expect(request("/api/v1/users/me")).rejects.toBeInstanceOf(ApiError);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockedSecureStorage.clearTokens).toHaveBeenCalled();
  });

  it("never attaches a token or attempts a refresh for auth: false requests", async () => {
    const mockFetch = mockFetchSequence({ status: 401, body: { detail: "Invalid email or password." } });

    await expect(
      request("/api/v1/auth/login", { method: "POST", body: { email: "a", password: "b" }, auth: false }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockedSecureStorage.getAccessToken).not.toHaveBeenCalled();
  });

  it("surfaces the server-provided detail message on failure", async () => {
    mockedSecureStorage.getAccessToken.mockResolvedValue(null);
    mockFetchSequence({ status: 409, body: { detail: "A user with this email or username already exists." } });

    await expect(request("/api/v1/auth/register", { method: "POST", auth: false })).rejects.toThrow(
      "A user with this email or username already exists.",
    );
  });
});

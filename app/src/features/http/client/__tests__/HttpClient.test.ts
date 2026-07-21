import { HttpError } from "../../models/HttpError";
import { HttpClient, type FetchLike } from "../HttpClient";

function jsonResponse(
  status: number,
  body: unknown,
  statusText = "",
): Response {
  return new Response(JSON.stringify(body), {
    status,
    statusText,
    headers: { "Content-Type": "application/json" },
  });
}

describe("HttpClient", () => {
  it("executes a request and parses JSON", async () => {
    const fetchImpl: FetchLike = jest.fn(async () =>
      jsonResponse(200, { ok: true }),
    );

    const client = new HttpClient({ fetchImpl, defaultMaxRetries: 0 });
    const response = await client.request<{ ok: boolean }>({
      url: "https://example.com/api",
      method: "GET",
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("serializes JSON body and sets Content-Type", async () => {
    const fetchImpl: FetchLike = jest.fn(async (_url, init) => {
      expect(init?.method).toBe("POST");
      expect(init?.body).toBe(JSON.stringify({ a: 1 }));
      const headers = init?.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/json");
      return jsonResponse(200, { id: "1" });
    });

    const client = new HttpClient({ fetchImpl });
    await client.request({
      url: "https://example.com/api",
      method: "POST",
      body: { a: 1 },
    });
  });

  it("maps non-2xx responses to HttpError", async () => {
    const fetchImpl: FetchLike = jest.fn(async () =>
      jsonResponse(429, { error: "slow down" }, "Too Many Requests"),
    );

    const client = new HttpClient({ fetchImpl, defaultMaxRetries: 0 });

    await expect(
      client.request({ url: "https://example.com", method: "GET" }),
    ).rejects.toMatchObject({
      name: "HttpError",
      code: "http",
      status: 429,
      retryable: true,
    });
  });

  it("retries retryable failures then succeeds", async () => {
    const fetchImpl: FetchLike = jest
      .fn()
      .mockResolvedValueOnce(jsonResponse(503, { error: "busy" }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    const sleep = jest.fn(async () => undefined);
    const client = new HttpClient({
      fetchImpl,
      sleep,
      defaultMaxRetries: 2,
    });

    const response = await client.request<{ ok: boolean }>({
      url: "https://example.com",
      method: "GET",
      retry: { maxRetries: 2, baseDelayMs: 1 },
    });

    expect(response.body).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);
  });

  it("does not retry non-retryable HTTP errors", async () => {
    const fetchImpl: FetchLike = jest.fn(async () =>
      jsonResponse(401, { error: "nope" }),
    );

    const client = new HttpClient({ fetchImpl, defaultMaxRetries: 3 });

    await expect(
      client.request({ url: "https://example.com", method: "GET" }),
    ).rejects.toBeInstanceOf(HttpError);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("maps abort to timeout HttpError", async () => {
    const fetchImpl: FetchLike = jest.fn(async (_url, init) => {
      const error = new Error("Aborted");
      error.name = "AbortError";
      // Ensure signal is present (TimeoutPolicy attaches it).
      expect(init?.signal).toBeDefined();
      throw error;
    });

    const client = new HttpClient({ fetchImpl, defaultMaxRetries: 0 });

    await expect(
      client.request({
        url: "https://example.com",
        method: "GET",
        timeoutMs: 50,
      }),
    ).rejects.toMatchObject({
      code: "timeout",
      retryable: true,
    });
  });

  it("maps network failures to HttpError", async () => {
    const fetchImpl: FetchLike = jest.fn(async () => {
      throw new TypeError("Failed to fetch");
    });

    const client = new HttpClient({ fetchImpl, defaultMaxRetries: 0 });

    await expect(
      client.request({ url: "https://example.com", method: "GET" }),
    ).rejects.toMatchObject({
      code: "network",
      retryable: true,
    });
  });
});

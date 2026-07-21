import { HttpError } from "../../../../http/models/HttpError";
import { AIError } from "../../../models/AIError";
import { OpenAIErrorMapper } from "../OpenAIErrorMapper";

describe("OpenAIErrorMapper", () => {
  it.each([
    [401, "authentication_failed"],
    [403, "authorization_failed"],
    [404, "not_found"],
    [408, "timeout"],
    [429, "rate_limited"],
    [500, "provider_unavailable"],
    [502, "provider_unavailable"],
    [503, "provider_unavailable"],
    [504, "provider_unavailable"],
  ] as const)("maps HTTP %s to %s", (status, code) => {
    const mapped = OpenAIErrorMapper.map(
      new HttpError("http", `HTTP ${status}`, {
        status,
        retryable: false,
      }),
    );

    expect(mapped).toBeInstanceOf(AIError);
    expect(mapped.code).toBe(code);
    expect(mapped.providerType).toBe("openai");
  });

  it("maps timeout HttpError to timeout AIError", () => {
    const mapped = OpenAIErrorMapper.map(
      new HttpError("timeout", "timed out", { retryable: true }),
    );
    expect(mapped.code).toBe("timeout");
  });

  it("maps network HttpError to provider_unavailable", () => {
    const mapped = OpenAIErrorMapper.map(
      new HttpError("network", "offline", { retryable: true }),
    );
    expect(mapped.code).toBe("provider_unavailable");
  });

  it("passthrough AIError instances", () => {
    const original = new AIError("invalid_request", "bad", "openai");
    expect(OpenAIErrorMapper.map(original)).toBe(original);
  });

  it("never returns HttpError", () => {
    const mapped = OpenAIErrorMapper.map(
      new HttpError("http", "boom", { status: 500, retryable: true }),
    );
    expect(mapped).toBeInstanceOf(AIError);
    expect(mapped).not.toBeInstanceOf(HttpError);
  });
});

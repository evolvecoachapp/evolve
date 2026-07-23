import {
  AuthenticationError,
  ConfigurationError,
  InvalidResponseError,
  NetworkError,
  ProviderUnavailableError,
  RateLimitError,
  TimeoutError,
} from "../errors";
import { OpenAIErrorMapper } from "../mappers/OpenAIErrorMapper";

describe("openai-provider errors", () => {
  it("dedicated hierarchy maps into AIError", () => {
    const auth = new AuthenticationError("bad key", { status: 401 });
    const rate = new RateLimitError("slow down", { status: 429 });
    const timeout = new TimeoutError("timed out");
    const network = new NetworkError("offline");
    const unavailable = new ProviderUnavailableError("down", { status: 503 });
    const invalid = new InvalidResponseError("bad payload");
    const config = new ConfigurationError("missing key");

    expect(auth.toAIError().code).toBe("authentication_error");
    expect(rate.toAIError().retryable).toBe(true);
    expect(timeout.toAIError().code).toBe("timeout_error");
    expect(network.toAIError().code).toBe("network_error");
    expect(unavailable.toAIError().code).toBe("provider_unavailable_error");
    expect(invalid.toAIError().retryable).toBe(false);
    expect(config.toAIError().code).toBe("configuration_error");
  });

  it("OpenAIErrorMapper classifies status codes", () => {
    expect(OpenAIErrorMapper.toTypedError({ status: 401, message: "no" })).toBeInstanceOf(
      AuthenticationError,
    );
    expect(OpenAIErrorMapper.toTypedError({ status: 429, message: "no" })).toBeInstanceOf(
      RateLimitError,
    );
    expect(OpenAIErrorMapper.toTypedError({ status: 500, message: "no" })).toBeInstanceOf(
      ProviderUnavailableError,
    );
  });
});

import { OpenAIBaseError } from "./OpenAIBaseError";

export class ProviderUnavailableError extends OpenAIBaseError {
  readonly code = "provider_unavailable_error";
  readonly retryable = true;
}

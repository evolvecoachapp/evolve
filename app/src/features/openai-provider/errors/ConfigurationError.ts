import { OpenAIBaseError } from "./OpenAIBaseError";

export class ConfigurationError extends OpenAIBaseError {
  readonly code = "configuration_error";
  readonly retryable = false;
}

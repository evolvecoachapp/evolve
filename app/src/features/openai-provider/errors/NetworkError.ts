import { OpenAIBaseError } from "./OpenAIBaseError";

export class NetworkError extends OpenAIBaseError {
  readonly code = "network_error";
  readonly retryable = true;
}

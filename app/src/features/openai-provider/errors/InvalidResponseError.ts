import { OpenAIBaseError } from "./OpenAIBaseError";

export class InvalidResponseError extends OpenAIBaseError {
  readonly code = "invalid_response_error";
  readonly retryable = false;
}

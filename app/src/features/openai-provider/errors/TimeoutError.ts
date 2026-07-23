import { OpenAIBaseError } from "./OpenAIBaseError";

export class TimeoutError extends OpenAIBaseError {
  readonly code = "timeout_error";
  readonly retryable = true;
}

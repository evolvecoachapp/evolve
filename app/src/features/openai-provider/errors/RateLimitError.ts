import { OpenAIBaseError } from "./OpenAIBaseError";

export class RateLimitError extends OpenAIBaseError {
  readonly code = "rate_limit_error";
  readonly retryable = true;
}

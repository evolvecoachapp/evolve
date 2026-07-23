import { OpenAIBaseError } from "./OpenAIBaseError";

export class AuthenticationError extends OpenAIBaseError {
  readonly code = "authentication_error";
  readonly retryable = false;
}

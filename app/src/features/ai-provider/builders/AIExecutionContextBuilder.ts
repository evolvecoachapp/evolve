import type { AIExecutionContext } from "../models/AIExecutionContext";
import type { AIExecutionOptions } from "../models/AIExecutionOptions";
import { DEFAULT_EXECUTION_OPTIONS } from "../models/AIExecutionOptions";
import type { AIProvider } from "../models/AIProvider";
import type { AIRequest } from "../models/AIRequest";
import { freezeExecutionContext } from "../utils/freezeObjects";

/**
 * Fluent builder for immutable AIExecutionContext.
 */
export class AIExecutionContextBuilder {
  private id = "";
  private request: AIRequest | null = null;
  private provider: AIProvider | null = null;
  private options: AIExecutionOptions = DEFAULT_EXECUTION_OPTIONS;
  private preparedAt = "";
  private validationIssues: readonly string[] = [];

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withRequest(request: AIRequest): this {
    this.request = request;
    return this;
  }

  withProvider(provider: AIProvider): this {
    this.provider = provider;
    return this;
  }

  withOptions(options: AIExecutionOptions): this {
    this.options = options;
    return this;
  }

  withPreparedAt(preparedAt: string): this {
    this.preparedAt = preparedAt;
    return this;
  }

  withValidationIssues(issues: readonly string[]): this {
    this.validationIssues = issues;
    return this;
  }

  build(): AIExecutionContext {
    if (!this.id || !this.request || !this.provider || !this.preparedAt) {
      throw new Error("AIExecutionContextBuilder missing required fields");
    }

    return freezeExecutionContext({
      id: this.id,
      requestId: this.request.id,
      providerId: this.provider.id,
      provider: this.provider,
      request: this.request,
      options: this.options,
      preparedAt: this.preparedAt,
      validationIssues: this.validationIssues,
    });
  }
}

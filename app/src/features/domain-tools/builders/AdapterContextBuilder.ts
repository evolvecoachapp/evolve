import type { ToolExecutionContext } from "../../tool-calling/models/ToolExecutionContext";
import type { AdapterContext } from "../models/AdapterContext";
import type { DomainToolDomain } from "../models/DomainToolDomain";
import { freezeAdapterContext } from "../utils/freezeObjects";

/**
 * Fluent builder for immutable AdapterContext.
 */
export class AdapterContextBuilder {
  private adapterId = "";
  private domain: DomainToolDomain = "workout";
  private toolId = "";
  private executionContext: ToolExecutionContext | null = null;
  private now = "";
  private attributes: Readonly<Record<string, unknown>> = Object.freeze({});

  withAdapterId(adapterId: string): this {
    this.adapterId = adapterId;
    return this;
  }

  withDomain(domain: DomainToolDomain): this {
    this.domain = domain;
    return this;
  }

  withToolId(toolId: string): this {
    this.toolId = toolId;
    return this;
  }

  withExecutionContext(context: ToolExecutionContext): this {
    this.executionContext = context;
    this.now = context.now;
    this.attributes = context.attributes;
    return this;
  }

  withNow(now: string): this {
    this.now = now;
    return this;
  }

  withAttributes(attributes: Readonly<Record<string, unknown>>): this {
    this.attributes = attributes;
    return this;
  }

  build(): AdapterContext {
    if (!this.executionContext) {
      throw new Error("AdapterContextBuilder requires executionContext");
    }
    return freezeAdapterContext({
      adapterId: this.adapterId,
      domain: this.domain,
      toolId: this.toolId,
      executionContext: this.executionContext,
      now: this.now || this.executionContext.now,
      attributes: this.attributes,
    });
  }
}

import type { FoundationToolResult } from "../../tool-calling/models/FoundationToolResult";
import type { ToolCallRequest } from "../../tool-calling/models/ToolCallRequest";
import type { IDomainToolAdapter } from "../../domain-tools/contracts/IDomainToolAdapter";
import type { ToolDispatchResult } from "../models/ToolDispatchResult";
import type { ToolFailure } from "../models/ToolFailure";
import { ToolFailureCodes } from "../models/ToolFailure";
import type { ToolResult } from "../models/ToolResult";
import type { ToolSuccess } from "../models/ToolSuccess";
import { freezeDispatchResult, freezeToolResult } from "../utils/freezeExecution";
import type { AdapterResolver } from "../resolver/AdapterResolver";
import type { DispatchContext } from "./DispatchContext";
import {
  DefaultDispatchPolicy,
  type DispatchPolicy,
} from "./DispatchPolicy";

export interface ToolDispatcherDeps {
  readonly adapterResolver: AdapterResolver;
  readonly policy?: DispatchPolicy;
  readonly clock?: () => string;
  readonly nowMs?: () => number;
}

/**
 * Routes a resolved step to a Domain Tool Adapter.
 * Responsible only for routing — domain logic stays in adapters.
 */
export class ToolDispatcher {
  readonly id = "dispatcher:tool:default";

  private readonly adapterResolver: AdapterResolver;
  private readonly policy: DispatchPolicy;
  private readonly clock: () => string;
  private readonly nowMs: () => number;

  constructor(deps: ToolDispatcherDeps) {
    this.adapterResolver = deps.adapterResolver;
    this.policy = deps.policy ?? new DefaultDispatchPolicy();
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.nowMs = deps.nowMs ?? (() => Date.now());
  }

  async dispatch(
    context: DispatchContext,
    requestFactory: (adapter: IDomainToolAdapter) => ToolCallRequest,
  ): Promise<ToolDispatchResult> {
    if (!this.policy.canDispatch(context)) {
      const reason = this.policy.rejectReason(context) ?? "dispatch_rejected";
      const failure = this.buildFailure(context, reason);
      const result = freezeToolResult({
        kind: "failure",
        success: null,
        failure,
      });
      return freezeDispatchResult({
        stepId: context.step.id,
        adapterId: context.step.adapterId,
        toolId: context.step.toolId,
        accepted: false,
        reason,
        result,
      });
    }

    const adapter = this.adapterResolver.resolveByToolId(
      context.step.toolId!,
    );
    if (!adapter) {
      const failure = this.buildFailure(
        context,
        ToolFailureCodes.ADAPTER_UNAVAILABLE,
      );
      const result = freezeToolResult({
        kind: "failure",
        success: null,
        failure,
      });
      return freezeDispatchResult({
        stepId: context.step.id,
        adapterId: null,
        toolId: context.step.toolId,
        accepted: false,
        reason: ToolFailureCodes.ADAPTER_UNAVAILABLE,
        result,
      });
    }

    const started = this.nowMs();
    const request = requestFactory(adapter);
    const foundation = await adapter.execute(request);
    const completedAt = this.clock();
    const durationMs = this.nowMs() - started;
    const toolResult = this.mapFoundationResult(
      context,
      adapter,
      foundation,
      durationMs,
      completedAt,
    );

    return freezeDispatchResult({
      stepId: context.step.id,
      adapterId: adapter.id(),
      toolId: context.step.toolId,
      accepted: true,
      reason: null,
      result: toolResult,
    });
  }

  private mapFoundationResult(
    context: DispatchContext,
    adapter: IDomainToolAdapter,
    foundation: FoundationToolResult,
    durationMs: number,
    completedAt: string,
  ): ToolResult {
    if (foundation.status === "succeeded") {
      const success: ToolSuccess = Object.freeze({
        stepId: context.step.id,
        toolId: context.step.toolId!,
        adapterId: adapter.id(),
        data: foundation.output?.data ?? null,
        durationMs: foundation.durationMs ?? durationMs,
        completedAt,
      });
      return freezeToolResult({
        kind: "success",
        success,
        failure: null,
      });
    }

    const failure: ToolFailure = Object.freeze({
      stepId: context.step.id,
      toolId: context.step.toolId,
      adapterId: adapter.id(),
      code: foundation.error?.code ?? ToolFailureCodes.ADAPTER_FAILED,
      message:
        foundation.error?.message ?? "Domain tool adapter returned failure",
      details: foundation.error?.details ?? null,
      durationMs: foundation.durationMs ?? durationMs,
      completedAt,
    });
    return freezeToolResult({
      kind: "failure",
      success: null,
      failure,
    });
  }

  private buildFailure(
    context: DispatchContext,
    code: string,
  ): ToolFailure {
    return Object.freeze({
      stepId: context.step.id,
      toolId: context.step.toolId,
      adapterId: context.step.adapterId,
      code,
      message: `Dispatch rejected: ${code}`,
      details: null,
      durationMs: null,
      completedAt: this.clock(),
    });
  }
}

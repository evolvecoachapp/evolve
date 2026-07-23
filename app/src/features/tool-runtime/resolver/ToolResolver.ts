import type { ActionPlan } from "../../action-engine/models/ActionPlan";
import type { ActionStep } from "../../action-engine/models/ActionStep";
import type { ActionType } from "../../action-engine/models/ActionType";
import type { IDomainToolAdapter } from "../../domain-tools/contracts/IDomainToolAdapter";
import type { ToolExecutionMetadata } from "../models/ToolExecutionMetadata";
import { EMPTY_TOOL_EXECUTION_METADATA } from "../models/ToolExecutionMetadata";
import type { ToolExecutionStep } from "../models/ToolExecutionStep";
import { ToolExecutionStatuses } from "../models/ToolExecutionStatus";
import { freezeExecutionStep } from "../utils/freezeExecution";
import { ActionResolver } from "./ActionResolver";
import { AdapterResolver } from "./AdapterResolver";
import { CapabilityResolver } from "./CapabilityResolver";

export interface ResolvedToolBinding {
  readonly actionStep: ActionStep;
  readonly toolId: string | null;
  readonly adapter: IDomainToolAdapter | null;
  readonly executionStep: ToolExecutionStep;
}

/**
 * Facade: ActionStep → tool id → Domain Tool Adapter.
 * Resolve only — never executes.
 */
export class ToolResolver {
  readonly id = "resolver:tool:default";

  readonly actionResolver: ActionResolver;
  readonly adapterResolver: AdapterResolver;
  readonly capabilityResolver: CapabilityResolver;

  constructor(
    adapters: readonly IDomainToolAdapter[] = [],
    actionResolver = new ActionResolver(),
    adapterResolver = new AdapterResolver(adapters),
  ) {
    this.actionResolver = actionResolver;
    this.adapterResolver = adapterResolver;
    this.capabilityResolver = new CapabilityResolver(this.adapterResolver);
  }

  resolveStep(
    step: ActionStep,
    options: {
      readonly planId: string;
      readonly metadata?: ToolExecutionMetadata;
    },
  ): ResolvedToolBinding {
    const explicitToolId =
      typeof step.metadata.attributes.toolId === "string"
        ? step.metadata.attributes.toolId
        : null;
    const toolId = this.actionResolver.resolveToolId(
      step.type as ActionType,
      explicitToolId,
    );
    const adapter =
      toolId != null
        ? this.capabilityResolver.resolveAdapter(toolId)
        : null;

    const executionStep = freezeExecutionStep({
      id: `exec:${step.id}`,
      planId: options.planId,
      actionStepId: step.id,
      actionType: step.type,
      label: step.label,
      toolId,
      adapterId: adapter?.id() ?? null,
      order: step.order,
      dependsOn: Object.freeze(step.dependsOn.map((d) => `exec:${d}`)),
      status:
        adapter != null
          ? ToolExecutionStatuses.READY
          : ToolExecutionStatuses.BLOCKED,
      sourceStep: step,
      metadata: options.metadata ?? {
        ...EMPTY_TOOL_EXECUTION_METADATA,
        sourcePlanId: step.planId,
        tags: Object.freeze([step.type]),
      },
    });

    return Object.freeze({
      actionStep: step,
      toolId,
      adapter,
      executionStep,
    });
  }

  resolvePlan(plan: ActionPlan, executionPlanId: string): readonly ResolvedToolBinding[] {
    return Object.freeze(
      plan.steps.map((step) =>
        this.resolveStep(step, {
          planId: executionPlanId,
          metadata: {
            ...EMPTY_TOOL_EXECUTION_METADATA,
            sourcePlanId: plan.id,
            tags: Object.freeze([step.type]),
          },
        }),
      ),
    );
  }
}

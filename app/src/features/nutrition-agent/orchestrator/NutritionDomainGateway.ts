import type { NutritionIntent } from "../models/NutritionIntent";
import type { NutritionCapability } from "../models/NutritionCapability";
import { NutritionCapabilities } from "../models/NutritionCapability";
import type { NutritionDomainInvocation } from "../models/NutritionDomainInvocation";
import { NutritionDomainInvocationStatuses } from "../models/NutritionDomainInvocation";
import type {
  NutritionAdjustMacrosRequest,
  NutritionDomainPayloads,
  NutritionDomainPorts,
  NutritionDomainResultRef,
} from "../models/NutritionDomainPayloads";
import { NutritionCapabilitySelector } from "../selectors/NutritionCapabilitySelector";

export interface NutritionDomainGatewayDeps {
  readonly ports?: NutritionDomainPorts;
  readonly clock?: () => string;
  readonly capabilitySelector?: NutritionCapabilitySelector;
}

/**
 * Translates agent orchestration into Nutrition Domain port calls.
 * No calculations. No algorithms. Missing payloads → skipped.
 */
export class NutritionDomainGateway {
  private readonly ports: NutritionDomainPorts;
  private readonly clock: () => string;
  private readonly capabilitySelector: NutritionCapabilitySelector;

  constructor(deps: NutritionDomainGatewayDeps = {}) {
    this.ports = deps.ports ?? {};
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.capabilitySelector =
      deps.capabilitySelector ?? new NutritionCapabilitySelector();
  }

  selectCapabilities(intent: NutritionIntent): readonly NutritionCapability[] {
    return this.capabilitySelector.select(intent);
  }

  /**
   * Record selected capabilities without invoking domain ports.
   */
  planInvocations(
    intent: NutritionIntent,
    contextId: string,
  ): readonly NutritionDomainInvocation[] {
    const selected = this.selectCapabilities(intent);
    return Object.freeze(
      selected.map((capability, index) =>
        this.freezeInvocation({
          id: `ndomain:${contextId}:${index}:${capability}`,
          capability,
          status: NutritionDomainInvocationStatuses.SELECTED,
          summary: `Selected ${capability} for intent ${intent}.`,
          resultRef: null,
          attributes: Object.freeze({ intent }),
          invokedAt: this.clock(),
        }),
      ),
    );
  }

  /**
   * Adjust-macros path — invokes AdjustMacros port when request is supplied.
   */
  async invokeAdjustMacros(
    request: NutritionAdjustMacrosRequest,
    contextId: string,
  ): Promise<{
    readonly result: NutritionDomainResultRef;
    readonly invocation: NutritionDomainInvocation;
  }> {
    const port = this.ports.adjustMacros;
    if (!port) {
      return {
        result: Object.freeze({
          id: request.id,
          summary: "AdjustMacros port not configured.",
          attributes: Object.freeze({}),
        }),
        invocation: this.freezeInvocation({
          id: `ndomain:${contextId}:adjust_macros`,
          capability: NutritionCapabilities.ADJUST_MACROS,
          status: NutritionDomainInvocationStatuses.SKIPPED,
          summary: "Skipped adjust_macros; port not configured.",
          resultRef: null,
          attributes: Object.freeze({ missing: "adjustMacrosPort" }),
          invokedAt: this.clock(),
        }),
      };
    }

    const result = await port(request);
    return {
      result,
      invocation: this.freezeInvocation({
        id: `ndomain:${contextId}:adjust_macros`,
        capability: NutritionCapabilities.ADJUST_MACROS,
        status: NutritionDomainInvocationStatuses.INVOKED,
        summary: result.summary ?? "AdjustMacros invoked.",
        resultRef: result.id,
        attributes: Object.freeze({ ...result.attributes }),
        invokedAt: this.clock(),
      }),
    };
  }

  /**
   * Invoke selected domain capabilities when matching payloads + ports exist.
   * Missing payloads or ports → skipped (no fabrication).
   */
  async invokeSelected(
    intent: NutritionIntent,
    contextId: string,
    payloads: NutritionDomainPayloads = {},
  ): Promise<readonly NutritionDomainInvocation[]> {
    const selected = this.selectCapabilities(intent);
    const invocations: NutritionDomainInvocation[] = [];

    for (let index = 0; index < selected.length; index += 1) {
      const capability = selected[index];
      const id = `ndomain:${contextId}:${index}:${capability}`;

      try {
        switch (capability) {
          case NutritionCapabilities.GENERATE_NUTRITION_PLAN: {
            if (!payloads.generatePlanRequest) {
              invocations.push(
                this.skipped(id, capability, "generatePlanRequest"),
              );
              break;
            }
            if (!this.ports.generateNutritionPlan) {
              invocations.push(
                this.skipped(id, capability, "generateNutritionPlanPort"),
              );
              break;
            }
            const result = await this.ports.generateNutritionPlan(
              payloads.generatePlanRequest,
            );
            invocations.push(
              this.invoked(id, capability, result, "GenerateNutritionPlan"),
            );
            break;
          }
          case NutritionCapabilities.ADJUST_MACROS: {
            if (!payloads.adjustMacrosRequest) {
              invocations.push(
                this.skipped(id, capability, "adjustMacrosRequest"),
              );
              break;
            }
            const { invocation } = await this.invokeAdjustMacros(
              payloads.adjustMacrosRequest,
              contextId,
            );
            invocations.push(
              this.freezeInvocation({
                ...invocation,
                id,
              }),
            );
            break;
          }
          case NutritionCapabilities.ANALYZE_NUTRITION: {
            if (!payloads.analyzeRequest) {
              invocations.push(this.skipped(id, capability, "analyzeRequest"));
              break;
            }
            if (!this.ports.analyzeNutrition) {
              invocations.push(
                this.skipped(id, capability, "analyzeNutritionPort"),
              );
              break;
            }
            const result = await this.ports.analyzeNutrition(
              payloads.analyzeRequest,
            );
            invocations.push(
              this.invoked(id, capability, result, "AnalyzeNutrition"),
            );
            break;
          }
          case NutritionCapabilities.MEAL_TIMING: {
            if (!payloads.mealTimingRequest) {
              invocations.push(
                this.skipped(id, capability, "mealTimingRequest"),
              );
              break;
            }
            if (!this.ports.mealTiming) {
              invocations.push(this.skipped(id, capability, "mealTimingPort"));
              break;
            }
            const result = await this.ports.mealTiming(
              payloads.mealTimingRequest,
            );
            invocations.push(
              this.invoked(id, capability, result, "MealTiming"),
            );
            break;
          }
          case NutritionCapabilities.HYDRATION_GUIDANCE: {
            if (!payloads.hydrationRequest) {
              invocations.push(
                this.skipped(id, capability, "hydrationRequest"),
              );
              break;
            }
            if (!this.ports.hydrationGuidance) {
              invocations.push(
                this.skipped(id, capability, "hydrationGuidancePort"),
              );
              break;
            }
            const result = await this.ports.hydrationGuidance(
              payloads.hydrationRequest,
            );
            invocations.push(
              this.invoked(id, capability, result, "HydrationGuidance"),
            );
            break;
          }
          case NutritionCapabilities.SUPPLEMENT_GUIDANCE: {
            if (!payloads.supplementRequest) {
              invocations.push(
                this.skipped(id, capability, "supplementRequest"),
              );
              break;
            }
            if (!this.ports.supplementGuidance) {
              invocations.push(
                this.skipped(id, capability, "supplementGuidancePort"),
              );
              break;
            }
            const result = await this.ports.supplementGuidance(
              payloads.supplementRequest,
            );
            invocations.push(
              this.invoked(id, capability, result, "SupplementGuidance"),
            );
            break;
          }
          default:
            invocations.push(
              this.freezeInvocation({
                id,
                capability,
                status: NutritionDomainInvocationStatuses.SKIPPED,
                summary: "Unknown capability.",
                resultRef: null,
                attributes: Object.freeze({}),
                invokedAt: this.clock(),
              }),
            );
        }
      } catch (error) {
        invocations.push(
          this.freezeInvocation({
            id,
            capability,
            status: NutritionDomainInvocationStatuses.FAILED,
            summary:
              error instanceof Error
                ? error.message
                : "Domain invocation failed.",
            resultRef: null,
            attributes: Object.freeze({}),
            invokedAt: this.clock(),
          }),
        );
      }
    }

    return Object.freeze(invocations);
  }

  private skipped(
    id: string,
    capability: NutritionCapability,
    missing: string,
  ): NutritionDomainInvocation {
    return this.freezeInvocation({
      id,
      capability,
      status: NutritionDomainInvocationStatuses.SKIPPED,
      summary: `Skipped ${capability}; missing ${missing}.`,
      resultRef: null,
      attributes: Object.freeze({ missing }),
      invokedAt: this.clock(),
    });
  }

  private invoked(
    id: string,
    capability: NutritionCapability,
    result: NutritionDomainResultRef,
    label: string,
  ): NutritionDomainInvocation {
    return this.freezeInvocation({
      id,
      capability,
      status: NutritionDomainInvocationStatuses.INVOKED,
      summary: result.summary ?? `${label} invoked.`,
      resultRef: result.id,
      attributes: Object.freeze({ ...result.attributes }),
      invokedAt: this.clock(),
    });
  }

  private freezeInvocation(
    invocation: NutritionDomainInvocation,
  ): NutritionDomainInvocation {
    return Object.freeze({
      ...invocation,
      attributes: Object.freeze({ ...invocation.attributes }),
    });
  }
}

export function createNutritionDomainGateway(
  deps: NutritionDomainGatewayDeps = {},
): NutritionDomainGateway {
  return new NutritionDomainGateway(deps);
}

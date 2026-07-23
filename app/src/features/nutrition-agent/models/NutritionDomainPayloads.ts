/**
 * Opaque Nutrition Domain request / result contracts.
 * Agent never fabricates domain business inputs — callers supply payloads.
 * Domain algorithms live outside this module.
 */

export interface NutritionDomainResultRef {
  readonly id: string;
  readonly summary: string | null;
  readonly attributes: Readonly<Record<string, string>>;
}

export interface NutritionGeneratePlanRequest {
  readonly id: string;
  readonly athleteId: string | null;
  readonly attributes: Readonly<Record<string, string>>;
}

export interface NutritionAdjustMacrosRequest {
  readonly id: string;
  readonly planId: string | null;
  readonly attributes: Readonly<Record<string, string>>;
}

export interface NutritionAnalyzeRequest {
  readonly id: string;
  readonly attributes: Readonly<Record<string, string>>;
}

export interface NutritionMealTimingRequest {
  readonly id: string;
  readonly attributes: Readonly<Record<string, string>>;
}

export interface NutritionHydrationRequest {
  readonly id: string;
  readonly attributes: Readonly<Record<string, string>>;
}

export interface NutritionSupplementRequest {
  readonly id: string;
  readonly attributes: Readonly<Record<string, string>>;
}

/**
 * Optional domain payloads the agent may forward to Nutrition Domain ports.
 */
export interface NutritionDomainPayloads {
  readonly generatePlanRequest?: NutritionGeneratePlanRequest | null;
  readonly adjustMacrosRequest?: NutritionAdjustMacrosRequest | null;
  readonly analyzeRequest?: NutritionAnalyzeRequest | null;
  readonly mealTimingRequest?: NutritionMealTimingRequest | null;
  readonly hydrationRequest?: NutritionHydrationRequest | null;
  readonly supplementRequest?: NutritionSupplementRequest | null;
}

/** Singular alias matching sprint naming. */
export type NutritionDomainPayload = NutritionDomainPayloads;

/**
 * Injectable domain ports — thin delegates to existing / future Nutrition Domain APIs.
 * Defaults are no-ops that leave invocations skipped when payloads are absent.
 */
export interface NutritionDomainPorts {
  readonly generateNutritionPlan?: (
    request: NutritionGeneratePlanRequest,
  ) => Promise<NutritionDomainResultRef>;
  readonly adjustMacros?: (
    request: NutritionAdjustMacrosRequest,
  ) => Promise<NutritionDomainResultRef>;
  readonly analyzeNutrition?: (
    request: NutritionAnalyzeRequest,
  ) => Promise<NutritionDomainResultRef>;
  readonly mealTiming?: (
    request: NutritionMealTimingRequest,
  ) => Promise<NutritionDomainResultRef>;
  readonly hydrationGuidance?: (
    request: NutritionHydrationRequest,
  ) => Promise<NutritionDomainResultRef>;
  readonly supplementGuidance?: (
    request: NutritionSupplementRequest,
  ) => Promise<NutritionDomainResultRef>;
}

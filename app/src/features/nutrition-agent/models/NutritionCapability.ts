/**
 * Nutrition Domain capabilities the agent may orchestrate (no domain logic here).
 * Future capabilities can be appended without changing existing mappings.
 */
export const NutritionCapabilities = Object.freeze({
  GENERATE_NUTRITION_PLAN: "generate_nutrition_plan" as const,
  ADJUST_MACROS: "adjust_macros" as const,
  ANALYZE_NUTRITION: "analyze_nutrition" as const,
  MEAL_TIMING: "meal_timing" as const,
  HYDRATION_GUIDANCE: "hydration_guidance" as const,
  SUPPLEMENT_GUIDANCE: "supplement_guidance" as const,
});

export type NutritionCapability =
  (typeof NutritionCapabilities)[keyof typeof NutritionCapabilities];

export const ALL_NUTRITION_CAPABILITIES: readonly NutritionCapability[] =
  Object.freeze(Object.values(NutritionCapabilities));

/** Alias matching sprint naming for domain capability surface. */
export type NutritionDomainCapability = NutritionCapability;
export const NutritionDomainCapabilities = NutritionCapabilities;
export const ALL_NUTRITION_DOMAIN_CAPABILITIES = ALL_NUTRITION_CAPABILITIES;

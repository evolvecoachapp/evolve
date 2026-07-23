import type { NutritionContext } from "../models/NutritionContext";
import { EMPTY_NUTRITION_AGENT_METADATA } from "../models/NutritionMetadata";
import type { NutritionPlan, NutritionPhaseHint } from "../models/NutritionPlan";
import type { NutritionPlanningContext } from "../models/NutritionPlanningContext";
import type { NutritionPlanningResult } from "../models/NutritionPlanningResult";
import type { NutritionReasoning } from "../models/NutritionReasoning";
import {
  labelFromScore,
  type NutritionConfidence,
} from "../models/NutritionConfidence";
import {
  freezePlanningContext,
  freezePlanningResult,
  freezePlan,
} from "../utils/FreezeNutritionState";
import { buildCalorieTargets } from "../utils/CalorieHelpers";
import { buildMacroTargets } from "../utils/MacroHelpers";
import { buildMealDistribution } from "../utils/MealHelpers";
import { buildHydrationPlan } from "../utils/HydrationHelpers";
import { phaseForGoal } from "../utils/BodyCompositionHelpers";

export interface NutritionPlanner {
  readonly id: string;
  plan(
    context: NutritionContext,
    reasoning: readonly NutritionReasoning[],
    clock: () => string,
  ): NutritionPlanningResult;
}

function signal(
  reasoning: readonly NutritionReasoning[],
  key: string,
  fallback: number,
): number {
  for (const r of reasoning) {
    if (typeof r.signals[key] === "number") return r.signals[key] as number;
  }
  return fallback;
}

function optionalSignal(
  reasoning: readonly NutritionReasoning[],
  key: string,
): number | null {
  for (const r of reasoning) {
    if (typeof r.signals[key] === "number") return r.signals[key] as number;
  }
  return null;
}

function confidenceFrom(score: number, rationale: string): NutritionConfidence {
  return Object.freeze({
    score,
    label: labelFromScore(score),
    rationale,
  });
}

function buildBasePlan(input: {
  readonly planningContext: NutritionPlanningContext;
  readonly context: NutritionContext;
  readonly reasoning: readonly NutritionReasoning[];
  readonly phaseHint: NutritionPhaseHint;
  readonly clock: () => string;
}): NutritionPlan {
  const calorieTargets = buildCalorieTargets({
    bodyWeightKg: input.context.bodyWeightKg,
    activityLevel: input.context.activityLevel,
    goal: input.context.goal,
  });
  const targetCalories =
    input.planningContext.calorieTarget ?? calorieTargets.targetCalories;
  const macroTargets = buildMacroTargets({
    bodyWeightKg: input.context.bodyWeightKg,
    targetCalories,
    goal: input.context.goal,
  });
  const mealsPerDay =
    input.planningContext.mealsPerDay ??
    signal(input.reasoning, "meals_per_day", 3);
  const mealDistribution = buildMealDistribution(mealsPerDay);
  const hydrationPlan = buildHydrationPlan(input.context.bodyWeightKg);
  const creatine = signal(input.reasoning, "creatine_suggested", 0) === 1;
  const supplementPlan = Object.freeze({
    items: Object.freeze(
      creatine
        ? ["creatine_monohydrate", "vitamin_d_if_deficient"]
        : ["vitamin_d_if_deficient"],
    ),
    notes: Object.freeze([
      "Supplements are optional; food-first approach preferred.",
    ]),
  });

  return freezePlan({
    id: `nplan:${input.planningContext.id}`,
    planningContextId: input.planningContext.id,
    goal: input.context.goal,
    strategyId: input.context.strategy?.id ?? null,
    calorieTargets: Object.freeze({
      ...calorieTargets,
      targetCalories,
    }),
    macroTargets,
    mealDistribution,
    hydrationPlan:
      input.planningContext.hydrationLiters != null
        ? Object.freeze({
            litersPerDay: input.planningContext.hydrationLiters,
            notes: hydrationPlan.notes,
          })
        : hydrationPlan,
    supplementPlan,
    phaseHint: input.phaseHint,
    confidence: confidenceFrom(
      Math.min(0.95, 0.55 + (targetCalories > 0 ? 0.25 : 0)),
      "Derived from deterministic calorie/macro heuristics.",
    ),
    rationale: Object.freeze(
      input.reasoning.flatMap((r) => r.findings).slice(0, 8),
    ),
    metadata: EMPTY_NUTRITION_AGENT_METADATA,
    createdAt: input.clock(),
  });
}

export class NutritionPlannerImpl implements NutritionPlanner {
  readonly id = "planner:nutrition";

  plan(
    context: NutritionContext,
    reasoning: readonly NutritionReasoning[],
    clock: () => string,
  ): NutritionPlanningResult {
    const phaseHint = phaseForGoal(context.goal);
    const planningContext = freezePlanningContext({
      id: `npctx:${context.id}`,
      contextId: context.id,
      goal: context.goal,
      strategyId: context.strategy?.id ?? null,
      reasoning,
      calorieTarget: optionalSignal(reasoning, "calorie_target"),
      proteinTargetG: optionalSignal(reasoning, "protein_g"),
      mealsPerDay: optionalSignal(reasoning, "meals_per_day"),
      hydrationLiters: optionalSignal(reasoning, "hydration_liters"),
      phaseHint,
      metadata: EMPTY_NUTRITION_AGENT_METADATA,
      frozenAt: clock(),
    });

    const plan = buildBasePlan({
      planningContext,
      context,
      reasoning,
      phaseHint,
      clock,
    });

    return freezePlanningResult({
      id: `npres:${context.id}:nutrition`,
      planningContext,
      plan,
      plannerIds: Object.freeze([this.id]),
      success: true,
      message: null,
      frozenAt: clock(),
    });
  }
}

function wrapPlanner(
  id: string,
  transform: (
    base: NutritionPlanningResult,
    context: NutritionContext,
    reasoning: readonly NutritionReasoning[],
    clock: () => string,
  ) => NutritionPlanningResult,
): NutritionPlanner {
  return {
    id,
    plan(context, reasoning, clock) {
      const base = new NutritionPlannerImpl().plan(context, reasoning, clock);
      return transform(base, context, reasoning, clock);
    },
  };
}

export const MealPlanner: NutritionPlanner = wrapPlanner(
  "planner:meal",
  (base, context, _reasoning, clock) => {
    const meals = buildMealDistribution(
      base.planningContext.mealsPerDay ?? 4,
    );
    const plan = freezePlan({
      ...base.plan,
      id: `nplan:${base.planningContext.id}:meal`,
      mealDistribution: meals,
      rationale: Object.freeze([
        ...base.plan.rationale,
        `Meal planner: ${meals.mealsPerDay} meals/day.`,
      ]),
    });
    return freezePlanningResult({
      ...base,
      id: `npres:${context.id}:meal`,
      plan,
      plannerIds: Object.freeze(["planner:meal"]),
      frozenAt: clock(),
    });
  },
);

export const MacroPlanner: NutritionPlanner = wrapPlanner(
  "planner:macro",
  (base, context, _reasoning, clock) =>
    freezePlanningResult({
      ...base,
      id: `npres:${context.id}:macro`,
      plannerIds: Object.freeze(["planner:macro"]),
      frozenAt: clock(),
    }),
);

export const CaloriePlanner: NutritionPlanner = wrapPlanner(
  "planner:calorie",
  (base, context, _reasoning, clock) =>
    freezePlanningResult({
      ...base,
      id: `npres:${context.id}:calorie`,
      plannerIds: Object.freeze(["planner:calorie"]),
      frozenAt: clock(),
    }),
);

export const HydrationPlanner: NutritionPlanner = wrapPlanner(
  "planner:hydration",
  (base, context, _reasoning, clock) =>
    freezePlanningResult({
      ...base,
      id: `npres:${context.id}:hydration`,
      plannerIds: Object.freeze(["planner:hydration"]),
      frozenAt: clock(),
    }),
);

export const SupplementPlanner: NutritionPlanner = wrapPlanner(
  "planner:supplement",
  (base, context, _reasoning, clock) =>
    freezePlanningResult({
      ...base,
      id: `npres:${context.id}:supplement`,
      plannerIds: Object.freeze(["planner:supplement"]),
      frozenAt: clock(),
    }),
);

export const DietPhasePlanner: NutritionPlanner = wrapPlanner(
  "planner:diet_phase",
  (base, context, _reasoning, clock) => {
    const plan = freezePlan({
      ...base.plan,
      id: `nplan:${base.planningContext.id}:phase`,
      phaseHint: phaseForGoal(context.goal),
    });
    return freezePlanningResult({
      ...base,
      id: `npres:${context.id}:diet_phase`,
      plan,
      plannerIds: Object.freeze(["planner:diet_phase"]),
      frozenAt: clock(),
    });
  },
);

export const RefeedPlanner: NutritionPlanner = wrapPlanner(
  "planner:refeed",
  (base, context, _reasoning, clock) => {
    const bumped = Math.round(base.plan.calorieTargets.targetCalories * 1.15);
    const plan = freezePlan({
      ...base.plan,
      id: `nplan:${base.planningContext.id}:refeed`,
      phaseHint: "refeed",
      calorieTargets: Object.freeze({
        ...base.plan.calorieTargets,
        targetCalories: bumped,
        deficitOrSurplus: bumped - base.plan.calorieTargets.tdeeEstimate,
      }),
      rationale: Object.freeze([
        ...base.plan.rationale,
        "Refeed planner: temporary calorie bump.",
      ]),
    });
    return freezePlanningResult({
      ...base,
      id: `npres:${context.id}:refeed`,
      plan,
      plannerIds: Object.freeze(["planner:refeed"]),
      frozenAt: clock(),
    });
  },
);

export const ReverseDietPlanner: NutritionPlanner = wrapPlanner(
  "planner:reverse",
  (base, context, _reasoning, clock) => {
    const bumped = Math.round(base.plan.calorieTargets.targetCalories + 100);
    const plan = freezePlan({
      ...base.plan,
      id: `nplan:${base.planningContext.id}:reverse`,
      phaseHint: "reverse",
      calorieTargets: Object.freeze({
        ...base.plan.calorieTargets,
        targetCalories: bumped,
        deficitOrSurplus: bumped - base.plan.calorieTargets.tdeeEstimate,
      }),
    });
    return freezePlanningResult({
      ...base,
      id: `npres:${context.id}:reverse`,
      plan,
      plannerIds: Object.freeze(["planner:reverse"]),
      frozenAt: clock(),
    });
  },
);

export const CutPlanner: NutritionPlanner = wrapPlanner(
  "planner:cut",
  (base, context, _reasoning, clock) => {
    const cut = Math.max(
      1200,
      base.plan.calorieTargets.tdeeEstimate - 500,
    );
    const plan = freezePlan({
      ...base.plan,
      id: `nplan:${base.planningContext.id}:cut`,
      phaseHint: "cut",
      calorieTargets: Object.freeze({
        tdeeEstimate: base.plan.calorieTargets.tdeeEstimate,
        targetCalories: cut,
        deficitOrSurplus: cut - base.plan.calorieTargets.tdeeEstimate,
      }),
      macroTargets: buildMacroTargets({
        bodyWeightKg: context.bodyWeightKg,
        targetCalories: cut,
        goal: context.goal,
      }),
    });
    return freezePlanningResult({
      ...base,
      id: `npres:${context.id}:cut`,
      plan,
      plannerIds: Object.freeze(["planner:cut"]),
      frozenAt: clock(),
    });
  },
);

export const BulkPlanner: NutritionPlanner = wrapPlanner(
  "planner:bulk",
  (base, context, _reasoning, clock) => {
    const bulk = base.plan.calorieTargets.tdeeEstimate + 300;
    const plan = freezePlan({
      ...base.plan,
      id: `nplan:${base.planningContext.id}:bulk`,
      phaseHint: "bulk",
      calorieTargets: Object.freeze({
        tdeeEstimate: base.plan.calorieTargets.tdeeEstimate,
        targetCalories: bulk,
        deficitOrSurplus: 300,
      }),
      macroTargets: buildMacroTargets({
        bodyWeightKg: context.bodyWeightKg,
        targetCalories: bulk,
        goal: context.goal,
      }),
    });
    return freezePlanningResult({
      ...base,
      id: `npres:${context.id}:bulk`,
      plan,
      plannerIds: Object.freeze(["planner:bulk"]),
      frozenAt: clock(),
    });
  },
);

export const MaintenancePlanner: NutritionPlanner = wrapPlanner(
  "planner:maintenance",
  (base, context, _reasoning, clock) => {
    const maintain = base.plan.calorieTargets.tdeeEstimate;
    const plan = freezePlan({
      ...base.plan,
      id: `nplan:${base.planningContext.id}:maintain`,
      phaseHint: "maintain",
      calorieTargets: Object.freeze({
        tdeeEstimate: maintain,
        targetCalories: maintain,
        deficitOrSurplus: 0,
      }),
      macroTargets: buildMacroTargets({
        bodyWeightKg: context.bodyWeightKg,
        targetCalories: maintain,
        goal: context.goal,
      }),
    });
    return freezePlanningResult({
      ...base,
      id: `npres:${context.id}:maintenance`,
      plan,
      plannerIds: Object.freeze(["planner:maintenance"]),
      frozenAt: clock(),
    });
  },
);

export function createDefaultPlanners(): readonly NutritionPlanner[] {
  return Object.freeze([
    new NutritionPlannerImpl(),
    MealPlanner,
    MacroPlanner,
    CaloriePlanner,
    HydrationPlanner,
    SupplementPlanner,
    DietPhasePlanner,
    RefeedPlanner,
    ReverseDietPlanner,
    CutPlanner,
    BulkPlanner,
    MaintenancePlanner,
  ]);
}

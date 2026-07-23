import type { NutritionContext } from "../models/NutritionContext";
import type { NutritionReasoning } from "../models/NutritionReasoning";
import { NutritionReasoningTopics } from "../models/NutritionReasoning";
import { freezeReasoning } from "../utils/FreezeNutritionState";
import { buildCalorieTargets } from "../utils/CalorieHelpers";
import { proteinPerKg } from "../utils/MacroHelpers";
import { phaseForGoal } from "../utils/BodyCompositionHelpers";

export interface NutritionReasoner {
  readonly id: string;
  reason(context: NutritionContext): NutritionReasoning;
}

export class GoalReasoner implements NutritionReasoner {
  readonly id = "reasoner:nutrition:goal";
  reason(context: NutritionContext): NutritionReasoning {
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: NutritionReasoningTopics.GOAL,
      findings: Object.freeze([
        `Primary goal resolved to ${context.goal}.`,
        `Intent: ${context.intent}.`,
      ]),
      signals: Object.freeze({
        goal_known: context.goal === "unknown" ? 0 : 1,
      }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class CalorieReasoner implements NutritionReasoner {
  readonly id = "reasoner:nutrition:calorie";
  reason(context: NutritionContext): NutritionReasoning {
    const targets = buildCalorieTargets({
      bodyWeightKg: context.bodyWeightKg,
      activityLevel: context.activityLevel,
      goal: context.goal,
    });
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: NutritionReasoningTopics.CALORIES,
      findings: Object.freeze([
        `Estimated TDEE ~${targets.tdeeEstimate} kcal.`,
        `Target calories ~${targets.targetCalories} (${targets.deficitOrSurplus >= 0 ? "+" : ""}${targets.deficitOrSurplus}).`,
      ]),
      signals: Object.freeze({
        calorie_target: targets.targetCalories,
        tdee: targets.tdeeEstimate,
        delta: targets.deficitOrSurplus,
      }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class MacroReasoner implements NutritionReasoner {
  readonly id = "reasoner:nutrition:macro";
  reason(context: NutritionContext): NutritionReasoning {
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: NutritionReasoningTopics.MACROS,
      findings: Object.freeze([
        "Distribute macros after protein and fat floors are set.",
      ]),
      signals: Object.freeze({ macro_priority: 1 }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class ProteinReasoner implements NutritionReasoner {
  readonly id = "reasoner:nutrition:protein";
  reason(context: NutritionContext): NutritionReasoning {
    const perKg = proteinPerKg(context.goal);
    const proteinG = Math.round(context.bodyWeightKg * perKg);
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: NutritionReasoningTopics.PROTEIN,
      findings: Object.freeze([
        `Protein target ~${proteinG}g (${perKg} g/kg).`,
      ]),
      signals: Object.freeze({ protein_g: proteinG, protein_per_kg: perKg }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class CarbohydrateReasoner implements NutritionReasoner {
  readonly id = "reasoner:nutrition:carbohydrate";
  reason(context: NutritionContext): NutritionReasoning {
    const performance =
      context.goal === "performance" ||
      context.goal === "powerlifting" ||
      context.goal === "hypertrophy"
        ? 1
        : 0;
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: NutritionReasoningTopics.CARBOHYDRATE,
      findings: Object.freeze([
        performance
          ? "Prioritize carbs around training for performance."
          : "Fill remaining calories with carbohydrates after protein/fat.",
      ]),
      signals: Object.freeze({ carb_priority: performance }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class FatReasoner implements NutritionReasoner {
  readonly id = "reasoner:nutrition:fat";
  reason(context: NutritionContext): NutritionReasoning {
    const fatFloor = Math.round(context.bodyWeightKg * 0.6);
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: NutritionReasoningTopics.FAT,
      findings: Object.freeze([`Keep dietary fat at least ~${fatFloor}g.`]),
      signals: Object.freeze({ fat_floor_g: fatFloor }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class FiberReasoner implements NutritionReasoner {
  readonly id = "reasoner:nutrition:fiber";
  reason(context: NutritionContext): NutritionReasoning {
    const fiber = context.goal === "fat_loss" ? 30 : 25;
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: NutritionReasoningTopics.FIBER,
      findings: Object.freeze([`Aim for ~${fiber}g fiber daily.`]),
      signals: Object.freeze({ fiber_g: fiber }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class MealTimingReasoner implements NutritionReasoner {
  readonly id = "reasoner:nutrition:meal_timing";
  reason(context: NutritionContext): NutritionReasoning {
    const meals =
      context.preferences.mealsPerDayPreference ??
      (context.intent === "meal_timing" ? 4 : 3);
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: NutritionReasoningTopics.MEAL_TIMING,
      findings: Object.freeze([`Distribute intake across ~${meals} meals.`]),
      signals: Object.freeze({ meals_per_day: meals }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class BodyCompositionReasoner implements NutritionReasoner {
  readonly id = "reasoner:nutrition:body_composition";
  reason(context: NutritionContext): NutritionReasoning {
    const phase = phaseForGoal(context.goal);
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: NutritionReasoningTopics.BODY_COMPOSITION,
      findings: Object.freeze([`Phase hint: ${phase}.`]),
      signals: Object.freeze({
        phase_code:
          phase === "cut"
            ? 1
            : phase === "bulk"
              ? 2
              : phase === "contest"
                ? 3
                : 0,
      }),
      notes: Object.freeze([phase]),
    });
  }
}

export class EnergyBalanceReasoner implements NutritionReasoner {
  readonly id = "reasoner:nutrition:energy_balance";
  reason(context: NutritionContext): NutritionReasoning {
    const targets = buildCalorieTargets({
      bodyWeightKg: context.bodyWeightKg,
      activityLevel: context.activityLevel,
      goal: context.goal,
    });
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: NutritionReasoningTopics.ENERGY_BALANCE,
      findings: Object.freeze([
        targets.deficitOrSurplus < 0
          ? "Energy balance tilted toward deficit."
          : targets.deficitOrSurplus > 0
            ? "Energy balance tilted toward surplus."
            : "Energy balance near maintenance.",
      ]),
      signals: Object.freeze({ energy_delta: targets.deficitOrSurplus }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class HydrationReasoner implements NutritionReasoner {
  readonly id = "reasoner:nutrition:hydration";
  reason(context: NutritionContext): NutritionReasoning {
    const liters =
      Math.round(Math.max(2, context.bodyWeightKg * 0.035) * 10) / 10;
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: NutritionReasoningTopics.HYDRATION,
      findings: Object.freeze([`Hydration target ~${liters} L/day.`]),
      signals: Object.freeze({ hydration_liters: liters }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class SupplementReasoner implements NutritionReasoner {
  readonly id = "reasoner:nutrition:supplement";
  reason(context: NutritionContext): NutritionReasoning {
    const creatine =
      context.goal === "muscle_gain" ||
      context.goal === "hypertrophy" ||
      context.goal === "powerlifting" ||
      context.goal === "performance"
        ? 1
        : 0;
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: NutritionReasoningTopics.SUPPLEMENTS,
      findings: Object.freeze([
        creatine
          ? "Creatine monohydrate is a reasonable evidence-based option."
          : "Focus on food first; supplements optional.",
      ]),
      signals: Object.freeze({ creatine_suggested: creatine }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class AdherenceReasoner implements NutritionReasoner {
  readonly id = "reasoner:nutrition:adherence";
  reason(context: NutritionContext): NutritionReasoning {
    const complexity =
      context.preferences.avoidedFoods.length +
      context.constraints.allergies.length;
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: NutritionReasoningTopics.ADHERENCE,
      findings: Object.freeze([
        complexity > 2
          ? "Simplify meal structure to protect adherence."
          : "Adherence risk appears manageable.",
      ]),
      signals: Object.freeze({ complexity }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export class EducationReasoner implements NutritionReasoner {
  readonly id = "reasoner:nutrition:education";
  reason(context: NutritionContext): NutritionReasoning {
    return freezeReasoning({
      id: `${this.id}:${context.id}`,
      topic: NutritionReasoningTopics.EDUCATION,
      findings: Object.freeze([
        context.intent === "education"
          ? "Prioritize clear educational framing in recommendations."
          : "Include brief rationale for calorie and macro choices.",
      ]),
      signals: Object.freeze({
        education_focus: context.intent === "education" ? 1 : 0,
      }),
      notes: Object.freeze([] as string[]),
    });
  }
}

export function createDefaultReasoners(): readonly NutritionReasoner[] {
  return Object.freeze([
    new GoalReasoner(),
    new CalorieReasoner(),
    new MacroReasoner(),
    new ProteinReasoner(),
    new CarbohydrateReasoner(),
    new FatReasoner(),
    new FiberReasoner(),
    new MealTimingReasoner(),
    new BodyCompositionReasoner(),
    new EnergyBalanceReasoner(),
    new HydrationReasoner(),
    new SupplementReasoner(),
    new AdherenceReasoner(),
    new EducationReasoner(),
  ]);
}

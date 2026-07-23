import type { NutritionContext } from "../models/NutritionContext";
import type { MacroTargets } from "../models/MacroTargets";
import { MacroSelector } from "../selectors/MacroSelector";

export class MacroPlanBuilder {
  constructor(private readonly macroSelector = new MacroSelector()) {}

  build(context: NutritionContext): MacroTargets {
    return this.macroSelector.select(context);
  }
}

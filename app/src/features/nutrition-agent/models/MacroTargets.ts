/**
 * Immutable daily macro targets (agent planning surface).
 * Domain MacroTargets remain the source of truth for persisted nutrition.
 */
export interface MacroTargets {
  readonly calories: number;
  readonly proteinG: number;
  readonly carbsG: number;
  readonly fatG: number;
  readonly fiberG: number;
}

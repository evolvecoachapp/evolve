import type { ActionType } from "../../action-engine/models/ActionType";
import { DomainToolIds } from "../../domain-tools/models/DomainToolIds";

/**
 * Deterministic ActionType → Domain Tool Id mapping.
 * Orchestration metadata only — no domain logic.
 */
export const DEFAULT_ACTION_TOOL_MAP: Readonly<
  Partial<Record<ActionType, string>>
> = Object.freeze({
  workout: DomainToolIds.WORKOUT_GENERATE,
  recovery: DomainToolIds.RECOVERY_ANALYZE,
  coach: DomainToolIds.COACH_PREPARE_CONTEXT,
  progress: DomainToolIds.ATHLETE_SUMMARIZE_HISTORY,
});

/**
 * Resolve ActionSteps into tool ids. No execution.
 */
export class ActionResolver {
  readonly id = "resolver:action:default";

  constructor(
    private readonly actionToolMap: Readonly<
      Partial<Record<ActionType, string>>
    > = DEFAULT_ACTION_TOOL_MAP,
  ) {}

  resolveToolId(actionType: ActionType, explicitToolId?: string | null): string | null {
    if (explicitToolId) return explicitToolId;
    return this.actionToolMap[actionType] ?? null;
  }

  canResolve(actionType: ActionType): boolean {
    return this.actionToolMap[actionType] != null;
  }
}

import type { CoachResponse } from "../../response-formatter/models/CoachResponse";
import type { ActionStep } from "../models/ActionStep";

/**
 * Planner contract — produce ActionSteps only. No execution.
 */
export interface ActionPlanner {
  readonly id: string;
  plan(response: CoachResponse, planId: string): readonly ActionStep[];
}

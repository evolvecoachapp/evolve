import { buildDecisionDescriptor } from "../builders/DecisionDescriptorBuilder";
import type { DecisionDescriptor } from "../models/DecisionDescriptor";
import type { DecisionInput } from "../models/DecisionInput";
import type { DecisionResult } from "../models/DecisionResult";
import {
  createDecisionCoordinator,
  type DecisionCoordinator,
  type DecisionCoordinatorDeps,
} from "./DecisionCoordinator";

export type DecisionEngineDeps = DecisionCoordinatorDeps;

/**
 * Decision Engine — deterministic decision orchestration only.
 *
 * UnifiedCoachingContext → CoachingDecision / DecisionPackage
 *
 * No AI. No NL. No domain calculations. No action execution.
 * No OpenAI SDK. No Prompt Builder. No Tool Runtime. No networking. No persistence.
 */
export class DecisionEngine {
  private readonly coordinator: DecisionCoordinator;
  private readonly clock: () => string;
  private readonly runtimeId: string;

  constructor(deps: DecisionEngineDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:decision-engine";
    this.coordinator = createDecisionCoordinator({
      ...deps,
      clock: this.clock,
      runtimeId: this.runtimeId,
    });
  }

  describe(): DecisionDescriptor {
    return buildDecisionDescriptor({
      id: this.runtimeId,
      createdAt: this.clock(),
    });
  }

  buildDecision(input: DecisionInput): DecisionResult {
    return this.coordinator.build(input);
  }

  evaluateDecision(input: DecisionInput): DecisionResult {
    return this.coordinator.evaluate(input);
  }

  resolveDecision(input: DecisionInput): DecisionResult {
    return this.coordinator.resolve(input);
  }

  validateDecision(input: DecisionInput): DecisionResult {
    return this.coordinator.validate(input);
  }

  describeDecision(): DecisionResult {
    return this.coordinator.describe();
  }

  getCoordinator(): DecisionCoordinator {
    return this.coordinator;
  }
}

export function createDecisionEngine(
  deps: DecisionEngineDeps = {},
): DecisionEngine {
  return new DecisionEngine(deps);
}

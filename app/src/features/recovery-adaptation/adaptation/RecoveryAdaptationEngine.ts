import { buildRecoveryDescriptor } from "../builders/DescriptorBuilder";
import type { RecoveryDescriptor } from "../models/RecoveryDescriptor";
import type { RecoveryAdaptationInput } from "../models/RecoveryAdaptationInput";
import type { RecoveryResult } from "../models/RecoveryResult";
import {
  createRecoveryAdaptationCoordinator,
  type RecoveryAdaptationCoordinator,
  type RecoveryAdaptationCoordinatorDeps,
} from "./RecoveryAdaptationCoordinator";

export type RecoveryAdaptationEngineDeps = RecoveryAdaptationCoordinatorDeps;

/**
 * Recovery Adaptation Engine — adapts existing recovery plans only.
 * Does NOT generate recovery from scratch. No AI. No networking. No persistence.
 */
export class RecoveryAdaptationEngine {
  private readonly coordinator: RecoveryAdaptationCoordinator;
  private readonly runtimeId: string;
  private readonly clock: () => string;

  constructor(deps: RecoveryAdaptationEngineDeps = {}) {
    this.coordinator = createRecoveryAdaptationCoordinator(deps);
    this.runtimeId = deps.runtimeId ?? "runtime:recovery-adaptation";
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  adaptRecovery(input: RecoveryAdaptationInput): RecoveryResult {
    return this.coordinator.adapt(input);
  }

  compareRecovery(input: RecoveryAdaptationInput): RecoveryResult {
    return this.coordinator.compare(input);
  }

  describeRecoveryAdaptation(): RecoveryDescriptor {
    const result = this.coordinator.describe();
    return (
      result.descriptor ??
      buildRecoveryDescriptor({ id: this.runtimeId, createdAt: this.clock() })
    );
  }

  createRecoverySnapshot(input: RecoveryAdaptationInput): RecoveryResult {
    return this.coordinator.snapshot(input);
  }

  validateRecoveryAdaptation(input: RecoveryAdaptationInput): RecoveryResult {
    return this.coordinator.validate(input);
  }
}

export function createRecoveryAdaptationEngine(
  deps: RecoveryAdaptationEngineDeps = {},
): RecoveryAdaptationEngine {
  return new RecoveryAdaptationEngine(deps);
}

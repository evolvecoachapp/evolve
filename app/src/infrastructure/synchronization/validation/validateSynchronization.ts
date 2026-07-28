import type { SynchronizationEngine } from "../engine/SynchronizationEngine";
import type { SynchronizationRegistry } from "../registry/SynchronizationRegistry";
import {
  createSynchronizationValidation,
  type SynchronizationValidation,
} from "../models/SynchronizationResult";
import { SYNCHRONIZATION_PROVIDER_TOKENS } from "../registry/SynchronizationProviderToken";
import { SynchronizationValidator } from "../engine/SynchronizationValidator";

/**
 * Validate synchronization adapter wiring:
 * duplicate operations, invalid queue, invalid state,
 * missing metadata, invalid transitions, missing provider.
 */
export function validateSynchronizationBundle(input: {
  readonly registry?: SynchronizationRegistry | null;
  readonly engine?: SynchronizationEngine | null;
}): SynchronizationValidation {
  const errors: string[] = [];
  const validator = new SynchronizationValidator();

  if (!input.registry) {
    errors.push("Missing provider");
  } else {
    const registryValidation = input.registry.validate();
    errors.push(...registryValidation.errors);
  }

  if (!input.engine) {
    errors.push("Missing provider");
  } else {
    if (input.engine.adapterId !== "synchronization") {
      errors.push("Contract compliance failure: synchronization");
    }

    const requiredMethods = [
      "push",
      "pull",
      "getStatus",
      "getQueue",
      "getState",
      "getStatistics",
      "enqueue",
      "dequeue",
      "peek",
      "markCompleted",
      "markFailed",
      "cancel",
      "clear",
      "retry",
      "validate",
    ] as const;

    for (const method of requiredMethods) {
      if (typeof input.engine[method] !== "function") {
        errors.push(`Provider compatibility failure: ${method} missing`);
      }
    }

    if (input.registry) {
      for (const token of SYNCHRONIZATION_PROVIDER_TOKENS) {
        if (!input.registry.has(token)) {
          errors.push(`Missing provider: ${token}`);
        }
      }
      if (
        input.engine.providerId &&
        !input.registry.has(input.engine.providerId)
      ) {
        errors.push(`Missing provider: ${input.engine.providerId}`);
      }
    }

    const queueResult = input.engine.getQueue();
    if (queueResult.value) {
      const queueValidation = validator.validateQueue(queueResult.value);
      errors.push(...queueValidation.errors);
    }

    const stateResult = input.engine.getState();
    if (stateResult.value) {
      const stateValidation = validator.validateState(stateResult.value);
      errors.push(...stateValidation.errors);
    }

    const engineValidation = input.engine.validate();
    errors.push(...engineValidation.errors);
  }

  return createSynchronizationValidation(errors);
}

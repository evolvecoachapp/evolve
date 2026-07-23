import type { CapabilityDescriptor } from "../models/CapabilityDescriptor";
import type { CapabilityId } from "../models/CapabilityId";
import type { CapabilityMetadata } from "../models/CapabilityMetadata";
import type { CapabilityRegistration } from "../models/CapabilityRegistration";
import type { CapabilityResult } from "../models/CapabilityResult";
import { CapabilityOperationKinds } from "../models/CapabilityResult";
import { CapabilityEventTypes } from "../models/CapabilityEvent";
import { EMPTY_CAPABILITY_METADATA } from "../models/CapabilityMetadata";
import { buildCapabilityRegistration } from "../builders/CapabilityRegistrationBuilder";
import { buildCapabilityResult } from "../builders/CapabilityResultBuilder";
import { createCapabilityError } from "../models/CapabilityError";
import { validateRegistration } from "../validators/validateRegistration";
import { validateDuplicates } from "../validators/validateDuplicates";
import type { CapabilityRegistryStore } from "../registry/CapabilityRegistryStore";
import { freezeEvent } from "../utils/FreezeCapabilityState";

export interface CapabilityRegistrationInput {
  readonly id?: string;
  readonly capabilityId: CapabilityId;
  readonly agentId: string;
  readonly descriptor?: CapabilityDescriptor;
  readonly name?: string;
  readonly description?: string;
  readonly category?: string;
  readonly supportedOperations?: readonly string[];
  readonly enabled?: boolean;
  readonly metadata?: CapabilityMetadata;
  readonly registeredAt?: string;
}

export interface CapabilityRegistrarDeps {
  readonly store: CapabilityRegistryStore;
  readonly clock?: () => string;
}

/**
 * Capability registration service — creates immutable registrations.
 * Registration is immutable after creation.
 */
export class CapabilityRegistrar {
  private readonly store: CapabilityRegistryStore;
  private readonly clock: () => string;
  private sequence = 0;

  constructor(deps: CapabilityRegistrarDeps) {
    this.store = deps.store;
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  createRegistration(
    input: CapabilityRegistrationInput,
  ): CapabilityRegistration {
    const now = input.registeredAt ?? this.clock();
    this.sequence += 1;
    return buildCapabilityRegistration({
      id: input.id ?? `registration:${input.capabilityId}:${this.sequence}`,
      capabilityId: input.capabilityId,
      agentId: input.agentId,
      descriptor: input.descriptor,
      name: input.name,
      description: input.description,
      category: input.category,
      supportedOperations: input.supportedOperations,
      enabled: input.enabled,
      metadata: input.metadata,
      registeredAt: now,
    });
  }

  register(input: CapabilityRegistrationInput): CapabilityResult {
    const startedAt = this.clock();
    const registration = this.createRegistration(input);
    const validation = validateRegistration(registration);
    if (!validation.valid) {
      return buildCapabilityResult({
        id: `result:register:${registration.id}`,
        operation: CapabilityOperationKinds.REGISTER,
        success: false,
        message: "Registration validation failed.",
        registration,
        validation,
        error: createCapabilityError({
          code: "registration_invalid",
          message: "Registration validation failed.",
          capabilityId: registration.capabilityId,
          agentId: registration.agentId,
          occurredAt: startedAt,
        }),
        events: [
          freezeEvent({
            id: `event:rejected:${registration.id}`,
            type: CapabilityEventTypes.REJECTED,
            capabilityId: registration.capabilityId,
            agentId: registration.agentId,
            message: "Registration validation failed.",
            metadata: EMPTY_CAPABILITY_METADATA,
            occurredAt: startedAt,
          }),
        ],
        startedAt,
        completedAt: startedAt,
      });
    }

    const duplicateCheck = validateDuplicates(this.store.list(), registration);
    if (!duplicateCheck.valid) {
      return buildCapabilityResult({
        id: `result:register:${registration.id}`,
        operation: CapabilityOperationKinds.REGISTER,
        success: false,
        message: "Duplicate capability registration rejected.",
        registration,
        validation: duplicateCheck,
        error: createCapabilityError({
          code: "duplicate_capability",
          message: "Duplicate capability registration rejected.",
          capabilityId: registration.capabilityId,
          agentId: registration.agentId,
          occurredAt: startedAt,
        }),
        events: [
          freezeEvent({
            id: `event:rejected:${registration.id}`,
            type: CapabilityEventTypes.REJECTED,
            capabilityId: registration.capabilityId,
            agentId: registration.agentId,
            message: "Duplicate capability registration rejected.",
            metadata: EMPTY_CAPABILITY_METADATA,
            occurredAt: startedAt,
          }),
        ],
        startedAt,
        completedAt: startedAt,
      });
    }

    const outcome = this.store.register(registration);
    const completedAt = this.clock();
    if (!outcome.accepted || !outcome.registration) {
      return buildCapabilityResult({
        id: `result:register:${registration.id}`,
        operation: CapabilityOperationKinds.REGISTER,
        success: false,
        message: outcome.reason ?? "Registration rejected by policy.",
        registration,
        validation: duplicateCheck,
        error: createCapabilityError({
          code: "registration_rejected",
          message: outcome.reason ?? "Registration rejected by policy.",
          capabilityId: registration.capabilityId,
          agentId: registration.agentId,
          occurredAt: completedAt,
        }),
        startedAt,
        completedAt,
      });
    }

    return buildCapabilityResult({
      id: `result:register:${outcome.registration.id}`,
      operation: CapabilityOperationKinds.REGISTER,
      success: true,
      message: "Capability registered.",
      registration: outcome.registration,
      ownerAgentId: outcome.registration.agentId,
      validation: Object.freeze({ valid: true, issues: Object.freeze([]) }),
      events: [
        freezeEvent({
          id: `event:registered:${outcome.registration.id}`,
          type: CapabilityEventTypes.REGISTERED,
          capabilityId: outcome.registration.capabilityId,
          agentId: outcome.registration.agentId,
          message: "Capability registered.",
          metadata: EMPTY_CAPABILITY_METADATA,
          occurredAt: completedAt,
        }),
      ],
      startedAt,
      completedAt,
    });
  }
}

export function createCapabilityRegistrar(
  deps: CapabilityRegistrarDeps,
): CapabilityRegistrar {
  return new CapabilityRegistrar(deps);
}

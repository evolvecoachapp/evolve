import type { CapabilityId } from "../models/CapabilityId";
import type { CapabilityRegistration } from "../models/CapabilityRegistration";
import type { CapabilityRegistry } from "../models/CapabilityRegistry";
import { buildCapabilityRegistry } from "../builders/CapabilityRegistryBuilder";
import {
  createDuplicateHandlingPolicy,
  type DuplicateHandlingPolicy,
} from "../policies/DuplicateHandlingPolicy";
import { freezeRegistration } from "../utils/FreezeCapabilityState";
import {
  sortIdsDeterministic,
  sortRegistrationsDeterministic,
} from "../utils/sortHelpers";

export interface CapabilityRegistryStoreDeps {
  readonly registryId?: string;
  readonly clock?: () => string;
  readonly duplicatePolicy?: DuplicateHandlingPolicy;
}

/**
 * Deterministic in-memory capability registry store.
 * Never executes agents. Registration / lookup / query / snapshots only.
 */
export class CapabilityRegistryStore {
  private readonly registryId: string;
  private readonly clock: () => string;
  private readonly duplicatePolicy: DuplicateHandlingPolicy;
  private readonly byCapabilityId = new Map<string, CapabilityRegistration>();
  private readonly createdAt: string;

  constructor(deps: CapabilityRegistryStoreDeps = {}) {
    this.registryId = deps.registryId ?? "registry:capability:default";
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.duplicatePolicy =
      deps.duplicatePolicy ?? createDuplicateHandlingPolicy();
    this.createdAt = this.clock();
  }

  getRegistryId(): string {
    return this.registryId;
  }

  list(): readonly CapabilityRegistration[] {
    return sortRegistrationsDeterministic([
      ...this.byCapabilityId.values(),
    ]);
  }

  has(capabilityId: CapabilityId): boolean {
    return this.byCapabilityId.has(capabilityId);
  }

  lookup(capabilityId: CapabilityId): CapabilityRegistration | null {
    const found = this.byCapabilityId.get(capabilityId);
    return found ? freezeRegistration(found) : null;
  }

  findByAgent(agentId: string): readonly CapabilityRegistration[] {
    return sortRegistrationsDeterministic(
      [...this.byCapabilityId.values()].filter(
        (item) => item.agentId === agentId,
      ),
    );
  }

  register(registration: CapabilityRegistration): {
    readonly accepted: boolean;
    readonly registration: CapabilityRegistration | null;
    readonly reason: string | null;
  } {
    const existing = this.list();
    const outcome = this.duplicatePolicy.apply(existing, registration);
    if (!outcome.accepted) {
      return Object.freeze({
        accepted: false,
        registration: null,
        reason: outcome.reason,
      });
    }

    const frozen = freezeRegistration(registration);
    this.byCapabilityId.set(frozen.capabilityId, frozen);
    return Object.freeze({
      accepted: true,
      registration: frozen,
      reason: null,
    });
  }

  /**
   * Force-replace for test / rebuild scenarios — still returns immutable copy.
   */
  replaceAll(registrations: readonly CapabilityRegistration[]): void {
    this.byCapabilityId.clear();
    for (const registration of sortRegistrationsDeterministic(registrations)) {
      this.byCapabilityId.set(
        registration.capabilityId,
        freezeRegistration(registration),
      );
    }
  }

  toRegistry(): CapabilityRegistry {
    const now = this.clock();
    return buildCapabilityRegistry({
      id: this.registryId,
      registrations: this.list(),
      createdAt: this.createdAt,
      frozenAt: now,
    });
  }

  capabilityIds(): readonly string[] {
    return sortIdsDeterministic([...this.byCapabilityId.keys()]);
  }

  agentIds(): readonly string[] {
    return sortIdsDeterministic([
      ...new Set([...this.byCapabilityId.values()].map((item) => item.agentId)),
    ]);
  }

  size(): number {
    return this.byCapabilityId.size;
  }
}

export function createCapabilityRegistryStore(
  deps: CapabilityRegistryStoreDeps = {},
): CapabilityRegistryStore {
  return new CapabilityRegistryStore(deps);
}

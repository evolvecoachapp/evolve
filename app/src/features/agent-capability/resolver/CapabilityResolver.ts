import type { CapabilityId } from "../models/CapabilityId";
import type { CapabilityMatch } from "../models/CapabilityMatch";
import type { CapabilityResolution } from "../models/CapabilityResolution";
import type { CapabilityRegistration } from "../models/CapabilityRegistration";
import { buildCapabilityResolution } from "../builders/CapabilityResolutionBuilder";
import { validateCapabilityId } from "../validators/validateCapabilityId";
import { validateRegistration } from "../validators/validateRegistration";
import { CapabilityValidationCodes } from "../models/CapabilityValidation";
import { freezeMatch } from "../utils/FreezeCapabilityState";
import { sortMatchesDeterministic } from "../utils/sortHelpers";
import type { CapabilityRegistryStore } from "../registry/CapabilityRegistryStore";

export interface CapabilityResolverDeps {
  readonly store: CapabilityRegistryStore;
  readonly clock?: () => string;
  readonly resolutionIdPrefix?: string;
}

/**
 * Deterministic capability resolver — exact match only.
 * No scoring. No ranking. No heuristics. No AI.
 */
export class CapabilityResolver {
  private readonly store: CapabilityRegistryStore;
  private readonly clock: () => string;
  private readonly resolutionIdPrefix: string;
  private sequence = 0;

  constructor(deps: CapabilityResolverDeps) {
    this.store = deps.store;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.resolutionIdPrefix = deps.resolutionIdPrefix ?? "resolution";
  }

  resolve(capabilityId: CapabilityId): CapabilityResolution {
    const now = this.clock();
    const idValidation = validateCapabilityId(capabilityId);
    if (!idValidation.valid) {
      return buildCapabilityResolution({
        id: this.nextId(),
        requestedCapabilityId: capabilityId ?? "",
        matches: [],
        validation: idValidation,
        resolvedAt: now,
      });
    }

    const registration = this.store.lookup(capabilityId);
    if (!registration) {
      return buildCapabilityResolution({
        id: this.nextId(),
        requestedCapabilityId: capabilityId,
        matches: [],
        validation: Object.freeze({
          valid: false,
          issues: Object.freeze([
            Object.freeze({
              code: CapabilityValidationCodes.NOT_FOUND,
              message: `Capability not found: ${capabilityId}`,
              path: "capabilityId",
            }),
          ]),
        }),
        resolvedAt: now,
      });
    }

    const registrationValidation = validateRegistration(registration);
    if (!registrationValidation.valid) {
      return buildCapabilityResolution({
        id: this.nextId(),
        requestedCapabilityId: capabilityId,
        matches: [],
        validation: registrationValidation,
        resolvedAt: now,
      });
    }

    if (!registration.enabled) {
      return buildCapabilityResolution({
        id: this.nextId(),
        requestedCapabilityId: capabilityId,
        matches: [],
        validation: Object.freeze({
          valid: false,
          issues: Object.freeze([
            Object.freeze({
              code: CapabilityValidationCodes.DISABLED,
              message: `Capability is disabled: ${capabilityId}`,
              path: "registration.enabled",
            }),
          ]),
        }),
        resolvedAt: now,
      });
    }

    const match = this.toMatch(registration);
    return buildCapabilityResolution({
      id: this.nextId(),
      requestedCapabilityId: capabilityId,
      matches: [match],
      validation: Object.freeze({ valid: true, issues: Object.freeze([]) }),
      resolvedAt: now,
    });
  }

  resolveMany(
    capabilityIds: readonly CapabilityId[],
  ): readonly CapabilityResolution[] {
    return Object.freeze(capabilityIds.map((id) => this.resolve(id)));
  }

  /**
   * Validate registrations against store without executing agents.
   */
  validateRegistrations(
    registrations: readonly CapabilityRegistration[],
  ): readonly CapabilityMatch[] {
    const matches: CapabilityMatch[] = [];
    for (const registration of registrations) {
      const validation = validateRegistration(registration);
      if (!validation.valid) continue;
      if (!registration.enabled) continue;
      matches.push(this.toMatch(registration));
    }
    return sortMatchesDeterministic(matches);
  }

  private toMatch(registration: CapabilityRegistration): CapabilityMatch {
    return freezeMatch({
      capabilityId: registration.capabilityId,
      agentId: registration.agentId,
      registration,
      exact: true,
    });
  }

  private nextId(): string {
    this.sequence += 1;
    return `${this.resolutionIdPrefix}:${this.sequence}`;
  }
}

export function createCapabilityResolver(
  deps: CapabilityResolverDeps,
): CapabilityResolver {
  return new CapabilityResolver(deps);
}

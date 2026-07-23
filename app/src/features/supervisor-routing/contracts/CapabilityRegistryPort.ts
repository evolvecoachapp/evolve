/**
 * Minimal Capability Registry port consumed by Supervisor Routing.
 *
 * Exact deterministic lookup only — no ranking, scoring, or AI.
 * Adapts `features/agent-capability` without exposing registry internals.
 */
export interface CapabilityOwnerRecord {
  readonly capabilityId: string;
  readonly agentId: string;
  readonly enabled: boolean;
  readonly name: string | null;
}

export interface CapabilityRegistryPort {
  readonly registryId: string;
  lookup(capabilityId: string): CapabilityOwnerRecord | null;
  has(capabilityId: string): boolean;
  listEnabled(): readonly CapabilityOwnerRecord[];
}

/**
 * In-memory mock Capability Registry for tests and local wiring.
 */
export class MockCapabilityRegistry implements CapabilityRegistryPort {
  readonly registryId: string;
  private readonly byId = new Map<string, CapabilityOwnerRecord>();

  constructor(
    registryId = "registry:capability:mock",
    records: readonly CapabilityOwnerRecord[] = [],
  ) {
    this.registryId = registryId;
    for (const record of records) {
      this.byId.set(record.capabilityId, Object.freeze({ ...record }));
    }
  }

  register(record: CapabilityOwnerRecord): void {
    this.byId.set(
      record.capabilityId,
      Object.freeze({
        capabilityId: record.capabilityId,
        agentId: record.agentId,
        enabled: record.enabled,
        name: record.name,
      }),
    );
  }

  lookup(capabilityId: string): CapabilityOwnerRecord | null {
    const found = this.byId.get(capabilityId);
    return found ? Object.freeze({ ...found }) : null;
  }

  has(capabilityId: string): boolean {
    return this.byId.has(capabilityId);
  }

  listEnabled(): readonly CapabilityOwnerRecord[] {
    return Object.freeze(
      [...this.byId.values()]
        .filter((item) => item.enabled)
        .sort((a, b) => a.capabilityId.localeCompare(b.capabilityId)),
    );
  }
}

/**
 * Adapt an Agent Capability store-like object to the routing port.
 */
export function createCapabilityRegistryPortFromStore(store: {
  getRegistryId(): string;
  lookup(capabilityId: string): {
    capabilityId: string;
    agentId: string;
    enabled: boolean;
    name?: string;
  } | null;
  list(): readonly {
    capabilityId: string;
    agentId: string;
    enabled: boolean;
    name?: string;
  }[];
}): CapabilityRegistryPort {
  return Object.freeze({
    registryId: store.getRegistryId(),
    lookup(capabilityId: string) {
      const found = store.lookup(capabilityId);
      if (!found) return null;
      return Object.freeze({
        capabilityId: found.capabilityId,
        agentId: found.agentId,
        enabled: found.enabled,
        name: found.name ?? null,
      });
    },
    has(capabilityId: string) {
      return store.lookup(capabilityId) !== null;
    },
    listEnabled() {
      return Object.freeze(
        store
          .list()
          .filter((item) => item.enabled)
          .map((item) =>
            Object.freeze({
              capabilityId: item.capabilityId,
              agentId: item.agentId,
              enabled: item.enabled,
              name: item.name ?? null,
            }),
          )
          .sort((a, b) => a.capabilityId.localeCompare(b.capabilityId)),
      );
    },
  });
}

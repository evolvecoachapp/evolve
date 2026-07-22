import type { ProgrammingResult } from "../models/ProgrammingResult";
import { freezeProgrammingResult } from "../utils/freezeProgrammingResult";
import type { ProgrammingRepository } from "./ProgrammingRepository";

/**
 * In-memory cache of programming results for the current process.
 * Temporary immutable cache only — no persistence.
 */
export class InMemoryProgrammingRepository implements ProgrammingRepository {
  private readonly store = new Map<string, ProgrammingResult>();

  async save(result: ProgrammingResult): Promise<ProgrammingResult> {
    const frozen = freezeProgrammingResult(result);
    this.store.set(frozen.requestId, frozen);
    return frozen;
  }

  async load(requestId: string): Promise<ProgrammingResult | null> {
    return this.store.get(requestId) ?? null;
  }

  async list(): Promise<readonly ProgrammingResult[]> {
    return Object.freeze(
      [...this.store.values()].sort((left, right) =>
        left.requestId.localeCompare(right.requestId),
      ),
    );
  }

  async delete(requestId: string): Promise<boolean> {
    return this.store.delete(requestId);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

export const programmingRepository = new InMemoryProgrammingRepository();

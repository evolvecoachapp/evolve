import type { SynchronizationState } from "../models/SynchronizationState";
import {
  createSynchronizationCheckpoint,
  type SynchronizationCheckpoint,
} from "../models/SynchronizationCheckpoint";
import {
  createSynchronizationStatistics,
  type SynchronizationStatistics,
} from "../models/SynchronizationStatistics";
import type { SynchronizationConflict } from "../models/SynchronizationConflict";
import type { SynchronizationPolicy } from "../models/SynchronizationPolicy";
import { createSynchronizationPolicy } from "../models/SynchronizationPolicy";
import { canTransitionSynchronizationState } from "../state/SynchronizationLifecycle";

/**
 * Deterministic in-memory synchronization state holder.
 * Replaces whole immutable snapshots — no timers, no background workers.
 */
export class SynchronizationStateManager {
  private state: SynchronizationState = "idle";
  private checkpoint: SynchronizationCheckpoint | null = null;
  private statistics: SynchronizationStatistics =
    createSynchronizationStatistics();
  private policy: SynchronizationPolicy = createSynchronizationPolicy("Manual");
  private conflicts: readonly SynchronizationConflict[] = Object.freeze([]);
  private sequence = 0;

  getState(): SynchronizationState {
    return this.state;
  }

  getCheckpoint(): SynchronizationCheckpoint | null {
    return this.checkpoint;
  }

  getStatistics(): SynchronizationStatistics {
    return this.statistics;
  }

  getPolicy(): SynchronizationPolicy {
    return this.policy;
  }

  getConflicts(): readonly SynchronizationConflict[] {
    return this.conflicts;
  }

  setPolicy(policy: SynchronizationPolicy): void {
    this.policy = policy;
  }

  transition(to: SynchronizationState): boolean {
    if (!canTransitionSynchronizationState(this.state, to)) {
      return false;
    }
    this.state = to;
    return true;
  }

  forceState(state: SynchronizationState): void {
    this.state = state;
  }

  recordCheckpoint(state: SynchronizationState = this.state): SynchronizationCheckpoint {
    const createdAt = this.nextTimestamp();
    this.checkpoint = createSynchronizationCheckpoint({
      checkpointId: `local-checkpoint-${this.sequence}`,
      sequence: this.sequence,
      state,
      createdAt,
    });
    this.statistics = createSynchronizationStatistics({
      ...this.statistics,
      lastCheckpointId: this.checkpoint.checkpointId,
    });
    return this.checkpoint;
  }

  setStatistics(statistics: SynchronizationStatistics): void {
    this.statistics = statistics;
  }

  addConflict(conflict: SynchronizationConflict): void {
    this.conflicts = Object.freeze([...this.conflicts, conflict]);
    this.statistics = createSynchronizationStatistics({
      ...this.statistics,
      conflictCount: this.conflicts.length,
    });
  }

  clearConflicts(): void {
    this.conflicts = Object.freeze([]);
    this.statistics = createSynchronizationStatistics({
      ...this.statistics,
      conflictCount: 0,
    });
  }

  private nextTimestamp(): string {
    const millis = String(this.sequence).padStart(3, "0");
    this.sequence += 1;
    return `1970-01-01T00:00:00.${millis}Z`;
  }
}

export function createSynchronizationStateManager(): SynchronizationStateManager {
  return new SynchronizationStateManager();
}

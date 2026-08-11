/**
 * Persistence Consistency Guard — Monotonic Mutation Sequence (Sprint 36.5).
 *
 * `triggerWriteThrough()` (Runtime Observer, Sprint 33.7/36.4) intentionally
 * resets Runtime Write-Through state immediately before every persist call,
 * including while a previous persist call may still be executing
 * asynchronously. That reset is load-bearing for deterministic recovery
 * (Sprint 36.4) but also reopens `RuntimeWriteThroughPipeline.persist()`'s
 * own "already started" guard (`validateRuntimeWriteThroughCanStart`) for a
 * second, overlapping persist call triggered by a later mutation. Because
 * every persist call observes live current domain state, the later call
 * always captures the fresher (or equal) data — but if that later call's
 * repository writes finish *before* the earlier call's (e.g. the earlier
 * call was already mid-flight when the reset happened), the earlier call's
 * still-in-flight writes would otherwise land last and silently downgrade
 * the repository/state-holder back to older data.
 *
 * This module assigns a monotonically increasing sequence number to every
 * successful runtime mutation (Runtime Observer's `onSuccessfulChange`) and
 * lets `RuntimeWriteThroughPipeline.persist()` reject — *before* observing
 * or writing anything — any call whose captured sequence is older than the
 * sequence already reflected by a completed write-through. A stale call can
 * therefore never overwrite a fresher persisted/reported state, without a
 * queue, retry, or event log — just an incrementing counter and a
 * comparison.
 */

let mutationSequence = 0;
let appliedSequence = 0;

/** Called once per successful domain mutation (Runtime Observer only). */
export function nextRuntimeMutationSequence(): number {
  mutationSequence += 1;
  return mutationSequence;
}

export function getCurrentRuntimeMutationSequence(): number {
  return mutationSequence;
}

export function getAppliedWriteThroughSequence(): number {
  return appliedSequence;
}

/**
 * True when `candidate` is older than the sequence already reflected by a
 * completed write-through — i.e. a fresher write-through already applied
 * data this candidate's observation predates.
 */
export function isStaleWriteThroughSequence(candidate: number): boolean {
  return candidate < appliedSequence;
}

/** Records that a write-through call for `candidate` completed successfully. */
export function markWriteThroughSequenceApplied(candidate: number): void {
  if (candidate > appliedSequence) {
    appliedSequence = candidate;
  }
}

/**
 * Full reset — part of the existing full pipeline reset cascade
 * (`RuntimeObserver.stop()`/`reset()`), never called from the
 * per-mutation `triggerWriteThrough()` reset path.
 */
export function resetRuntimeMutationSequence(): void {
  mutationSequence = 0;
  appliedSequence = 0;
}

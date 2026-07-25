import type { AdaptationSnapshot } from "../models/AdaptationSnapshot";
import { diffKeys, type KeyDiff } from "./diffHelpers";

export interface SnapshotDiff {
  readonly decisionIds: KeyDiff;
  readonly signalKeys: KeyDiff;
}

export function compareSnapshots(
  before: AdaptationSnapshot | null,
  after: AdaptationSnapshot | null,
): SnapshotDiff {
  const beforeIds = before ? before.decisions.map((d) => d.id) : [];
  const afterIds = after ? after.decisions.map((d) => d.id) : [];
  const beforeSignals = before ? before.signalKeys : [];
  const afterSignals = after ? after.signalKeys : [];
  return Object.freeze({
    decisionIds: diffKeys(beforeIds, afterIds),
    signalKeys: diffKeys(beforeSignals, afterSignals),
  });
}

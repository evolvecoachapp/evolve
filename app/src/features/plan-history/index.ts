/**
 * Plan History — immutable versioned plan snapshots (Sprint 25.2 foundation).
 *
 * Append-only. Never mutates prior versions. No persistence. No engines.
 */

export * from "./models";
export { computeSnapshotChecksum } from "./utils/computeSnapshotChecksum";
export {
  PlanHistoryStore,
  createPlanHistoryStore,
} from "./store/PlanHistoryStore";
export * from "./services";
export {
  publishPlanVersion,
  getPlanHistory,
} from "./application";

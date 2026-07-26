/**
 * Legacy decision / recommendation rule calculator.
 *
 * @deprecated Sprint 23.2 — Application decision flow is
 * Context Fusion → `features/decision-engine` → `features/recommendation-engine`
 * via the Composition Root. This module remains for:
 * - `DecisionRecommendation` / context types used by the Dashboard store contract
 * - Emergency fallback inside `LegacyRuleRecommendationService`
 *
 * Do not add new call sites. Prefer `resolveService("DecisionEngineService")`.
 */
export type {
  DecisionContext,
  DecisionRecommendation,
  DecisionRecommendationCategory,
  WorkoutStatus,
  RecoveryStatus,
  ProgressStatus,
} from "./types"
/** @deprecated Prefer Composition Root `DecisionEngineService` / Recommendation Engine bridge. */
export { generateRecommendations } from "./engine"

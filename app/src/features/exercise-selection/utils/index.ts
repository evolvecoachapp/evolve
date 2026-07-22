export {
  mapFocusToMovementPatterns,
  mapPriorityToGoalCodes,
} from "./mapFocusToMovementPatterns";
export {
  buildSelectionContext,
  DEFAULT_MAX_CANDIDATES_PER_ROLE,
} from "./buildSelectionContext";
export { difficultyRank, isDifficultyWithinCap } from "./difficultyRank";
export {
  calculateSelectionScore,
  mergeScoreParts,
  type SelectionScoreParts,
} from "./calculateSelectionScore";
export {
  sortByIdAsc,
  sortByScoreDescThenIdAsc,
  compareCandidatesByScoreThenId,
} from "./sortDeterministically";
export { detectDuplicateIds, dedupeById } from "./detectDuplicates";
export {
  normalizeCandidate,
  type NormalizeCandidateInput,
} from "./normalizeCandidate";
export { rankCandidates, type RankableCandidate } from "./rankCandidates";
export { freezeSelectionResult } from "./freezeSelectionResult";

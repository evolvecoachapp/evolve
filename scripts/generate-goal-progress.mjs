/**
 * Sprint 24.4 — Goal Progress Engine generator.
 * Transforms continuous-adaptation → goal-progress (type renames only; fields preserved).
 * Run: node scripts/generate-goal-progress.mjs
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("app/src/features/continuous-adaptation");
const DST = path.resolve("app/src/features/goal-progress");

const REPLACEMENTS = [
  // Protect ContinuousAdaptation* from later Adaptation→… renames via placeholder
  ["ContinuousAdaptationEngineService", "GoalProgressEngineService"],
  ["createContinuousAdaptationEngineService", "createGoalProgressEngineService"],
  ["createTestContinuousAdaptationEngineService", "createTestGoalProgressEngineService"],
  ["ContinuousAdaptationEngine", "GoalProgressEngine"],
  ["createContinuousAdaptationEngine", "createGoalProgressEngine"],

  // CA handoff GoalProgressInput → placeholder before AdaptationInput rename
  ["buildGoalProgressInput", "buildContinuousAdaptationInput"],
  ["GoalProgressInput", "__CA_HANDOFF_INPUT__"],

  // Sprint / module
  [
    "Sprint 23.1 — Continuous Adaptation Engine Foundation",
    "Sprint 24.4 — Goal Progress Engine Foundation",
  ],
  ["Sprint 23.1", "Sprint 24.4"],
  ["continuous-adaptation", "goal-progress"],
  ["Continuous Adaptation Engine", "Goal Progress Engine"],
  ["continuous adaptation", "goal progress"],
  ["Continuous adaptation", "Goal progress"],
  ["23.1.0", "24.4.0"],
  ["runtime:goal-progress", "runtime:goal-progress"],

  // Engine / session
  ["AdaptationCoordinator", "GoalProgressCoordinator"],
  ["createAdaptationCoordinator", "createGoalProgressCoordinator"],
  ["AdaptationSession", "GoalProgressSession"],
  ["createAdaptationSession", "createGoalProgressSession"],

  // Public API
  ["evaluateAdaptation", "evaluateGoalProgress"],
  ["detectAdaptation", "trackGoalProgress"],
  ["describeAdaptation", "describeGoalProgress"],
  ["createAdaptationSnapshot", "createGoalSnapshot"],
  ["validateAdaptationPackage", "validateGoalPackage"],
  ["validateAdaptationIntegrity", "validateGoalIntegrity"],
  ["validateAdaptation", "validateGoalProgress"],
  ["validateTriggerConsistency", "validateMilestoneConsistency"],

  // Builders / freeze / helpers
  ["buildAdaptationDecision", "buildGoalProgress"],
  ["buildAdaptationDescriptor", "buildGoalDescriptor"],
  ["buildAdaptationPackage", "buildGoalPackage"],
  ["buildAdaptationResult", "buildGoalResult"],
  ["buildAdaptationSnapshot", "buildGoalSnapshot"],
  ["buildAdaptationSummary", "buildGoalSummary"],
  ["buildAdaptationTimeline", "buildGoalTimeline"],
  ["buildAdaptationHistory", "buildGoalHistory"],
  ["buildAdaptationWindow", "buildGoalTrend"],
  ["AdaptationBuilder", "GoalProgressBuilder"],
  ["FreezeAdaptationState", "FreezeGoalProgress"],
  ["AdaptationHelpers", "GoalHelpers"],
  ["EMPTY_ADAPTATION_METADATA", "EMPTY_GOAL_METADATA"],
  ["createAdaptationError", "createGoalError"],
  ["createAdaptationInput", "createGoalProgressInput"],

  // Policies
  ["AdaptationPolicy", "GoalProgressPolicy"],
  ["applyAdaptationPolicy", "applyGoalProgressPolicy"],
  ["DetectionPolicy", "MilestonePolicy"],
  ["applyDetectionPolicy", "applyMilestonePolicy"],
  ["MonitoringPolicy", "TrackingPolicy"],
  ["applyMonitoringPolicy", "applyTrackingPolicy"],
  ["PriorityPolicy", "ConsistencyPolicy"],
  ["applyPriorityPolicy", "applyConsistencyPolicy"],

  // Evaluators (CA evaluation/)
  ["evaluateAdaptationSignals", "evaluateGoalSignals"],
  ["AdaptationEvaluator", "StrengthGoalEvaluator"],
  ["PriorityEvaluator", "WeightGoalEvaluator"],
  ["SeverityEvaluator", "BodyCompositionEvaluator"],
  ["DependencyEvaluator", "PerformanceGoalEvaluator"],
  ["RiskEvaluator", "RecoveryGoalEvaluator"],
  ["evaluateRiskOrdinal", "evaluateRecoveryGoalOrdinal"],
  ["evaluateDependencyCount", "evaluatePerformanceGoalCount"],

  // Detectors → evaluators (detection/ merged into evaluation/)
  ["ProgressDetector", "MilestoneEvaluator"],
  ["detectProgress", "evaluateMilestone"],
  ["PlateauDetector", "StrengthPlateauEvaluator"],
  ["detectPlateau", "evaluateStrengthPlateau"],
  ["RegressionDetector", "BodyCompositionRegressionEvaluator"],
  ["detectRegression", "evaluateBodyCompositionRegression"],
  ["RecoveryDetector", "RecoverySignalEvaluator"],
  ["detectRecovery", "evaluateRecoverySignal"],
  ["ConsistencyDetector", "ConsistencySignalEvaluator"],
  ["detectConsistency", "evaluateConsistencySignal"],
  ["AdherenceDetector", "AdherenceEvaluator"],
  ["detectAdherence", "evaluateAdherence"],
  ["TrendDetector", "PerformanceTrendEvaluator"],
  ["detectTrend", "evaluatePerformanceTrend"],

  // Monitors → trackers
  ["../monitoring/", "../tracking/"],
  ["./monitoring/", "./tracking/"],
  ["GoalMonitor", "GoalTracker"],
  ["observeGoal", "trackGoal"],
  ["AdherenceMonitor", "AdherenceTracker"],
  ["observeAdherence", "trackAdherence"],
  ["HistoryMonitor", "HistoryTracker"],
  ["observeHistory", "trackHistory"],
  ["PerformanceMonitor", "MilestoneTracker"],
  ["observePerformance", "trackMilestone"],
  ["RecoveryMonitor", "AchievementTracker"],
  ["observeRecovery", "trackAchievement"],
  ["StateMonitor", "ConsistencyTracker"],
  ["observeState", "trackConsistency"],
  ["NutritionMonitor", "NutritionAdherenceTracker"],
  ["observeNutrition", "trackNutritionAdherence"],
  ["TimelineMonitor", "TimelineHistoryTracker"],
  ["observeTimeline", "trackTimelineHistory"],

  // Comparators
  ["DecisionComparator", "ProgressComparator"],
  ["compareDecisions", "compareProgress"],
  ["RecommendationComparator", "HistoryComparator"],
  ["compareRecommendations", "compareHistoryEntries"],
  ["StateComparator", "MilestoneComparator"],
  ["compareStates", "compareMilestones"],

  // Selectors
  ["AdaptationSelector", "GoalSelector"],
  ["selectAdaptation", "selectGoal"],
  ["TriggerSelector", "MilestoneSelector"],
  ["selectTriggers", "selectMilestones"],
  ["PrioritySelector", "ProgressSelector"],
  ["selectPriority", "selectProgress"],

  // Ports
  ["ContextFusionPort", "WorkoutAdaptationPort"],
  ["createMockContextFusionPort", "createMockWorkoutAdaptationPort"],
  ["contextFusionPort", "workoutAdaptationPort"],
  ["ExplainabilityEnginePort", "NutritionAdaptationPort"],
  ["createMockExplainabilityEnginePort", "createMockNutritionAdaptationPort"],
  ["explainabilityEnginePort", "nutritionAdaptationPort"],
  ["loadFocusAreas", "loadWorkoutAdaptationKeys"],
  ["loadExplanations", "loadNutritionAdaptationKeys"],

  // Handoff models from CA → ContinuousAdaptationInput
  ["buildWorkoutAdaptationInput", "buildContinuousAdaptationInput"],
  ["buildNutritionAdaptationInput", "buildContinuousAdaptationInput"],
  ["buildRecoveryAdaptationInput", "buildContinuousAdaptationInput"],
  ["workoutAdaptationInput", "continuousAdaptationInput"],
  ["nutritionAdaptationInput", "continuousAdaptationInput"],
  ["recoveryAdaptationInput", "continuousAdaptationInput"],
  ["__CA_HANDOFF_INPUT__", "ContinuousAdaptationInput"],
  ["WorkoutAdaptationInput", "ContinuousAdaptationInput"],
  ["NutritionAdaptationInput", "ContinuousAdaptationInput"],
  ["RecoveryAdaptationInput", "ContinuousAdaptationInput"],

  // Core Adaptation* types → Goal*
  ["AdaptationInputKinds", "GoalProgressInputKinds"],
  ["AdaptationInputKind", "GoalProgressInputKind"],
  ["AdaptationOperationKinds", "GoalOperationKinds"],
  ["AdaptationOperationKind", "GoalOperationKind"],
  ["AdaptationSessionStatuses", "GoalSessionStatuses"],
  ["AdaptationSessionStatus", "GoalSessionStatus"],
  ["AdaptationErrorCodes", "GoalErrorCodes"],
  ["AdaptationCandidate", "GoalCheckpoint"],
  ["AdaptationOpportunity", "GoalMilestone"],
  ["AdaptationTrigger", "GoalAchievement"],
  ["AdaptationCondition", "GoalDeviation"],
  ["AdaptationDecision", "GoalProgress"],
  ["AdaptationEvaluation", "GoalEvaluation"],
  ["AdaptationContext", "GoalProgressContext"],
  ["AdaptationInput", "GoalProgressInput"],
  ["AdaptationOutput", "GoalProgressOutput"],
  ["AdaptationState", "GoalProgressState"],
  ["AdaptationPackage", "GoalPackage"],
  ["AdaptationSnapshot", "GoalSnapshot"],
  ["AdaptationTimeline", "GoalTimeline"],
  ["AdaptationHistory", "GoalHistory"],
  ["AdaptationSummary", "GoalSummary"],
  ["AdaptationMetadata", "GoalMetadata"],
  ["AdaptationStatistics", "GoalStatistics"],
  ["AdaptationDiagnostics", "GoalDiagnostics"],
  ["AdaptationResult", "GoalResult"],
  ["AdaptationDescriptor", "GoalDescriptor"],
  ["AdaptationValidation", "GoalValidation"],
  ["AdaptationError", "GoalError"],
  ["AdaptationCategory", "GoalCategory"],
  ["AdaptationPriority", "GoalPriority"],
  ["AdaptationSeverity", "GoalRisk"],
  ["AdaptationDependency", "GoalDependency"],
  ["AdaptationConstraint", "GoalConstraint"],
  ["AdaptationReference", "GoalReference"],
  ["AdaptationReason", "GoalConfidence"],
  ["AdaptationWindow", "GoalTrend"],
  ["AdaptationComparison", "GoalComparison"],

  // severity helpers → risk helpers (type GoalRisk)
  ["severityForSignalCount", "riskForSignalCount"],

  // DETECT → TRACK
  ["DETECT", "TRACK"],
  ['"detect"', '"track"'],

  // Import path fixes for renamed builder/timeline files
  ['from "../builders/PackageBuilder"', 'from "../builders/GoalPackageBuilder"'],
  ['from "../builders/SummaryBuilder"', 'from "../builders/GoalSummaryBuilder"'],
  ['from "../builders/SnapshotBuilder"', 'from "../builders/GoalSnapshotBuilder"'],
  ['from "../builders/AdaptationBuilder"', 'from "../builders/GoalProgressBuilder"'],
  ['from "./PackageBuilder"', 'from "./GoalPackageBuilder"'],
  ['from "./SummaryBuilder"', 'from "./GoalSummaryBuilder"'],
  ['from "./SnapshotBuilder"', 'from "./GoalSnapshotBuilder"'],
  ['from "./AdaptationBuilder"', 'from "./GoalProgressBuilder"'],
  ['from "../timeline/TimelineBuilder"', 'from "../timeline/GoalTimelineBuilder"'],
  ['from "../timeline/HistoryBuilder"', 'from "../timeline/HistoryTimelineBuilder"'],
  ['from "../timeline/TrendBuilder"', 'from "../timeline/MilestoneTimelineBuilder"'],
  ['from "./TimelineBuilder"', 'from "./GoalTimelineBuilder"'],
  ['from "./HistoryBuilder"', 'from "./HistoryTimelineBuilder"'],
  ['from "./TrendBuilder"', 'from "./MilestoneTimelineBuilder"'],
  ['from "../detection/', 'from "../evaluation/'],
  ['from "./detection/', 'from "./evaluation/'],

  // Prose
  ["adaptation opportunity detection", "goal progress evaluation"],
  ["Adaptation detection only", "Goal progress evaluation only"],
  ["detection only", "evaluation only"],
  ["detection_only", "evaluation_only"],
  ["Does NOT modify plans", "Does NOT adapt workout / nutrition / recovery plans"],
  ["no_plan_modification", "no_plan_adaptation"],
  ["no_recommendation_generation", "no_goal_mutation"],
];

const PATH_RENAMES = [
  ["builders/SnapshotBuilder.ts", "builders/GoalSnapshotBuilder.ts"],
  ["builders/PackageBuilder.ts", "builders/GoalPackageBuilder.ts"],
  ["builders/SummaryBuilder.ts", "builders/GoalSummaryBuilder.ts"],
  ["builders/AdaptationBuilder.ts", "builders/GoalProgressBuilder.ts"],
  ["timeline/TimelineBuilder.ts", "timeline/GoalTimelineBuilder.ts"],
  ["timeline/HistoryBuilder.ts", "timeline/HistoryTimelineBuilder.ts"],
  ["timeline/SnapshotBuilder.ts", "timeline/SnapshotTimelineBuilder.ts"],
  ["timeline/TrendBuilder.ts", "timeline/MilestoneTimelineBuilder.ts"],
  ["models/GoalProgressInput.ts", "models/ContinuousAdaptationInput.ts"],
  ["models/AdaptationInput.ts", "models/GoalProgressInput.ts"],
  ["adaptation/ContinuousAdaptationEngine.ts", "progress/GoalProgressEngine.ts"],
  ["adaptation/AdaptationCoordinator.ts", "progress/GoalProgressCoordinator.ts"],
  ["adaptation/AdaptationSession.ts", "progress/GoalProgressSession.ts"],
  ["services/ContinuousAdaptationEngineService.ts", "services/GoalProgressEngineService.ts"],
  ["utils/FreezeAdaptationState.ts", "utils/FreezeGoalProgress.ts"],
  ["utils/AdaptationHelpers.ts", "utils/GoalHelpers.ts"],
  ["policies/AdaptationPolicy.ts", "policies/GoalProgressPolicy.ts"],
  ["policies/DetectionPolicy.ts", "policies/MilestonePolicy.ts"],
  ["policies/MonitoringPolicy.ts", "policies/TrackingPolicy.ts"],
  ["policies/PriorityPolicy.ts", "__SKIP__"],
  ["evaluation/AdaptationEvaluator.ts", "evaluation/StrengthGoalEvaluator.ts"],
  ["evaluation/PriorityEvaluator.ts", "evaluation/WeightGoalEvaluator.ts"],
  ["evaluation/SeverityEvaluator.ts", "evaluation/BodyCompositionEvaluator.ts"],
  ["evaluation/DependencyEvaluator.ts", "evaluation/PerformanceGoalEvaluator.ts"],
  ["evaluation/RiskEvaluator.ts", "evaluation/RecoveryGoalEvaluator.ts"],
  ["detection/ProgressDetector.ts", "evaluation/MilestoneEvaluator.ts"],
  ["detection/PlateauDetector.ts", "evaluation/StrengthPlateauEvaluator.ts"],
  ["detection/RegressionDetector.ts", "evaluation/BodyCompositionRegressionEvaluator.ts"],
  ["detection/RecoveryDetector.ts", "evaluation/RecoverySignalEvaluator.ts"],
  ["detection/ConsistencyDetector.ts", "evaluation/ConsistencySignalEvaluator.ts"],
  ["detection/AdherenceDetector.ts", "evaluation/AdherenceEvaluator.ts"],
  ["detection/TrendDetector.ts", "evaluation/PerformanceTrendEvaluator.ts"],
  ["detection/index.ts", "__SKIP__"],
  ["monitoring/GoalMonitor.ts", "tracking/GoalTracker.ts"],
  ["monitoring/AdherenceMonitor.ts", "tracking/AdherenceTracker.ts"],
  ["monitoring/HistoryMonitor.ts", "tracking/HistoryTracker.ts"],
  ["monitoring/PerformanceMonitor.ts", "tracking/MilestoneTracker.ts"],
  ["monitoring/RecoveryMonitor.ts", "tracking/AchievementTracker.ts"],
  ["monitoring/StateMonitor.ts", "tracking/ConsistencyTracker.ts"],
  ["monitoring/NutritionMonitor.ts", "tracking/NutritionAdherenceTracker.ts"],
  ["monitoring/TimelineMonitor.ts", "tracking/TimelineHistoryTracker.ts"],
  ["monitoring/index.ts", "tracking/index.ts"],
  ["comparison/DecisionComparator.ts", "comparison/ProgressComparator.ts"],
  ["comparison/RecommendationComparator.ts", "comparison/HistoryComparator.ts"],
  ["comparison/StateComparator.ts", "comparison/MilestoneComparator.ts"],
  ["selectors/AdaptationSelector.ts", "selectors/GoalSelector.ts"],
  ["selectors/TriggerSelector.ts", "selectors/MilestoneSelector.ts"],
  ["selectors/PrioritySelector.ts", "selectors/ProgressSelector.ts"],
  ["contracts/ContextFusionPort.ts", "contracts/WorkoutAdaptationPort.ts"],
  ["contracts/ExplainabilityEnginePort.ts", "contracts/NutritionAdaptationPort.ts"],
  ["models/AdaptationCandidate.ts", "models/GoalCheckpoint.ts"],
  ["models/AdaptationOpportunity.ts", "models/GoalMilestone.ts"],
  ["models/AdaptationTrigger.ts", "models/GoalAchievement.ts"],
  ["models/AdaptationCondition.ts", "models/GoalDeviation.ts"],
  ["models/AdaptationDecision.ts", "models/GoalProgress.ts"],
  ["models/AdaptationEvaluation.ts", "models/GoalEvaluation.ts"],
  ["models/AdaptationContext.ts", "models/GoalProgressContext.ts"],
  ["models/AdaptationOutput.ts", "models/GoalProgressOutput.ts"],
  ["models/AdaptationState.ts", "models/GoalProgressState.ts"],
  ["models/AdaptationPackage.ts", "models/GoalPackage.ts"],
  ["models/AdaptationSnapshot.ts", "models/GoalSnapshot.ts"],
  ["models/AdaptationTimeline.ts", "models/GoalTimeline.ts"],
  ["models/AdaptationHistory.ts", "models/GoalHistory.ts"],
  ["models/AdaptationSummary.ts", "models/GoalSummary.ts"],
  ["models/AdaptationMetadata.ts", "models/GoalMetadata.ts"],
  ["models/AdaptationStatistics.ts", "models/GoalStatistics.ts"],
  ["models/AdaptationDiagnostics.ts", "models/GoalDiagnostics.ts"],
  ["models/AdaptationResult.ts", "models/GoalResult.ts"],
  ["models/AdaptationDescriptor.ts", "models/GoalDescriptor.ts"],
  ["models/AdaptationValidation.ts", "models/GoalValidation.ts"],
  ["models/AdaptationError.ts", "models/GoalError.ts"],
  ["models/AdaptationCategory.ts", "models/GoalCategory.ts"],
  ["models/AdaptationPriority.ts", "models/GoalPriority.ts"],
  ["models/AdaptationSeverity.ts", "models/GoalRisk.ts"],
  ["models/AdaptationDependency.ts", "models/GoalDependency.ts"],
  ["models/AdaptationConstraint.ts", "models/GoalConstraint.ts"],
  ["models/AdaptationReference.ts", "models/GoalReference.ts"],
  ["models/AdaptationReason.ts", "models/GoalConfidence.ts"],
  ["models/AdaptationWindow.ts", "models/GoalTrend.ts"],
  ["models/WorkoutAdaptationInput.ts", "__SKIP__"],
  ["models/NutritionAdaptationInput.ts", "__SKIP__"],
  ["models/RecoveryAdaptationInput.ts", "__SKIP__"],
  ["validators/validateAdaptationIntegrity.ts", "validators/validateGoalIntegrity.ts"],
  ["validators/validateTriggerConsistency.ts", "validators/validateMilestoneConsistency.ts"],
  ["__tests__/monitoring.test.ts", "__tests__/tracking.test.ts"],
  ["__tests__/detection.test.ts", "__tests__/milestones.test.ts"],
];

const DIR_RENAMES = [
  ["adaptation", "progress"],
  ["monitoring", "tracking"],
  ["detection", "evaluation"],
];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function dedupeTsSource(source) {
  const lines = source.split("\n");
  const out = [];
  const importSymbols = new Set();
  /** @type {Set<string>|null} */
  let readonlyKeys = null;

  for (const line of lines) {
    const trimmed = line.trim();
    const importMatch = trimmed.match(/^import type \{ (\w+) \} from /);
    if (importMatch) {
      if (importSymbols.has(importMatch[1])) continue;
      importSymbols.add(importMatch[1]);
      out.push(line);
      continue;
    }
    if (trimmed.startsWith("import ") && !trimmed.endsWith("{")) {
      if (out.some((l) => l.trim() === trimmed)) continue;
      out.push(line);
      continue;
    }
    if (trimmed === "import {") {
      out.push(line);
      continue;
    }
    if (trimmed.startsWith("export * from")) {
      if (out.some((l) => l.trim() === trimmed)) continue;
      out.push(line);
      continue;
    }
    if (/^(export )?interface \w+/.test(trimmed) || /input:\s*\{$/.test(trimmed)) {
      readonlyKeys = new Set();
      out.push(line);
      continue;
    }
    if (readonlyKeys && (trimmed === "}" || trimmed.startsWith("}):") || trimmed === "};")) {
      readonlyKeys = null;
      out.push(line);
      continue;
    }
    if (readonlyKeys) {
      const field = trimmed.match(/^readonly (\w+)[?:]/);
      if (field) {
        if (readonlyKeys.has(field[1])) continue;
        readonlyKeys.add(field[1]);
      }
      out.push(line);
      continue;
    }
    out.push(line);
  }
  let result = out.join("\n");
  if (!result.endsWith("\n")) result += "\n";
  return result;
}

function dropDuplicateObjectProps(source, key) {
  const lines = source.split("\n");
  const out = [];
  let seenInCurrentObject = false;
  let depth = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    if (depth === 0 && opens > 0) seenInCurrentObject = false;
    depth += opens;
    const isProp =
      trimmed === `${key},` ||
      trimmed.startsWith(`${key}:`) ||
      trimmed.startsWith(`${key} :`);
    if (isProp && depth > 0) {
      if (seenInCurrentObject) {
        depth -= closes;
        if (depth <= 0) {
          depth = 0;
          seenInCurrentObject = false;
        }
        continue;
      }
      seenInCurrentObject = true;
    }
    out.push(line);
    depth -= closes;
    if (depth <= 0) {
      depth = 0;
      seenInCurrentObject = false;
    }
  }
  return out.join("\n");
}

function transformText(text) {
  let out = text;
  for (const [from, to] of REPLACEMENTS) {
    if (from === to) continue;
    out = out.split(from).join(to);
  }
  return out;
}

function transformRelPath(rel) {
  const sourceRel = rel.replace(/\\/g, "/");
  for (const [from, to] of PATH_RENAMES) {
    if (sourceRel === from) return to;
  }
  let normalized = sourceRel;
  for (const [from, to] of DIR_RENAMES) {
    normalized = normalized
      .split("/")
      .map((p) => (p === from ? to : p))
      .join("/");
  }
  return transformText(normalized);
}

function rmrf(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

rmrf(DST);
fs.mkdirSync(DST, { recursive: true });

const files = walk(SRC);
let written = 0;
const writtenPaths = new Set();

for (const full of files) {
  const rel = path.relative(SRC, full).replace(/\\/g, "/");
  let destRel = transformRelPath(rel);
  if (destRel.includes("__SKIP__")) continue;
  if (writtenPaths.has(destRel)) continue;
  writtenPaths.add(destRel);

  let transformed = transformText(fs.readFileSync(full, "utf8"));
  transformed = transformed
    .replace(/GoalGoal/g, "Goal")
    .replace(/EMPTY_GOAL_METADATA_METADATA/g, "EMPTY_GOAL_METADATA")
    .replace(/ContinuousAdaptationInputInput/g, "ContinuousAdaptationInput")
    .replace(/GoalProgressProgress/g, "GoalProgress")
    .replace(/riskForSignalCountForSignalCount/g, "riskForSignalCount");

  if (destRel.endsWith(".ts")) transformed = dedupeTsSource(transformed);

  if (
    destRel.includes("GoalPackage") ||
    destRel.includes("GoalResult") ||
    destRel.includes("GoalPackageBuilder") ||
    destRel.includes("ResultBuilder") ||
    destRel.includes("GoalProgressCoordinator") ||
    destRel.includes("HandoffBuilder") ||
    destRel.includes("builders.test")
  ) {
    transformed = dropDuplicateObjectProps(transformed, "continuousAdaptationInput");
  }

  if (destRel === "models/index.ts") {
    const lines = transformed
      .split("\n")
      .filter(
        (l) =>
          !l.includes("__SKIP__") &&
          !l.includes('"./Workout') &&
          !l.includes('"./Nutrition') &&
          !l.includes('"./Recovery'),
      );
    if (!lines.some((l) => l.includes('"./ContinuousAdaptationInput"'))) {
      lines.push('export * from "./ContinuousAdaptationInput";');
    }
    transformed = lines.filter(Boolean).join("\n") + "\n";
  }

  if (destRel === "evaluation/index.ts") {
    transformed = [
      'export * from "./StrengthGoalEvaluator";',
      'export * from "./BodyCompositionEvaluator";',
      'export * from "./WeightGoalEvaluator";',
      'export * from "./PerformanceGoalEvaluator";',
      'export * from "./RecoveryGoalEvaluator";',
      'export * from "./AdherenceEvaluator";',
      'export * from "./ConsistencyEvaluator";',
      'export * from "./MilestoneEvaluator";',
      'export * from "./StrengthPlateauEvaluator";',
      'export * from "./BodyCompositionRegressionEvaluator";',
      'export * from "./RecoverySignalEvaluator";',
      'export * from "./ConsistencySignalEvaluator";',
      'export * from "./PerformanceTrendEvaluator";',
    ].join("\n") + "\n";
  }

  if (destRel === "tracking/index.ts") {
    transformed = [
      'export * from "./GoalTracker";',
      'export * from "./MilestoneTracker";',
      'export * from "./AchievementTracker";',
      'export * from "./HistoryTracker";',
      'export * from "./ConsistencyTracker";',
      'export * from "./AdherenceTracker";',
    ].join("\n") + "\n";
  }

  if (destRel === "policies/index.ts") {
    transformed = [
      'export * from "./GoalProgressPolicy";',
      'export * from "./ConsistencyPolicy";',
      'export * from "./MilestonePolicy";',
      'export * from "./TrackingPolicy";',
      'export * from "./SafetyPolicy";',
    ].join("\n") + "\n";
  }

  if (destRel === "comparison/index.ts") {
    transformed = [
      'export * from "./GoalComparator";',
      'export * from "./SnapshotComparator";',
      'export * from "./TimelineComparator";',
      'export * from "./HistoryComparator";',
      'export * from "./MilestoneComparator";',
      'export * from "./ProgressComparator";',
      'export * from "./diffHelpers";',
    ].join("\n") + "\n";
  }

  if (destRel === "selectors/index.ts") {
    transformed = [
      'export * from "./GoalSelector";',
      'export * from "./MilestoneSelector";',
      'export * from "./HistorySelector";',
      'export * from "./ProgressSelector";',
      'export * from "./TimelineSelector";',
    ].join("\n") + "\n";
  }

  if (destRel === "contracts/index.ts") {
    transformed = [
      'export * from "./AthleteStatePort";',
      'export * from "./WorkoutAdaptationPort";',
      'export * from "./NutritionAdaptationPort";',
      'export * from "./RecoveryAdaptationPort";',
      'export * from "./DecisionEnginePort";',
      'export * from "./RecommendationEnginePort";',
    ].join("\n") + "\n";
  }

  if (destRel === "timeline/index.ts") {
    transformed = [
      'export * from "./GoalTimelineBuilder";',
      'export * from "./MilestoneTimelineBuilder";',
      'export * from "./HistoryTimelineBuilder";',
      'export * from "./SnapshotTimelineBuilder";',
      'export * from "./WindowBuilder";',
    ].join("\n") + "\n";
  }

  if (destRel === "builders/index.ts") {
    transformed = [
      'export * from "./GoalProgressBuilder";',
      'export * from "./GoalPackageBuilder";',
      'export * from "./GoalSummaryBuilder";',
      'export * from "./GoalSnapshotBuilder";',
      'export * from "./DescriptorBuilder";',
      'export * from "./ResultBuilder";',
      'export * from "./HandoffBuilder";',
    ].join("\n") + "\n";
  }

  const dest = path.join(DST, destRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, transformed.replace(/\r?\n/g, "\n"), "utf8");
  written++;
}

console.log(`Wrote ${written} files to ${DST}`);

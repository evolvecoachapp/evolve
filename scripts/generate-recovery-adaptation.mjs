/**
 * Sprint 24.3 — Recovery Adaptation Engine generator.
 * Transforms nutrition-adaptation → recovery-adaptation with domain remapping.
 * Run: node scripts/generate-recovery-adaptation.mjs
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("app/src/features/nutrition-adaptation");
const DST = path.resolve("app/src/features/recovery-adaptation");

/** Longest-first token replacements applied to file contents AND relative paths. */
const REPLACEMENTS = [
  // Sprint / module identity
  ["Sprint 24.2 — Nutrition Adaptation Engine Foundation", "Sprint 24.3 — Recovery Adaptation Engine Foundation"],
  ["Sprint 24.2", "Sprint 24.3"],
  ["nutrition-adaptation", "recovery-adaptation"],
  ["Nutrition Adaptation Engine", "Recovery Adaptation Engine"],
  ["nutrition adaptation", "recovery adaptation"],
  ["Nutrition adaptation", "Recovery adaptation"],

  // Engine / service / session (longest first)
  ["NutritionAdaptationEngineService", "RecoveryAdaptationEngineService"],
  ["NutritionAdaptationCoordinator", "RecoveryAdaptationCoordinator"],
  ["NutritionAdaptationSession", "RecoveryAdaptationSession"],
  ["NutritionAdaptationEngine", "RecoveryAdaptationEngine"],
  ["createNutritionAdaptationEngineService", "createRecoveryAdaptationEngineService"],
  ["createNutritionAdaptationSession", "createRecoveryAdaptationSession"],
  ["createNutritionAdaptationEngine", "createRecoveryAdaptationEngine"],

  // Builders / helpers / freeze
  ["NutritionAdaptationBuilder", "RecoveryAdaptationBuilder"],
  ["NutritionPackageBuilder", "RecoveryPackageBuilder"],
  ["NutritionSummaryBuilder", "RecoverySummaryBuilder"],
  ["NutritionSnapshotBuilder", "RecoverySnapshotBuilder"],
  ["buildNutritionAdaptation", "buildRecoveryAdaptation"],
  ["buildNutritionPackage", "buildRecoveryPackage"],
  ["buildNutritionSummary", "buildRecoverySummary"],
  ["buildNutritionSnapshot", "buildRecoverySnapshot"],
  ["buildNutritionDescriptor", "buildRecoveryDescriptor"],
  ["buildNutritionResult", "buildRecoveryResult"],
  ["NutritionAdaptationHelpers", "RecoveryAdaptationHelpers"],
  ["FreezeNutritionAdaptation", "FreezeRecoveryAdaptation"],
  ["freezeNutrition", "freezeRecovery"],

  // Policies
  ["NutritionAdaptationPolicy", "RecoveryAdaptationPolicy"],
  ["applyNutritionAdaptationPolicy", "applyRecoveryAdaptationPolicy"],
  ["AdherencePolicy", "SleepPolicy"],
  ["applyAdherencePolicy", "applySleepPolicy"],
  ["HydrationPolicy", "FatiguePolicy"],
  ["applyHydrationPolicy", "applyFatiguePolicy"],

  // Evaluators (nutrition-specific → recovery)
  ["RecoveryNutritionEvaluator", "RecoveryEvaluator"],
  ["evaluateRecoveryNutrition", "evaluateRecovery"],
  ["CalorieEvaluator", "SleepEvaluator"],
  ["evaluateCalorie", "evaluateSleep"],
  ["MacroEvaluator", "FatigueEvaluator"],
  ["evaluateMacro", "evaluateFatigue"],
  ["HydrationEvaluator", "StressEvaluator"],
  ["evaluateHydration", "evaluateStress"],
  ["MealTimingEvaluator", "ReadinessEvaluator"],
  ["evaluateMealTiming", "evaluateReadiness"],
  ["AdherenceEvaluator", "HRVEvaluator"],
  ["evaluateAdherence", "evaluateHRV"],
  ["evaluateNutritionSignals", "evaluateRecoverySignals"],

  // Planners
  ["NutritionPlanner", "RecoveryPlanner"],
  ["planNutritionAdaptation", "planRecoveryAdaptation"],
  ["MealPlanner", "SleepPlanner"],
  ["planMeals", "planSleep"],
  ["MacroPlanner", "DeloadPlanner"],
  ["planMacros", "planDeload"],
  ["TimingPlanner", "MobilityPlanner"],
  ["planTiming", "planMobility"],
  ["HydrationPlanner", "StressPlanner"],
  ["planHydration", "planStress"],
  ["WeeklyPlanner", "WeekPlanner"],
  ["planWeekly", "planWeek"],

  // Adapters
  ["CalorieAdapter", "SleepAdapter"],
  ["adaptCalorie", "adaptSleep"],
  ["MealAdapter", "RecoveryDayAdapter"],
  ["adaptMeal", "adaptRecoveryDay"],
  ["DietBreakAdapter", "DeloadAdapter"],
  ["adaptDietBreak", "adaptDeload"],
  ["TimingAdapter", "MobilityAdapter"],
  ["adaptTiming", "adaptMobility"],
  ["SupplementAdapter", "StretchingAdapter"],
  ["adaptSupplement", "adaptStretching"],
  ["RefeedAdapter", "CardioAdapter"],
  ["adaptRefeed", "adaptCardio"],
  ["HydrationAdapter", "StressAdapter"],
  ["adaptHydration", "adaptStress"],
  ["MacroAdapter", "ReadinessAdapter"],
  ["adaptMacro", "adaptReadiness"],

  // Comparators
  ["PlanComparator", "RecoveryPlanComparator"],
  ["comparePlans", "compareRecoveryPlans"],
  ["HistoryComparator", "RecoveryHistoryComparator"],
  ["compareHistory", "compareRecoveryHistory"],
  ["MacroComparator", "RecoveryStateComparator"],
  ["compareMacros", "compareRecoveryState"],
  ["MealComparator", "RecoveryTimelineComparator"],
  ["compareMeals", "compareRecoveryTimeline"],
  ["ProgressComparator", "RecoveryProgressComparator"],
  ["compareProgress", "compareRecoveryProgress"],

  // Selectors
  ["NutritionSelector", "RecoverySelector"],
  ["selectNutrition", "selectRecovery"],
  ["MealSelector", "SleepSelector"],
  ["selectMeals", "selectSleep"],
  ["MacroSelector", "ReadinessSelector"],
  ["selectMacros", "selectReadiness"],
  ["TimingSelector", "FatigueSelector"],
  ["selectTiming", "selectFatigue"],

  // Ports
  ["NutritionPlanPort", "RecoveryPlanPort"],
  ["NutritionRuntimePort", "RecoveryRuntimePort"],
  ["MockNutritionPlanPort", "MockRecoveryPlanPort"],
  ["MockNutritionRuntimePort", "MockRecoveryRuntimePort"],
  ["createMockNutritionPlanPort", "createMockRecoveryPlanPort"],
  ["createMockNutritionRuntimePort", "createMockRecoveryRuntimePort"],
  ["nutritionPlanPort", "recoveryPlanPort"],
  ["nutritionRuntimePort", "recoveryRuntimePort"],

  // Models — adjustments
  ["CalorieAdjustment", "SleepAdjustment"],
  ["calorieAdjustments", "sleepAdjustments"],
  ["ProteinAdjustment", "FatigueAdjustment"],
  ["proteinAdjustments", "fatigueAdjustments"],
  // CarbohydrateAdjustment file skipped — ReadinessAdjustment comes from MacroDistribution
  ["CarbohydrateAdjustment", "ReadinessAdjustment"],
  ["carbohydrateAdjustments", "readinessAdjustments"],
  ["FatAdjustment", "HRVAdjustment"],
  ["fatAdjustments", "hrvAdjustments"],
  ["FiberAdjustment", "CardioAdjustment"],
  ["fiberAdjustments", "cardioAdjustments"],
  ["HydrationAdjustment", "StressAdjustment"],
  ["hydrationAdjustments", "stressAdjustments"],
  ["MealTimingAdjustment", "MobilityAdjustment"],
  ["mealTimingAdjustments", "mobilityAdjustments"],
  ["SupplementAdjustment", "StretchingAdjustment"],
  ["supplementAdjustments", "stretchingAdjustments"],
  ["RefeedAdjustment", "DeloadAdjustment"],
  ["refeedAdjustments", "deloadAdjustments"],
  ["DietBreakAdjustment", "RecoveryProtocolAdjustment"],
  ["dietBreakAdjustments", "recoveryProtocolAdjustments"],
  // MacroDistribution → Readiness (MacroAdapter → ReadinessAdapter); file skipped below
  ["freezeMacroDistributionAdjustment", "freezeReadinessAdjustment"],
  ["MacroDistributionAdjustment", "ReadinessAdjustment"],
  ["macroDistributionAdjustments", "readinessAdjustments"],
  ["MealAdjustment", "RecoveryDayAdjustment"],
  ["mealAdjustments", "recoveryDayAdjustments"],
  ["MealReplacement", "RecoveryDayReplacement"],
  ["mealReplacements", "recoveryDayReplacements"],
  ["MealRemoval", "RecoveryDayRemoval"],
  ["mealRemovals", "recoveryDayRemovals"],
  ["MealInsertion", "RecoveryDayInsertion"],
  ["mealInsertions", "recoveryDayInsertions"],
  ["WeeklyAdjustment", "WeeklyAdjustment"],
  ["weeklyAdjustments", "weeklyAdjustments"],

  // Core Nutrition* models → Recovery*
  ["UpdatedNutritionPlan", "UpdatedRecoveryPlan"],
  ["NutritionRuntimeInput", "RecoveryRuntimeInput"],
  ["NutritionAdaptationDecisionRef", "RecoveryAdaptationDecisionRef"],
  ["NutritionAdaptationContext", "RecoveryAdaptationContext"],
  ["NutritionAdaptationInput", "RecoveryAdaptationInput"],
  ["NutritionAdaptationOutput", "RecoveryAdaptationOutput"],
  ["NutritionAdaptationState", "RecoveryAdaptationState"],
  ["NutritionAdaptation", "RecoveryAdaptation"],
  ["NutritionModification", "RecoveryModification"],
  ["NutritionAdjustment", "RecoveryAdjustment"],
  ["NutritionReplacement", "RecoveryReplacement"],
  ["NutritionComparison", "RecoveryComparison"],
  ["NutritionHistory", "RecoveryHistory"],
  ["NutritionTimeline", "RecoveryTimeline"],
  ["NutritionSummary", "RecoverySummary"],
  ["NutritionDiagnostics", "RecoveryDiagnostics"],
  ["NutritionStatistics", "RecoveryStatistics"],
  ["NutritionMetadata", "RecoveryMetadata"],
  ["NutritionPackage", "RecoveryPackage"],
  ["NutritionResult", "RecoveryResult"],
  ["NutritionSnapshot", "RecoverySnapshot"],
  ["NutritionDescriptor", "RecoveryDescriptor"],
  ["NutritionValidation", "RecoveryValidation"],
  ["NutritionError", "RecoveryError"],
  ["NutritionSessionStatuses", "RecoverySessionStatuses"],
  ["NutritionOperationKinds", "RecoveryOperationKinds"],
  ["NutritionErrorCodes", "RecoveryErrorCodes"],
  ["NutritionAdaptationInputKinds", "RecoveryAdaptationInputKinds"],
  ["NutritionModificationKinds", "RecoveryModificationKinds"],
  ["EMPTY_NUTRITION_METADATA", "EMPTY_RECOVERY_METADATA"],
  ["createNutritionError", "createRecoveryError"],

  // Public API
  ["adaptNutrition", "adaptRecovery"],
  ["compareNutrition", "compareRecovery"],
  ["describeNutritionAdaptation", "describeRecoveryAdaptation"],
  ["createNutritionSnapshot", "createRecoverySnapshot"],
  ["validateNutritionAdaptation", "validateRecoveryAdaptation"],
  ["validateNutritionPackage", "validateRecoveryPackage"],

  // Structure keys — keep original dayKeys; map meals → sleepKeys
  ["mealKeys", "sleepKeys"],
  ["macroKeys", "protocolKeys"],
  ["timingKeys", "mobilityKeys"],
  ["calorieKey", "sleepKey"],
  ["proteinKey", "fatigueKey"],
  ["carbohydrateKey", "readinessKey"],
  ["fatKey", "hrvKey"],
  ["fiberKey", "cardioKey"],
  ["hydrationKey", "stressKey"],
  ["timingKey", "mobilityKey"],
  ["supplementKey", "stretchingKey"],
  ["refeedKey", "deloadKey"],
  ["dietBreakKey", "protocolKey"],
  ["macroKey", "readinessKey"],
  ["fromMealKey", "fromDayKey"],
  ["toMealKey", "toDayKey"],
  ["mealKey", "dayKey"],
  ["loadMealKeys", "loadSleepKeys"],
  ["loadMacroKeys", "loadProtocolKeys"],
  ["loadTimingKeys", "loadMobilityKeys"],

  // Prose / comments
  ["nutrition plan", "recovery plan"],
  ["Nutrition Plan", "Recovery Plan"],
  ["nutrition plans", "recovery plans"],
  ["Nutrition plans", "Recovery plans"],
  ["nutrition generation", "recovery generation"],
  ["Nutrition generation", "Recovery generation"],
  ["nutrition from scratch", "recovery from scratch"],
  ["existing nutrition", "existing recovery"],
  ["Existing nutrition", "Existing recovery"],
  ["Updated Nutrition Plan", "Updated Recovery Plan"],
  ["UpdatedNutritionPlan", "UpdatedRecoveryPlan"],
  ["Nutrition Runtime", "Recovery Runtime"],
  ["calorie / macro / hydration", "sleep / fatigue / stress"],
  ["meals / macros / hydration / refeed", "sleep / deload / mobility / stress"],
  ["meal / macro / progress / history", "plan / state / timeline / progress / history"],
  ["recovery nutrition", "recovery"],
  ["adherence", "hrv"],
  ["Adherence", "HRV"],
  ["hydration", "stress"],
  ["Hydration", "Stress"],
  ["calorie", "sleep"],
  ["Calorie", "Sleep"],
  ["macro", "protocol"],
  ["Macro", "Protocol"],
  ["meal-timing", "readiness"],
  ["meal timing", "readiness"],
  ["Meal timing", "Readiness"],
  ["refeed", "deload"],
  ["Refeed", "Deload"],
  ["diet break", "recovery protocol"],
  ["Diet break", "Recovery protocol"],
  ["supplement", "stretching"],
  ["Supplement", "Stretching"],
  ["fiber", "cardio"],
  ["Fiber", "Cardio"],
  ["protein", "fatigue"],
  ["Protein", "Fatigue"],
  ["carbohydrate", "readiness"],
  ["Carbohydrate", "Readiness"],
  [" fat ", " hrv "],
  ["Fat ", "HRV "],
  ["meal", "day"],
  ["Meal", "Day"],
  ["Nutrition", "Recovery"],
  ["nutrition", "recovery"],
];

/** Path-segment renames after content transform (basename). */
const FILE_RENAMES = [
  ["NutritionAdaptationEngineService.ts", "RecoveryAdaptationEngineService.ts"],
  ["NutritionAdaptationCoordinator.ts", "RecoveryAdaptationCoordinator.ts"],
  ["NutritionAdaptationSession.ts", "RecoveryAdaptationSession.ts"],
  ["NutritionAdaptationEngine.ts", "RecoveryAdaptationEngine.ts"],
  ["NutritionAdaptationBuilder.ts", "RecoveryAdaptationBuilder.ts"],
  ["NutritionPackageBuilder.ts", "RecoveryPackageBuilder.ts"],
  ["NutritionSummaryBuilder.ts", "RecoverySummaryBuilder.ts"],
  ["NutritionSnapshotBuilder.ts", "RecoverySnapshotBuilder.ts"],
  ["NutritionAdaptationHelpers.ts", "RecoveryAdaptationHelpers.ts"],
  ["FreezeNutritionAdaptation.ts", "FreezeRecoveryAdaptation.ts"],
  ["NutritionAdaptationPolicy.ts", "RecoveryAdaptationPolicy.ts"],
  ["AdherencePolicy.ts", "SleepPolicy.ts"],
  ["HydrationPolicy.ts", "FatiguePolicy.ts"],
  ["RecoveryNutritionEvaluator.ts", "RecoveryEvaluator.ts"],
  ["CalorieEvaluator.ts", "SleepEvaluator.ts"],
  ["MacroEvaluator.ts", "FatigueEvaluator.ts"],
  ["HydrationEvaluator.ts", "StressEvaluator.ts"],
  ["MealTimingEvaluator.ts", "ReadinessEvaluator.ts"],
  ["AdherenceEvaluator.ts", "HRVEvaluator.ts"],
  ["NutritionPlanner.ts", "RecoveryPlanner.ts"],
  ["MealPlanner.ts", "SleepPlanner.ts"],
  ["MacroPlanner.ts", "DeloadPlanner.ts"],
  ["TimingPlanner.ts", "MobilityPlanner.ts"],
  ["HydrationPlanner.ts", "StressPlanner.ts"],
  ["WeeklyPlanner.ts", "WeekPlanner.ts"],
  ["CalorieAdapter.ts", "SleepAdapter.ts"],
  ["MealAdapter.ts", "RecoveryDayAdapter.ts"],
  ["DietBreakAdapter.ts", "DeloadAdapter.ts"],
  ["TimingAdapter.ts", "MobilityAdapter.ts"],
  ["SupplementAdapter.ts", "StretchingAdapter.ts"],
  ["RefeedAdapter.ts", "CardioAdapter.ts"],
  ["HydrationAdapter.ts", "StressAdapter.ts"],
  ["MacroAdapter.ts", "ReadinessAdapter.ts"],
  ["PlanComparator.ts", "RecoveryPlanComparator.ts"],
  ["HistoryComparator.ts", "RecoveryHistoryComparator.ts"],
  ["MacroComparator.ts", "RecoveryStateComparator.ts"],
  ["MealComparator.ts", "RecoveryTimelineComparator.ts"],
  ["ProgressComparator.ts", "RecoveryProgressComparator.ts"],
  ["NutritionSelector.ts", "RecoverySelector.ts"],
  ["MealSelector.ts", "SleepSelector.ts"],
  ["MacroSelector.ts", "ReadinessSelector.ts"],
  ["TimingSelector.ts", "FatigueSelector.ts"],
  ["NutritionPlanPort.ts", "RecoveryPlanPort.ts"],
  ["NutritionRuntimePort.ts", "RecoveryRuntimePort.ts"],
  ["CalorieAdjustment.ts", "SleepAdjustment.ts"],
  ["ProteinAdjustment.ts", "FatigueAdjustment.ts"],
  ["CarbohydrateAdjustment.ts", "__SKIP_CarbohydrateAdjustment__.ts"],
  ["FatAdjustment.ts", "HRVAdjustment.ts"],
  ["FiberAdjustment.ts", "CardioAdjustment.ts"],
  ["HydrationAdjustment.ts", "StressAdjustment.ts"],
  ["MealTimingAdjustment.ts", "MobilityAdjustment.ts"],
  ["SupplementAdjustment.ts", "StretchingAdjustment.ts"],
  ["RefeedAdjustment.ts", "DeloadAdjustment.ts"],
  ["DietBreakAdjustment.ts", "RecoveryProtocolAdjustment.ts"],
  ["MacroDistributionAdjustment.ts", "ReadinessAdjustment.ts"],
  ["MealAdjustment.ts", "RecoveryDayAdjustment.ts"],
  ["MealReplacement.ts", "RecoveryDayReplacement.ts"],
  ["MealRemoval.ts", "RecoveryDayRemoval.ts"],
  ["MealInsertion.ts", "RecoveryDayInsertion.ts"],
  ["UpdatedNutritionPlan.ts", "UpdatedRecoveryPlan.ts"],
  ["NutritionRuntimeInput.ts", "RecoveryRuntimeInput.ts"],
  ["NutritionAdaptationDecisionRef.ts", "RecoveryAdaptationDecisionRef.ts"],
  ["NutritionAdaptationContext.ts", "RecoveryAdaptationContext.ts"],
  ["NutritionAdaptationInput.ts", "RecoveryAdaptationInput.ts"],
  ["NutritionAdaptationOutput.ts", "RecoveryAdaptationOutput.ts"],
  ["NutritionAdaptationState.ts", "RecoveryAdaptationState.ts"],
  ["NutritionAdaptation.ts", "RecoveryAdaptation.ts"],
  ["NutritionModification.ts", "RecoveryModification.ts"],
  ["NutritionAdjustment.ts", "RecoveryAdjustment.ts"],
  ["NutritionReplacement.ts", "RecoveryReplacement.ts"],
  ["NutritionComparison.ts", "RecoveryComparison.ts"],
  ["NutritionHistory.ts", "RecoveryHistory.ts"],
  ["NutritionTimeline.ts", "RecoveryTimeline.ts"],
  ["NutritionSummary.ts", "RecoverySummary.ts"],
  ["NutritionDiagnostics.ts", "RecoveryDiagnostics.ts"],
  ["NutritionStatistics.ts", "RecoveryStatistics.ts"],
  ["NutritionMetadata.ts", "RecoveryMetadata.ts"],
  ["NutritionPackage.ts", "RecoveryPackage.ts"],
  ["NutritionResult.ts", "RecoveryResult.ts"],
  ["NutritionSnapshot.ts", "RecoverySnapshot.ts"],
  ["NutritionDescriptor.ts", "RecoveryDescriptor.ts"],
  ["NutritionValidation.ts", "RecoveryValidation.ts"],
  ["NutritionError.ts", "RecoveryError.ts"],
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

/** Deduplicate import-type symbols, export* lines, and interface/param readonly fields. */
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

/** Remove duplicate object-literal properties named `key` (keeps first). */
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
  const normalized = rel.replace(/\\/g, "/");
  const origBase = path.posix.basename(normalized);
  const dir = path.posix.dirname(normalized);
  // Prefer exact original basename mapping (avoids Carbohydrate/MacroDistribution collisions)
  for (const [from, to] of FILE_RENAMES) {
    if (origBase === from) {
      const destDir = transformText(dir === "." ? "" : dir);
      return destDir ? `${destDir}/${to}` : to;
    }
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

  // Skip CarbohydrateAdjustment model file (ReadinessAdjustment comes from MacroDistribution)
  if (destRel.includes("__SKIP_")) continue;

  // Deduplicate if two sources map to same dest
  if (writtenPaths.has(destRel)) continue;
  writtenPaths.add(destRel);

  const content = fs.readFileSync(full, "utf8");
  let transformed = transformText(content);

  // Fix double-transforms / known collisions after aggressive replaces
  transformed = transformed
    .replace(/RecoveryRecovery/g, "Recovery")
    .replace(/recoveryRecovery/g, "recovery")
    .replace(/recovery-recovery/g, "recovery")
    .replace(/SleepSleep/g, "Sleep")
    .replace(/FatigueFatigue/g, "Fatigue")
    .replace(/StressStress/g, "Stress")
    .replace(/ReadinessReadiness/g, "Readiness")
    .replace(/DeloadDeload/g, "Deload")
    .replace(/HRVHRV/g, "HRV")
    .replace(/CardioCardio/g, "Cardio")
    .replace(/StretchingStretching/g, "Stretching")
    .replace(/MobilityMobility/g, "Mobility")
    .replace(/ProtocolProtocol/g, "Protocol")
    .replace(/dayday/g, "day")
    .replace(/DayDay/g, "Day")
    .replace(/EMPTY_RECOVERY_METADATA_METADATA/g, "EMPTY_RECOVERY_METADATA")
    .replace(/dayTiming/g, "readiness")
    ;

  // Deduplicate imports / interface fields only
  if (destRel.endsWith(".ts")) {
    transformed = dedupeTsSource(transformed);
  }

  // Targeted duplicate property cleanup
  if (destRel === "builders/RecoveryAdaptationBuilder.ts") {
    transformed = dropDuplicateObjectProps(transformed, "readinessAdjustments");
  }
  if (destRel === "utils/FreezeRecoveryAdaptation.ts") {
    transformed = dropDuplicateObjectProps(transformed, "readinessAdjustments");
    const fn = "export function freezeReadinessAdjustment";
    const first = transformed.indexOf(fn);
    const second = transformed.indexOf(fn, first + 1);
    if (first >= 0 && second >= 0) {
      const after = transformed.slice(second);
      const nextExport = after.indexOf("\nexport function ", 1);
      const end = nextExport >= 0 ? second + nextExport : transformed.length;
      transformed = transformed.slice(0, second) + transformed.slice(end);
    }
  }
  if (destRel === "evaluation/RecoveryEvaluator.ts") {
    transformed = transformed
      .replace(
        /Object\.freeze\(\{[^}]*\}\)/,
        'Object.freeze({ recovery: 0, "state:recovery": 0 })',
      )
      .replace(
        /Object\.freeze\(\[[^\]]*\]\)/,
        'Object.freeze(["recovery", "state:recovery"])',
      );
  }
  if (destRel === "utils/StatisticsHelpers.ts") {
    // Avoid double-counting readiness after carb+macro merge
    transformed = transformed.replace(
      /adaptation\.readinessAdjustments\.length \+\s*\n\s*adaptation\.readinessAdjustments\.length/g,
      "adaptation.readinessAdjustments.length",
    );
  }

  // models/index: drop skipped module exports
  if (destRel === "models/index.ts") {
    transformed = transformed
      .split("\n")
      .filter((l) => !l.includes("__SKIP_"))
      .join("\n");
    if (!transformed.endsWith("\n")) transformed += "\n";
    if (!transformed.includes('export * from "./ReadinessAdjustment"')) {
      transformed = transformed.replace(
        'export * from "./SleepAdjustment";',
        'export * from "./SleepAdjustment";\nexport * from "./ReadinessAdjustment";',
      );
    }
  }

  const dest = path.join(DST, destRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, transformed.replace(/\r?\n/g, "\n"), "utf8");
  written++;
}

console.log(`Wrote ${written} files to ${DST}`);

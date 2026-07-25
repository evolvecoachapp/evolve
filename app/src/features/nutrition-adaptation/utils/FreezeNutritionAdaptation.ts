import type { AthleteStateRef } from "../models/AthleteStateRef";
import type { CalorieAdjustment } from "../models/CalorieAdjustment";
import type { CarbohydrateAdjustment } from "../models/CarbohydrateAdjustment";
import type { CoachContextRef } from "../models/CoachContextRef";
import type { DietBreakAdjustment } from "../models/DietBreakAdjustment";
import type { FatAdjustment } from "../models/FatAdjustment";
import type { FiberAdjustment } from "../models/FiberAdjustment";
import type { HydrationAdjustment } from "../models/HydrationAdjustment";
import type { MacroDistributionAdjustment } from "../models/MacroDistributionAdjustment";
import type { MealAdjustment } from "../models/MealAdjustment";
import type { MealInsertion } from "../models/MealInsertion";
import type { MealRemoval } from "../models/MealRemoval";
import type { MealReplacement } from "../models/MealReplacement";
import type { MealTimingAdjustment } from "../models/MealTimingAdjustment";
import type { NutritionAdaptation } from "../models/NutritionAdaptation";
import type { NutritionAdaptationContext } from "../models/NutritionAdaptationContext";
import type { NutritionAdaptationDecisionRef } from "../models/NutritionAdaptationDecisionRef";
import type { NutritionAdaptationInput } from "../models/NutritionAdaptationInput";
import type { NutritionAdaptationOutput } from "../models/NutritionAdaptationOutput";
import type { NutritionAdaptationState } from "../models/NutritionAdaptationState";
import type { NutritionAdjustment } from "../models/NutritionAdjustment";
import type { NutritionComparison } from "../models/NutritionComparison";
import type { NutritionDescriptor } from "../models/NutritionDescriptor";
import type { NutritionDiagnostics } from "../models/NutritionDiagnostics";
import type { NutritionHistory, NutritionHistoryEntry } from "../models/NutritionHistory";
import type { NutritionMetadata } from "../models/NutritionMetadata";
import type { NutritionModification } from "../models/NutritionModification";
import type { NutritionPackage } from "../models/NutritionPackage";
import type { NutritionReplacement } from "../models/NutritionReplacement";
import type { NutritionResult } from "../models/NutritionResult";
import type { NutritionRuntimeInput } from "../models/NutritionRuntimeInput";
import type { NutritionSnapshot } from "../models/NutritionSnapshot";
import type { NutritionStatistics } from "../models/NutritionStatistics";
import type { NutritionSummary } from "../models/NutritionSummary";
import type { NutritionTimeline, NutritionTimelineItem } from "../models/NutritionTimeline";
import type { NutritionValidation } from "../models/NutritionValidation";
import type { PlanRef } from "../models/PlanRef";
import type { ProteinAdjustment } from "../models/ProteinAdjustment";
import type { RefeedAdjustment } from "../models/RefeedAdjustment";
import type { RuntimeRef } from "../models/RuntimeRef";
import type { SupplementAdjustment } from "../models/SupplementAdjustment";
import type { UpdatedNutritionPlan } from "../models/UpdatedNutritionPlan";
import type { WeeklyAdjustment } from "../models/WeeklyAdjustment";

export function freezeMetadata(m: NutritionMetadata): NutritionMetadata {
  return Object.freeze({
    tags: Object.freeze([...m.tags]),
    attributes: Object.freeze({ ...m.attributes }),
  });
}

export function freezePlanRef(r: PlanRef): PlanRef {
  return Object.freeze({ ...r, keys: Object.freeze([...r.keys]) });
}

export function freezeRuntimeRef(r: RuntimeRef): RuntimeRef {
  return Object.freeze({ ...r, keys: Object.freeze([...r.keys]) });
}

export function freezeAthleteStateRef(r: AthleteStateRef): AthleteStateRef {
  return Object.freeze({ ...r, stateKeys: Object.freeze([...r.stateKeys]) });
}

export function freezeCoachContextRef(r: CoachContextRef): CoachContextRef {
  return Object.freeze({ ...r, keys: Object.freeze([...r.keys]) });
}

export function freezeDecisionRef(r: NutritionAdaptationDecisionRef): NutritionAdaptationDecisionRef {
  return Object.freeze({
    ...r,
    decisionIds: Object.freeze([...r.decisionIds]),
    decisionKeys: Object.freeze([...r.decisionKeys]),
  });
}

export function freezeModification(m: NutritionModification): NutritionModification {
  return Object.freeze({
    ...m,
    sourceDecisionKeys: Object.freeze([...m.sourceDecisionKeys]),
    planStepKeys: Object.freeze([...m.planStepKeys]),
    metadata: freezeMetadata(m.metadata),
  });
}

export function freezeAdjustment(a: NutritionAdjustment): NutritionAdjustment {
  return Object.freeze({
    ...a,
    sourceDecisionKeys: Object.freeze([...a.sourceDecisionKeys]),
    metadata: freezeMetadata(a.metadata),
  });
}

export function freezeReplacement(r: NutritionReplacement): NutritionReplacement {
  return Object.freeze({
    ...r,
    sourceDecisionKeys: Object.freeze([...r.sourceDecisionKeys]),
    metadata: freezeMetadata(r.metadata),
  });
}

function freezeKeyedAdjustment<T extends {
  readonly sourceDecisionKeys: readonly string[];
  readonly planStepKeys: readonly string[];
  readonly metadata: NutritionMetadata;
}>(a: T): T {
  return Object.freeze({
    ...a,
    sourceDecisionKeys: Object.freeze([...a.sourceDecisionKeys]),
    planStepKeys: Object.freeze([...a.planStepKeys]),
    metadata: freezeMetadata(a.metadata),
  });
}

export function freezeMealAdjustment(a: MealAdjustment): MealAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeMealReplacement(a: MealReplacement): MealReplacement {
  return Object.freeze({
    ...a,
    sourceDecisionKeys: Object.freeze([...a.sourceDecisionKeys]),
    planStepKeys: Object.freeze([...a.planStepKeys]),
    metadata: freezeMetadata(a.metadata),
  });
}
export function freezeMealRemoval(a: MealRemoval): MealRemoval {
  return freezeKeyedAdjustment(a);
}
export function freezeMealInsertion(a: MealInsertion): MealInsertion {
  return freezeKeyedAdjustment(a);
}
export function freezeCalorieAdjustment(a: CalorieAdjustment): CalorieAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeProteinAdjustment(a: ProteinAdjustment): ProteinAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeCarbohydrateAdjustment(a: CarbohydrateAdjustment): CarbohydrateAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeFatAdjustment(a: FatAdjustment): FatAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeFiberAdjustment(a: FiberAdjustment): FiberAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeHydrationAdjustment(a: HydrationAdjustment): HydrationAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeMealTimingAdjustment(a: MealTimingAdjustment): MealTimingAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeSupplementAdjustment(a: SupplementAdjustment): SupplementAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeRefeedAdjustment(a: RefeedAdjustment): RefeedAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeDietBreakAdjustment(a: DietBreakAdjustment): DietBreakAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeMacroDistributionAdjustment(a: MacroDistributionAdjustment): MacroDistributionAdjustment {
  return freezeKeyedAdjustment(a);
}
export function freezeWeeklyAdjustment(a: WeeklyAdjustment): WeeklyAdjustment {
  return freezeKeyedAdjustment(a);
}

export function freezeSnapshot(s: NutritionSnapshot): NutritionSnapshot {
  return Object.freeze({
    ...s,
    planKeys: Object.freeze([...s.planKeys]),
    dayKeys: Object.freeze([...s.dayKeys]),
    mealKeys: Object.freeze([...s.mealKeys]),
    macroKeys: Object.freeze([...s.macroKeys]),
    timingKeys: Object.freeze([...s.timingKeys]),
    weekKeys: Object.freeze([...s.weekKeys]),
    modificationIds: Object.freeze([...s.modificationIds]),
    metadata: freezeMetadata(s.metadata),
  });
}

export function freezeInput(i: NutritionAdaptationInput): NutritionAdaptationInput {
  return Object.freeze({
    ...i,
    planKeys: Object.freeze([...i.planKeys]),
    dayKeys: Object.freeze([...i.dayKeys]),
    mealKeys: Object.freeze([...i.mealKeys]),
    macroKeys: Object.freeze([...i.macroKeys]),
    timingKeys: Object.freeze([...i.timingKeys]),
    weekKeys: Object.freeze([...i.weekKeys]),
    decisionKeys: Object.freeze([...i.decisionKeys]),
    signalKeys: Object.freeze([...i.signalKeys]),
    signalFlags: Object.freeze({ ...i.signalFlags }),
    priorSnapshot: i.priorSnapshot ? freezeSnapshot(i.priorSnapshot) : null,
    decisionRef: i.decisionRef ? freezeDecisionRef(i.decisionRef) : null,
    planRef: i.planRef ? freezePlanRef(i.planRef) : null,
    runtimeRef: i.runtimeRef ? freezeRuntimeRef(i.runtimeRef) : null,
    athleteStateRef: i.athleteStateRef ? freezeAthleteStateRef(i.athleteStateRef) : null,
    coachContextRef: i.coachContextRef ? freezeCoachContextRef(i.coachContextRef) : null,
    metadata: freezeMetadata(i.metadata),
  });
}

export function freezeContext(c: NutritionAdaptationContext): NutritionAdaptationContext {
  return Object.freeze({
    ...c,
    signalKeys: Object.freeze([...c.signalKeys]),
    planRef: c.planRef ? freezePlanRef(c.planRef) : null,
    runtimeRef: c.runtimeRef ? freezeRuntimeRef(c.runtimeRef) : null,
    athleteStateRef: c.athleteStateRef ? freezeAthleteStateRef(c.athleteStateRef) : null,
    coachContextRef: c.coachContextRef ? freezeCoachContextRef(c.coachContextRef) : null,
    decisionRef: c.decisionRef ? freezeDecisionRef(c.decisionRef) : null,
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeAdaptation(a: NutritionAdaptation): NutritionAdaptation {
  return Object.freeze({
    ...a,
    decisionKeys: Object.freeze([...a.decisionKeys]),
    signalKeys: Object.freeze([...a.signalKeys]),
    modifications: Object.freeze(a.modifications.map(freezeModification)),
    adjustments: Object.freeze(a.adjustments.map(freezeAdjustment)),
    replacements: Object.freeze(a.replacements.map(freezeReplacement)),
    mealAdjustments: Object.freeze(a.mealAdjustments.map(freezeMealAdjustment)),
    mealReplacements: Object.freeze(a.mealReplacements.map(freezeMealReplacement)),
    mealRemovals: Object.freeze(a.mealRemovals.map(freezeMealRemoval)),
    mealInsertions: Object.freeze(a.mealInsertions.map(freezeMealInsertion)),
    calorieAdjustments: Object.freeze(a.calorieAdjustments.map(freezeCalorieAdjustment)),
    proteinAdjustments: Object.freeze(a.proteinAdjustments.map(freezeProteinAdjustment)),
    carbohydrateAdjustments: Object.freeze(a.carbohydrateAdjustments.map(freezeCarbohydrateAdjustment)),
    fatAdjustments: Object.freeze(a.fatAdjustments.map(freezeFatAdjustment)),
    fiberAdjustments: Object.freeze(a.fiberAdjustments.map(freezeFiberAdjustment)),
    hydrationAdjustments: Object.freeze(a.hydrationAdjustments.map(freezeHydrationAdjustment)),
    mealTimingAdjustments: Object.freeze(a.mealTimingAdjustments.map(freezeMealTimingAdjustment)),
    supplementAdjustments: Object.freeze(a.supplementAdjustments.map(freezeSupplementAdjustment)),
    refeedAdjustments: Object.freeze(a.refeedAdjustments.map(freezeRefeedAdjustment)),
    dietBreakAdjustments: Object.freeze(a.dietBreakAdjustments.map(freezeDietBreakAdjustment)),
    macroDistributionAdjustments: Object.freeze(a.macroDistributionAdjustments.map(freezeMacroDistributionAdjustment)),
    weeklyAdjustments: Object.freeze(a.weeklyAdjustments.map(freezeWeeklyAdjustment)),
    metadata: freezeMetadata(a.metadata),
  });
}

export function freezeUpdatedPlan(b: UpdatedNutritionPlan): UpdatedNutritionPlan {
  return Object.freeze({
    ...b,
    dayKeys: Object.freeze([...b.dayKeys]),
    mealKeys: Object.freeze([...b.mealKeys]),
    macroKeys: Object.freeze([...b.macroKeys]),
    timingKeys: Object.freeze([...b.timingKeys]),
    weekKeys: Object.freeze([...b.weekKeys]),
    modificationIds: Object.freeze([...b.modificationIds]),
    metadata: freezeMetadata(b.metadata),
  });
}

export function freezeRuntimeInput(r: NutritionRuntimeInput): NutritionRuntimeInput {
  return Object.freeze({
    ...r,
    mealKeys: Object.freeze([...r.mealKeys]),
    macroKeys: Object.freeze([...r.macroKeys]),
    modificationIds: Object.freeze([...r.modificationIds]),
    metadata: freezeMetadata(r.metadata),
  });
}

export function freezeComparison(c: NutritionComparison): NutritionComparison {
  return Object.freeze({
    ...c,
    beforeKeys: Object.freeze([...c.beforeKeys]),
    afterKeys: Object.freeze([...c.afterKeys]),
    addedKeys: Object.freeze([...c.addedKeys]),
    removedKeys: Object.freeze([...c.removedKeys]),
    sharedKeys: Object.freeze([...c.sharedKeys]),
    metadata: freezeMetadata(c.metadata),
  });
}

export function freezeHistoryEntry(e: NutritionHistoryEntry): NutritionHistoryEntry {
  return Object.freeze({ ...e, keys: Object.freeze([...e.keys]) });
}

export function freezeHistory(h: NutritionHistory): NutritionHistory {
  return Object.freeze({
    ...h,
    entries: Object.freeze(h.entries.map(freezeHistoryEntry)),
    historyKeys: Object.freeze([...h.historyKeys]),
    metadata: freezeMetadata(h.metadata),
  });
}

export function freezeTimelineItem(i: NutritionTimelineItem): NutritionTimelineItem {
  return Object.freeze({ ...i, keys: Object.freeze([...i.keys]) });
}

export function freezeTimeline(t: NutritionTimeline): NutritionTimeline {
  return Object.freeze({
    ...t,
    items: Object.freeze(t.items.map(freezeTimelineItem)),
    metadata: freezeMetadata(t.metadata),
  });
}

export function freezeSummary(s: NutritionSummary): NutritionSummary {
  return Object.freeze({
    ...s,
    decisionKeys: Object.freeze([...s.decisionKeys]),
    metadata: freezeMetadata(s.metadata),
  });
}

export function freezeDiagnostics(d: NutritionDiagnostics): NutritionDiagnostics {
  return Object.freeze({
    notes: Object.freeze([...d.notes]),
    warnings: Object.freeze([...d.warnings]),
    processingSteps: Object.freeze([...d.processingSteps]),
  });
}

export function freezeStatistics(s: NutritionStatistics): NutritionStatistics {
  return Object.freeze({ ...s });
}

export function freezeDescriptor(d: NutritionDescriptor): NutritionDescriptor {
  return Object.freeze({
    ...d,
    capabilities: Object.freeze([...d.capabilities]),
    boundaries: Object.freeze([...d.boundaries]),
  });
}

export function freezeValidation(v: NutritionValidation): NutritionValidation {
  return Object.freeze({
    valid: v.valid,
    issues: Object.freeze([...v.issues]),
  });
}

export function freezePackage(p: NutritionPackage): NutritionPackage {
  return Object.freeze({
    ...p,
    adaptation: p.adaptation ? freezeAdaptation(p.adaptation) : null,
    updatedPlan: p.updatedPlan ? freezeUpdatedPlan(p.updatedPlan) : null,
    runtimeInput: p.runtimeInput ? freezeRuntimeInput(p.runtimeInput) : null,
    summary: p.summary ? freezeSummary(p.summary) : null,
    snapshot: p.snapshot ? freezeSnapshot(p.snapshot) : null,
    comparison: p.comparison ? freezeComparison(p.comparison) : null,
    timeline: p.timeline ? freezeTimeline(p.timeline) : null,
    history: p.history ? freezeHistory(p.history) : null,
    statistics: freezeStatistics(p.statistics),
    diagnostics: freezeDiagnostics(p.diagnostics),
    metadata: freezeMetadata(p.metadata),
  });
}

export function freezeOutput(o: NutritionAdaptationOutput): NutritionAdaptationOutput {
  return Object.freeze({
    ...o,
    adaptation: o.adaptation ? freezeAdaptation(o.adaptation) : null,
    updatedPlan: o.updatedPlan ? freezeUpdatedPlan(o.updatedPlan) : null,
    runtimeInput: o.runtimeInput ? freezeRuntimeInput(o.runtimeInput) : null,
    package: o.package ? freezePackage(o.package) : null,
    summary: o.summary ? freezeSummary(o.summary) : null,
    snapshot: o.snapshot ? freezeSnapshot(o.snapshot) : null,
  });
}

export function freezeState(s: NutritionAdaptationState): NutritionAdaptationState {
  return Object.freeze({
    ...s,
    package: s.package ? freezePackage(s.package) : null,
    adaptation: s.adaptation ? freezeAdaptation(s.adaptation) : null,
  });
}

export function freezeResult(r: NutritionResult): NutritionResult {
  return Object.freeze({
    ...r,
    adaptation: r.adaptation ? freezeAdaptation(r.adaptation) : null,
    updatedPlan: r.updatedPlan ? freezeUpdatedPlan(r.updatedPlan) : null,
    runtimeInput: r.runtimeInput ? freezeRuntimeInput(r.runtimeInput) : null,
    package: r.package ? freezePackage(r.package) : null,
    summary: r.summary ? freezeSummary(r.summary) : null,
    snapshot: r.snapshot ? freezeSnapshot(r.snapshot) : null,
    comparison: r.comparison ? freezeComparison(r.comparison) : null,
    validation: r.validation ? freezeValidation(r.validation) : null,
    descriptor: r.descriptor ? freezeDescriptor(r.descriptor) : null,
    errors: Object.freeze([...r.errors]),
  });
}
